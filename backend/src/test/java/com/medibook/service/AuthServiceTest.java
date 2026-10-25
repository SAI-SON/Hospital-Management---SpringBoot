package com.medibook.service;

import com.medibook.dto.AuthResponse;
import com.medibook.dto.LoginRequest;
import com.medibook.dto.SignupRequest;
import com.medibook.email.EmailService;
import com.medibook.entity.*;
import com.medibook.exception.AccountLockedException;
import com.medibook.exception.ConflictException;
import com.medibook.repository.*;
import com.medibook.security.JwtTokenProvider;
import com.medibook.security.UserPrincipal;
import jakarta.servlet.http.HttpServletResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.Instant;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;
    @Mock
    private RoleRepository roleRepository;
    @Mock
    private PatientRepository patientRepository;
    @Mock
    private DoctorRepository doctorRepository;
    @Mock
    private RefreshTokenRepository refreshTokenRepository;
    @Mock
    private EmailVerificationTokenRepository emailVerificationTokenRepository;
    @Mock
    private PasswordResetTokenRepository passwordResetTokenRepository;
    @Mock
    private PasswordEncoder passwordEncoder;
    @Mock
    private JwtTokenProvider jwtTokenProvider;
    @Mock
    private EmailService emailService;
    @Mock
    private HttpServletResponse httpServletResponse;

    @InjectMocks
    private AuthServiceImpl authService;

    private Role patientRole;
    private User activeUser;

    @BeforeEach
    void setUp() {
        patientRole = Role.builder()
                .id(3L)
                .name(RoleName.ROLE_PATIENT)
                .build();

        activeUser = User.builder()
                .id(1L)
                .email("patient@example.com")
                .passwordHash("hashedPassword")
                .role(patientRole)
                .status(UserStatus.ACTIVE)
                .failedLoginAttempts(0)
                .build();
    }

    @Test
    @DisplayName("Signup: Success creates patient and sends verification email")
    void testSignup_Success() {
        SignupRequest request = SignupRequest.builder()
                .fullName("John Doe")
                .email("john@example.com")
                .password("Password@123")
                .phoneNumber("1234567890")
                .build();

        when(userRepository.existsByEmailAndIsDeletedFalse(anyString())).thenReturn(false);
        when(roleRepository.findByName(RoleName.ROLE_PATIENT)).thenReturn(Optional.of(patientRole));
        when(passwordEncoder.encode(anyString())).thenReturn("encodedPassword");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
            User u = invocation.getArgument(0);
            u.setId(10L);
            return u;
        });

        var response = authService.signup(request);

        assertTrue(response.isSuccess());
        verify(patientRepository, times(1)).save(any(Patient.class));
        verify(emailVerificationTokenRepository, times(1)).save(any(EmailVerificationToken.class));
        verify(emailService, times(1)).sendVerificationEmail(eq("john@example.com"), eq("John Doe"), anyString());
    }

    @Test
    @DisplayName("Signup: Throws ConflictException when email already exists")
    void testSignup_DuplicateEmail_ThrowsConflict() {
        SignupRequest request = SignupRequest.builder()
                .fullName("Jane Doe")
                .email("jane@example.com")
                .password("Password@123")
                .build();

        when(userRepository.existsByEmailAndIsDeletedFalse("jane@example.com")).thenReturn(true);

        assertThrows(ConflictException.class, () -> authService.signup(request));
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    @DisplayName("Login: Success with valid credentials returns AuthResponse")
    void testLogin_Success() {
        LoginRequest request = LoginRequest.builder()
                .email("patient@example.com")
                .password("Password@123")
                .build();

        when(userRepository.findByEmailAndIsDeletedFalse("patient@example.com")).thenReturn(Optional.of(activeUser));
        when(passwordEncoder.matches("Password@123", "hashedPassword")).thenReturn(true);
        when(jwtTokenProvider.generateAccessToken(any(UserPrincipal.class))).thenReturn("mock-access-token");
        when(jwtTokenProvider.getRefreshExpirationMs()).thenReturn(604800000L);
        when(jwtTokenProvider.getAccessExpirationMs()).thenReturn(900000L);
        when(patientRepository.findByUser(activeUser)).thenReturn(Optional.empty());

        AuthResponse response = authService.login(request, httpServletResponse);

        assertNotNull(response);
        assertEquals("mock-access-token", response.getAccessToken());
        assertEquals("Bearer", response.getTokenType());
        verify(refreshTokenRepository, times(1)).save(any(RefreshToken.class));
    }

    @Test
    @DisplayName("Login: 5 failed attempts locks account and throws AccountLockedException")
    void testLogin_AccountLockoutAfter5Failures() {
        LoginRequest request = LoginRequest.builder()
                .email("patient@example.com")
                .password("WrongPassword")
                .build();

        activeUser.setFailedLoginAttempts(4); // 4 prior failures
        when(userRepository.findByEmailAndIsDeletedFalse("patient@example.com")).thenReturn(Optional.of(activeUser));
        when(passwordEncoder.matches("WrongPassword", "hashedPassword")).thenReturn(false);

        assertThrows(AccountLockedException.class, () -> authService.login(request, httpServletResponse));
        assertEquals(UserStatus.LOCKED, activeUser.getStatus());
        assertNotNull(activeUser.getLockUntil());
        verify(userRepository, times(1)).save(activeUser);
    }

    @Test
    @DisplayName("Verify Email: Valid token activates user")
    void testVerifyEmail_Success() {
        EmailVerificationToken token = EmailVerificationToken.builder()
                .user(activeUser)
                .tokenHash("hash123")
                .expiresAt(Instant.now().plusSeconds(3600))
                .build();

        activeUser.setStatus(UserStatus.PENDING_VERIFICATION);
        when(emailVerificationTokenRepository.findByTokenHash(anyString())).thenReturn(Optional.of(token));

        var response = authService.verifyEmail("rawToken");

        assertTrue(response.isSuccess());
        assertEquals(UserStatus.ACTIVE, activeUser.getStatus());
        assertNotNull(token.getUsedAt());
        verify(userRepository, times(1)).save(activeUser);
    }
}
