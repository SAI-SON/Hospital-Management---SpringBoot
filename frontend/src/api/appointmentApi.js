import apiClient from './client';

export const appointmentApi = {
  // Patient
  bookAppointment: (data) => apiClient.post('/patient/appointments', data),
  getPatientAppointments: (params) => apiClient.get('/patient/appointments', { params }),
  cancelAppointment: (id, data) => apiClient.post(`/patient/appointments/${id}/cancel`, data),
  rescheduleAppointment: (id, data) => apiClient.post(`/patient/appointments/${id}/reschedule`, data),

  // Doctor
  getDoctorAppointments: (params) => apiClient.get('/doctor/appointments', { params }),
  updateDoctorAppointmentStatus: (id, status) => apiClient.patch(`/doctor/appointments/${id}/status?status=${status}`),
  addDoctorConsultationNotes: (id, data) => apiClient.post(`/doctor/appointments/${id}/notes`, data),

  // Shared
  getAppointmentById: (id) => apiClient.get(`/appointments/${id}`),
};

export default appointmentApi;
