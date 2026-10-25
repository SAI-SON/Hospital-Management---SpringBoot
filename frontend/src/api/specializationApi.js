import apiClient from './client';

export const specializationApi = {
  getSpecializations: () => apiClient.get('/specializations'),
};

export default specializationApi;
