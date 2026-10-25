import apiClient from './client';

export const adminApi = {
  getStats: () => apiClient.get('/admin/stats'),
  getUsers: (params) => apiClient.get('/admin/users', { params }),
  toggleUserLock: (id, unlock) => apiClient.patch(`/admin/users/${id}/lock?unlock=${unlock}`),
  updateUserStatus: (id, status) => apiClient.patch(`/admin/users/${id}/status?status=${status}`),
  getDoctors: (params) => apiClient.get('/admin/doctors', { params }),
  approveDoctor: (id, data) => apiClient.patch(`/admin/doctors/${id}/approve`, data),
  getAllAppointments: (params) => apiClient.get('/admin/appointments', { params }),
  getAuditLogs: (params) => apiClient.get('/admin/audit-logs', { params }),
};

export default adminApi;
