import apiClient from './client';

export const authApi = {
  login: (credentials) => apiClient.post('/auth/login', credentials),
  signup: (userData) => apiClient.post('/auth/signup', userData),
  verifyEmail: (token) => apiClient.get(`/auth/verify-email?token=${encodeURIComponent(token)}`),
  forgotPassword: (email) => apiClient.post('/auth/forgot-password', { email }),
  resetPassword: (payload) => apiClient.post('/auth/reset-password', payload),
  changePassword: (payload) => apiClient.post('/auth/change-password', payload),
  refreshToken: () => apiClient.post('/auth/refresh'),
  logout: () => apiClient.post('/auth/logout'),
  getMe: () => apiClient.get('/auth/me'),
  checkEmail: (email) => apiClient.get(`/auth/check-email?email=${encodeURIComponent(email)}`),
  firebaseLogin: (data) => apiClient.post('/auth/firebase-login', data),
};

export default authApi;
