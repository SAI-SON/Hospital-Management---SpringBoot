import apiClient from './client';

export const doctorApi = {
  // Public
  searchDoctors: (params) => apiClient.get('/doctors', { params }),
  getDoctorById: (id) => apiClient.get(`/doctors/${id}`),
  getAvailableSlots: (id, date) => apiClient.get(`/doctors/${id}/slots`, { params: { date } }),

  // Authenticated Doctor
  getMyProfile: () => apiClient.get('/doctor/profile'),
  updateMyProfile: (data) => apiClient.put('/doctor/profile', data),
  getMyAvailability: () => apiClient.get('/doctor/availability'),
  setMyAvailability: (schedule) => apiClient.put('/doctor/availability', schedule),
  getMyLeaves: () => apiClient.get('/doctor/leaves'),
  addLeave: (data) => apiClient.post('/doctor/leaves', data),
  cancelLeave: (id) => apiClient.delete(`/doctor/leaves/${id}`),
  generateSlots: (data) => apiClient.post('/doctor/slots/generate', data),
};

export default doctorApi;
