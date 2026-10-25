package com.medibook.controller;

import com.medibook.dto.*;
import com.medibook.security.UserPrincipal;
import com.medibook.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "Endpoints for user registration, login, token refresh, and password management")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/signup")
    @Operation(summary = "Register a new patient account", description = "Creates a patient account in PENDING_VERIFICATION state and emails a verification link")
    public ResponseEntity<ApiResponse<String>> signup(@Valid @RequestBody SignupRequest request) {
        ApiResponse<String> response = authService.signup(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/verify-email")
    @Operation(summary = "Verify account email address", description = "Validates the token from the verification link and activates the user account")
    public ResponseEntity<ApiResponse<String>> verifyEmail(@RequestParam("token") String token) {
        ApiResponse<String> response = authService.verifyEmail(token);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/login")
    @Operation(summary = "Authenticate user and issue tokens", description = "Verifies credentials, applies lockout on failed attempts, sets httpOnly refresh cookie, and returns JWT access token")
    public ResponseEntity<AuthResponse> login(
            @Valid @RequestBody LoginRequest request,
            HttpServletResponse response) {
        AuthResponse authResponse = authService.login(request, response);
        return ResponseEntity.ok(authResponse);
    }

    @PostMapping("/refresh")
    @Operation(summary = "Refresh expired access token", description = "Validates the httpOnly refresh token cookie, rotates the token, and issues a fresh 15-minute access token")
    public ResponseEntity<AuthResponse> refresh(
            @CookieValue(name = "${medibook.jwt.cookie-name:medibook_refresh_token}", required = false) String refreshToken,
            HttpServletResponse response) {
        AuthResponse authResponse = authService.refreshAccessToken(refreshToken, response);
        return ResponseEntity.ok(authResponse);
    }

    @PostMapping("/logout")
    @Operation(summary = "Logout user", description = "Revokes the active refresh token and clears the httpOnly cookie")
    public ResponseEntity<ApiResponse<String>> logout(
            @CookieValue(name = "${medibook.jwt.cookie-name:medibook_refresh_token}", required = false) String refreshToken,
            HttpServletResponse response) {
        ApiResponse<String> apiResponse = authService.logout(refreshToken, response);
        return ResponseEntity.ok(apiResponse);
    }

    @PostMapping("/forgot-password")
    @Operation(summary = "Request password reset link", description = "Emails a single-use tokenized password reset link valid for 30 minutes (generic response prevents user enumeration)")
    public ResponseEntity<ApiResponse<String>> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        ApiResponse<String> response = authService.forgotPassword(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/reset-password")
    @Operation(summary = "Reset password using token", description = "Validates the single-use reset token and sets the new account password")
    public ResponseEntity<ApiResponse<String>> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        ApiResponse<String> response = authService.resetPassword(request);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/change-password")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Change password for logged-in user", description = "Updates password after verifying the user's current password")
    public ResponseEntity<ApiResponse<String>> changePassword(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody ChangePasswordRequest request) {
        ApiResponse<String> response = authService.changePassword(principal.getId(), request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get currently authenticated user details", description = "Returns user ID, email, role, status, and linked profile data")
    public ResponseEntity<ApiResponse<UserSummaryDto>> getCurrentUser(@AuthenticationPrincipal UserPrincipal principal) {
        UserSummaryDto userSummary = authService.getCurrentUser(principal);
        return ResponseEntity.ok(ApiResponse.success("User profile retrieved successfully", userSummary));
    }

    @GetMapping("/check-email")
    @Operation(summary = "Check if email exists in database", description = "Returns true if email exists in database, false otherwise")
    public ResponseEntity<ApiResponse<Boolean>> checkEmailExists(@RequestParam("email") String email) {
        boolean exists = authService.checkEmailExists(email);
        return ResponseEntity.ok(ApiResponse.success(exists ? "Email exists" : "Email available", exists));
    }

    @PostMapping("/firebase-login")
    @Operation(summary = "Authenticate or register via Firebase Google Sign-In", description = "Verifies Firebase user, automatically registers or logs in, and returns JWT tokens")
    public ResponseEntity<AuthResponse> firebaseLogin(
            @Valid @RequestBody FirebaseLoginRequest request,
            HttpServletResponse response) {
        AuthResponse authResponse = authService.firebaseLogin(request, response);
        return ResponseEntity.ok(authResponse);
    }
}
