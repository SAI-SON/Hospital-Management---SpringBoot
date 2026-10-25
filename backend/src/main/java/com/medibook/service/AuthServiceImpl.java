package com.medibook.service;

import com.medibook.dto.*;
import com.medibook.email.EmailService;
import com.medibook.entity.*;
import com.medibook.exception.*;
import com.medibook.repository.*;
import com.medibook.security.JwtTokenProvider;
import com.medibook.security.UserPrincipal;
import com.medibook.util.TokenHashUtil;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final EmailVerificationTokenRepository emailVerificationTokenRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final EmailService emailService;

    @Value("${medibook.jwt.cookie-name:medibook_refresh_token}")
    private String refreshCookieName = "medibook_refresh_token";

    private static final int MAX_FAILED_ATTEMPTS = 5;
    private static final long LOCK_TIME_DURATION_MINUTES = 30;

    @Override
    @Transactional
    public ApiResponse<String> signup(SignupRequest request) {
        String normalizedEmail = request.getEmail().trim().toLowerCase();

        if (userRepository.existsByEmailAndIsDeletedFalse(normalizedEmail)) {
            throw new ConflictException("An account with this email address already exists");
        }

        Role patientRole = roleRepository.findByName(RoleName.ROLE_PATIENT)
                .orElseThrow(() -> new ResourceNotFoundException("Role not found: ROLE_PATIENT"));

        User user = User.builder()
                .email(normalizedEmail)
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .role(patientRole)
                .status(UserStatus.ACTIVE)
                .failedLoginAttempts(0)
                .build();

        User savedUser = userRepository.save(user);

        Patient patient = Patient.builder()
                .user(savedUser)
                .fullName(request.getFullName().trim())
                .phoneNumber(request.getPhoneNumber() != null ? request.getPhoneNumber().trim() : null)
                .build();

        patientRepository.save(patient);

        // Generate email verification token (24 hours)
        String rawToken = UUID.randomUUID().toString();
        String tokenHash = TokenHashUtil.hashToken(rawToken);

        EmailVerificationToken verificationToken = EmailVerificationToken.builder()
                .user(savedUser)
                .tokenHash(tokenHash)
                .expiresAt(Instant.now().plus(Duration.ofHours(24)))
                .build();

        emailVerificationTokenRepository.save(verificationToken);

        // Send Async verification email
        emailService.sendVerificationEmail(savedUser.getEmail(), patient.getFullName(), rawToken);

        return ApiResponse.success("Registration successful! A verification email has been dispatched to your inbox.");
    }

    @Override
    @Transactional
    public ApiResponse<String> verifyEmail(String rawToken) {
        if (rawToken == null || rawToken.isBlank()) {
            throw new BadRequestException("Verification token is required");
        }

        String tokenHash = TokenHashUtil.hashToken(rawToken.trim());
        EmailVerificationToken token = emailVerificationTokenRepository.findByTokenHash(tokenHash)
                .orElseThrow(() -> new InvalidTokenException("Invalid or non-existent verification token"));

        if (token.isUsed()) {
            throw new BadRequestException("This verification link has already been used");
        }

        if (token.isExpired()) {
            throw new InvalidTokenException("Verification token has expired. Please request a new verification link.");
        }

        User user = token.getUser();
        user.setStatus(UserStatus.ACTIVE);
        userRepository.save(user);

        token.setUsedAt(Instant.now());
        emailVerificationTokenRepository.save(token);

        return ApiResponse.success("Email successfully verified! You may now sign in to your MediBook account.");
    }

    @Override
    @Transactional
    public AuthResponse login(LoginRequest request, HttpServletResponse response) {
        String normalizedEmail = request.getEmail().trim().toLowerCase();

        User user = userRepository.findByEmailAndIsDeletedFalse(normalizedEmail)
                .orElseThrow(() -> new BadCredentialsException("Invalid email or password"));

        // Check if account is locked
        if (user.getStatus() == UserStatus.LOCKED) {
            if (user.getLockUntil() != null && user.getLockUntil().isAfter(Instant.now())) {
                throw new AccountLockedException("Your account is locked due to 5 consecutive failed login attempts. Please try again after " + user.getLockUntil());
            } else {
                // Lock expired, unlock automatically
                user.setStatus(UserStatus.ACTIVE);
                user.setFailedLoginAttempts(0);
                user.setLockUntil(null);
                userRepository.save(user);
            }
        }

        // Verify password
        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            int newAttempts = user.getFailedLoginAttempts() + 1;
            user.setFailedLoginAttempts(newAttempts);

            if (newAttempts >= MAX_FAILED_ATTEMPTS) {
                user.setStatus(UserStatus.LOCKED);
                user.setLockUntil(Instant.now().plus(Duration.ofMinutes(LOCK_TIME_DURATION_MINUTES)));
                userRepository.save(user);
                throw new AccountLockedException("Account locked due to 5 consecutive failed login attempts. Please try again in 30 minutes.");
            }

            userRepository.save(user);
            throw new BadCredentialsException("Invalid email or password");
        }

        // Check if verified
        if (user.getStatus() == UserStatus.PENDING_VERIFICATION) {
            throw new BadRequestException("Please verify your email address before logging in. Check your inbox for the activation link.");
        }

        // Reset failed login attempts on successful authentication
        user.setFailedLoginAttempts(0);
        user.setLockUntil(null);
        userRepository.save(user);

        UserPrincipal principal = UserPrincipal.create(user);
        String accessToken = jwtTokenProvider.generateAccessToken(principal);

        // Generate Refresh Token with token rotation
        String rawRefreshToken = UUID.randomUUID().toString();
        String refreshTokenHash = TokenHashUtil.hashToken(rawRefreshToken);

        RefreshToken refreshToken = RefreshToken.builder()
                .user(user)
                .tokenHash(refreshTokenHash)
                .expiresAt(Instant.now().plusMillis(jwtTokenProvider.getRefreshExpirationMs()))
                .revoked(false)
                .build();

        refreshTokenRepository.save(refreshToken);

        // Set httpOnly Cookie
        setRefreshTokenCookie(response, rawRefreshToken, (int) (jwtTokenProvider.getRefreshExpirationMs() / 1000));

        UserSummaryDto userSummary = buildUserSummary(user);

        return AuthResponse.builder()
                .accessToken(accessToken)
                .tokenType("Bearer")
                .expiresIn(jwtTokenProvider.getAccessExpirationMs() / 1000)
                .user(userSummary)
                .build();
    }

    @Override
    @Transactional
    public AuthResponse refreshAccessToken(String rawRefreshToken, HttpServletResponse response) {
        if (rawRefreshToken == null || rawRefreshToken.isBlank()) {
            throw new InvalidTokenException("Refresh token is missing");
        }

        String tokenHash = TokenHashUtil.hashToken(rawRefreshToken.trim());
        RefreshToken oldToken = refreshTokenRepository.findByTokenHash(tokenHash)
                .orElseThrow(() -> new InvalidTokenException("Refresh token not found"));

        User user = oldToken.getUser();

        // Token Reuse Detection: If someone presents an already revoked token, breach possible -> revoke all tokens
        if (oldToken.isRevoked()) {
            log.warn("Token reuse detected for user {}. Revoking all active tokens.", user.getEmail());
            refreshTokenRepository.revokeAllUserTokens(user);
            clearRefreshTokenCookie(response);
            throw new InvalidTokenException("Invalid refresh token. Session terminated.");
        }

        if (oldToken.isExpired()) {
            clearRefreshTokenCookie(response);
            throw new InvalidTokenException("Refresh token has expired. Please sign in again.");
        }

        // Rotate token: revoke old token and record replacement
        String newRawRefreshToken = UUID.randomUUID().toString();
        String newTokenHash = TokenHashUtil.hashToken(newRawRefreshToken);

        oldToken.setRevoked(true);
        oldToken.setReplacedByToken(newTokenHash);
        refreshTokenRepository.save(oldToken);

        RefreshToken newRefreshToken = RefreshToken.builder()
                .user(user)
                .tokenHash(newTokenHash)
                .expiresAt(Instant.now().plusMillis(jwtTokenProvider.getRefreshExpirationMs()))
                .revoked(false)
                .build();

        refreshTokenRepository.save(newRefreshToken);

        // Set new cookie
        setRefreshTokenCookie(response, newRawRefreshToken, (int) (jwtTokenProvider.getRefreshExpirationMs() / 1000));

        UserPrincipal principal = UserPrincipal.create(user);
        String newAccessToken = jwtTokenProvider.generateAccessToken(principal);

        return AuthResponse.builder()
                .accessToken(newAccessToken)
                .tokenType("Bearer")
                .expiresIn(jwtTokenProvider.getAccessExpirationMs() / 1000)
                .user(buildUserSummary(user))
                .build();
    }

    @Override
    @Transactional
    public ApiResponse<String> logout(String rawRefreshToken, HttpServletResponse response) {
        if (rawRefreshToken != null && !rawRefreshToken.isBlank()) {
            String tokenHash = TokenHashUtil.hashToken(rawRefreshToken.trim());
            refreshTokenRepository.findByTokenHash(tokenHash).ifPresent(token -> {
                token.setRevoked(true);
                refreshTokenRepository.save(token);
            });
        }

        clearRefreshTokenCookie(response);
        return ApiResponse.success("Successfully logged out");
    }

    @Override
    @Transactional
    public ApiResponse<String> forgotPassword(ForgotPasswordRequest request) {
        String normalizedEmail = request.getEmail().trim().toLowerCase();

        userRepository.findByEmailAndIsDeletedFalse(normalizedEmail).ifPresent(user -> {
            passwordResetTokenRepository.deleteByUser(user);

            String rawToken = UUID.randomUUID().toString();
            String tokenHash = TokenHashUtil.hashToken(rawToken);

            PasswordResetToken resetToken = PasswordResetToken.builder()
                    .user(user)
                    .tokenHash(tokenHash)
                    .expiresAt(Instant.now().plus(Duration.ofMinutes(30)))
                    .build();

            passwordResetTokenRepository.save(resetToken);

            String name = resolveUserDisplayName(user);
            emailService.sendPasswordResetEmail(user.getEmail(), name, rawToken);
        });

        // Always return generic message to prevent user enumeration
        return ApiResponse.success("If an account exists with that email address, a password reset link has been dispatched.");
    }

    @Override
    @Transactional
    public ApiResponse<String> resetPassword(ResetPasswordRequest request) {
        String tokenHash = TokenHashUtil.hashToken(request.getToken().trim());
        PasswordResetToken resetToken = passwordResetTokenRepository.findByTokenHash(tokenHash)
                .orElseThrow(() -> new InvalidTokenException("Invalid or expired password reset link"));

        if (resetToken.isUsed() || resetToken.isExpired()) {
            throw new InvalidTokenException("Password reset link has expired or has already been used");
        }

        User user = resetToken.getUser();
        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        user.setFailedLoginAttempts(0);
        user.setLockUntil(null);
        if (user.getStatus() == UserStatus.LOCKED) {
            user.setStatus(UserStatus.ACTIVE);
        }
        userRepository.save(user);

        resetToken.setUsedAt(Instant.now());
        passwordResetTokenRepository.save(resetToken);

        // Invalidate all active sessions upon password reset
        refreshTokenRepository.revokeAllUserTokens(user);

        emailService.sendPasswordResetConfirmation(user.getEmail(), resolveUserDisplayName(user));

        return ApiResponse.success("Password has been reset successfully. You can now login with your new password.");
    }

    @Override
    @Transactional
    public ApiResponse<String> changePassword(Long userId, ChangePasswordRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPasswordHash())) {
            throw new BadRequestException("Current password does not match");
        }

        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        emailService.sendPasswordResetConfirmation(user.getEmail(), resolveUserDisplayName(user));

        return ApiResponse.success("Password changed successfully");
    }

    @Override
    @Transactional(readOnly = true)
    public UserSummaryDto getCurrentUser(UserPrincipal principal) {
        User user = userRepository.findById(principal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        return buildUserSummary(user);
    }

    private UserSummaryDto buildUserSummary(User user) {
        String fullName = resolveUserDisplayName(user);
        Long profileId = null;
        String avatarUrl = null;

        if (user.getRole().getName() == RoleName.ROLE_PATIENT) {
            var patientOpt = patientRepository.findByUser(user);
            if (patientOpt.isPresent()) {
                profileId = patientOpt.get().getId();
                avatarUrl = patientOpt.get().getAvatarUrl();
            }
        } else if (user.getRole().getName() == RoleName.ROLE_DOCTOR) {
            var doctorOpt = doctorRepository.findByUser(user);
            if (doctorOpt.isPresent()) {
                profileId = doctorOpt.get().getId();
                avatarUrl = doctorOpt.get().getAvatarUrl();
            }
        }

        return UserSummaryDto.builder()
                .id(user.getId())
                .email(user.getEmail())
                .role(user.getRole().getName().name())
                .status(user.getStatus().name())
                .fullName(fullName)
                .profileId(profileId)
                .avatarUrl(avatarUrl)
                .build();
    }

    private String resolveUserDisplayName(User user) {
        if (user.getRole().getName() == RoleName.ROLE_PATIENT) {
            return patientRepository.findByUser(user).map(Patient::getFullName).orElse("Patient");
        } else if (user.getRole().getName() == RoleName.ROLE_DOCTOR) {
            return doctorRepository.findByUser(user).map(Doctor::getFullName).orElse("Doctor");
        }
        return "Administrator";
    }

    private void setRefreshTokenCookie(HttpServletResponse response, String token, int maxAgeSeconds) {
        ResponseCookie cookie = ResponseCookie.from(refreshCookieName, token)
                .httpOnly(true)
                .secure(false) // Set to true when running behind HTTPS in production
                .path("/api/v1/auth")
                .maxAge(maxAgeSeconds)
                .sameSite("Lax")
                .build();

        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }

    private void clearRefreshTokenCookie(HttpServletResponse response) {
        ResponseCookie cookie = ResponseCookie.from(refreshCookieName, "")
                .httpOnly(true)
                .secure(false)
                .path("/api/v1/auth")
                .maxAge(0)
                .sameSite("Lax")
                .build();

        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }

    @Override
    @Transactional(readOnly = true)
    public boolean checkEmailExists(String email) {
        if (email == null || email.isBlank()) return false;
        return userRepository.existsByEmailAndIsDeletedFalse(email.trim().toLowerCase());
    }

    @Override
    @Transactional
    public AuthResponse firebaseLogin(FirebaseLoginRequest request, HttpServletResponse response) {
        String normalizedEmail = request.getEmail().trim().toLowerCase();

        User user = userRepository.findByEmailAndIsDeletedFalse(normalizedEmail).orElse(null);
        boolean isNewUser = false;

        if (user == null) {
            isNewUser = true;
            Role patientRole = roleRepository.findByName(RoleName.ROLE_PATIENT)
                    .orElseThrow(() -> new ResourceNotFoundException("Role not found: ROLE_PATIENT"));

            String randomPass = UUID.randomUUID().toString();
            user = User.builder()
                    .email(normalizedEmail)
                    .passwordHash(passwordEncoder.encode(randomPass))
                    .role(patientRole)
                    .status(UserStatus.ACTIVE)
                    .failedLoginAttempts(0)
                    .build();

            User savedUser = userRepository.save(user);

            LocalDate dob = null;
            if (request.getDateOfBirth() != null && !request.getDateOfBirth().isBlank()) {
                try {
                    dob = LocalDate.parse(request.getDateOfBirth().trim());
                } catch (Exception ignored) {}
            }

            Patient patient = Patient.builder()
                    .user(savedUser)
                    .fullName(request.getFullName() != null && !request.getFullName().isBlank()
                            ? request.getFullName().trim()
                            : normalizedEmail.split("@")[0])
                    .phoneNumber(request.getPhoneNumber() != null ? request.getPhoneNumber().trim() : null)
                    .dateOfBirth(dob)
                    .gender(request.getGender() != null ? request.getGender().trim() : null)
                    .bloodGroup(request.getBloodGroup() != null ? request.getBloodGroup().trim() : null)
                    .emergencyContact(request.getEmergencyContact() != null ? request.getEmergencyContact().trim() : null)
                    .address(request.getAddress() != null ? request.getAddress().trim() : null)
                    .avatarUrl(request.getPhotoUrl())
                    .build();

            patientRepository.save(patient);
            user = savedUser;
        } else {
            // User ALREADY exists in database!
            if (user.getRole().getName() == RoleName.ROLE_PATIENT) {
                var patientOpt = patientRepository.findByUser(user);
                if (patientOpt.isEmpty() || patientOpt.get().getPhoneNumber() == null || patientOpt.get().getPhoneNumber().isBlank()) {
                    isNewUser = true;
                }
            }

            if (user.getStatus() == UserStatus.LOCKED || user.getStatus() == UserStatus.PENDING_VERIFICATION) {
                user.setStatus(UserStatus.ACTIVE);
                user.setLockUntil(null);
            }
            user.setFailedLoginAttempts(0);
            userRepository.save(user);

            // Update patient details if patient
            if (user.getRole().getName() == RoleName.ROLE_PATIENT) {
                final User currentUser = user;
                Patient p = patientRepository.findByUser(user).orElseGet(() -> {
                    Patient newP = Patient.builder()
                            .user(currentUser)
                            .fullName(request.getFullName() != null && !request.getFullName().isBlank()
                                    ? request.getFullName().trim()
                                    : currentUser.getEmail().split("@")[0])
                            .build();
                    return patientRepository.save(newP);
                });

                if (request.getFullName() != null && !request.getFullName().isBlank()) {
                    p.setFullName(request.getFullName().trim());
                }
                if (request.getPhoneNumber() != null && !request.getPhoneNumber().isBlank()) {
                    p.setPhoneNumber(request.getPhoneNumber().trim());
                }
                if (request.getDateOfBirth() != null && !request.getDateOfBirth().isBlank()) {
                    try {
                        p.setDateOfBirth(LocalDate.parse(request.getDateOfBirth().trim()));
                    } catch (Exception ignored) {}
                }
                if (request.getGender() != null && !request.getGender().isBlank()) {
                    p.setGender(request.getGender().trim());
                }
                if (request.getBloodGroup() != null && !request.getBloodGroup().isBlank()) {
                    p.setBloodGroup(request.getBloodGroup().trim());
                }
                if (request.getAddress() != null && !request.getAddress().isBlank()) {
                    p.setAddress(request.getAddress().trim());
                }
                if (request.getEmergencyContact() != null && !request.getEmergencyContact().isBlank()) {
                    p.setEmergencyContact(request.getEmergencyContact().trim());
                }
                if (request.getPhotoUrl() != null && !request.getPhotoUrl().isBlank()) {
                    p.setAvatarUrl(request.getPhotoUrl());
                }
                patientRepository.save(p);
            }
        }

        // If this request already provided phoneNumber (e.g. from CompleteProfilePage), profile is complete!
        if (request.getPhoneNumber() != null && !request.getPhoneNumber().isBlank()) {
            isNewUser = false;
        }

        UserPrincipal principal = UserPrincipal.create(user);
        String accessToken = jwtTokenProvider.generateAccessToken(principal);

        String rawRefreshToken = UUID.randomUUID().toString();
        String refreshTokenHash = TokenHashUtil.hashToken(rawRefreshToken);

        RefreshToken refreshToken = RefreshToken.builder()
                .user(user)
                .tokenHash(refreshTokenHash)
                .expiresAt(Instant.now().plusMillis(jwtTokenProvider.getRefreshExpirationMs()))
                .revoked(false)
                .build();

        refreshTokenRepository.save(refreshToken);
        setRefreshTokenCookie(response, rawRefreshToken, (int) (jwtTokenProvider.getRefreshExpirationMs() / 1000));

        UserSummaryDto userSummary = buildUserSummary(user);

        return AuthResponse.builder()
                .accessToken(accessToken)
                .tokenType("Bearer")
                .expiresIn(jwtTokenProvider.getAccessExpirationMs() / 1000)
                .user(userSummary)
                .isNewUser(isNewUser)
                .build();
    }
}
