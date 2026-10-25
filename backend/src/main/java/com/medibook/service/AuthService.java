package com.medibook.service;

import com.medibook.dto.*;
import com.medibook.security.UserPrincipal;
import jakarta.servlet.http.HttpServletResponse;

public interface AuthService {
    ApiResponse<String> signup(SignupRequest request);
    ApiResponse<String> verifyEmail(String token);
    AuthResponse login(LoginRequest request, HttpServletResponse response);
    AuthResponse refreshAccessToken(String rawRefreshToken, HttpServletResponse response);
    ApiResponse<String> logout(String rawRefreshToken, HttpServletResponse response);
    ApiResponse<String> forgotPassword(ForgotPasswordRequest request);
    ApiResponse<String> resetPassword(ResetPasswordRequest request);
    ApiResponse<String> changePassword(Long userId, ChangePasswordRequest request);
    UserSummaryDto getCurrentUser(UserPrincipal principal);
    AuthResponse firebaseLogin(FirebaseLoginRequest request, HttpServletResponse response);
    boolean checkEmailExists(String email);
}
