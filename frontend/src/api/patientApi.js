import apiClient from './client';

export const patientApi = {
  getProfile: () => apiClient.get('/patient/profile'),
  updateProfile: (data) => apiClient.put('/patient/profile', data),
};

export default patientApi;
