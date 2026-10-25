import apiClient from './client';

export const reviewApi = {
  submitReview: (appointmentId, data) => apiClient.post(`/patient/appointments/${appointmentId}/reviews`, data),
  getAppointmentReview: (appointmentId) => apiClient.get(`/patient/appointments/${appointmentId}/review`),
  getDoctorReviews: (doctorId, params) => apiClient.get(`/reviews/doctor/${doctorId}`, { params }),
};

export default reviewApi;
