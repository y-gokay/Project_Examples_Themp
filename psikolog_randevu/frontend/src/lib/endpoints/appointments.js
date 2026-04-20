import api from '../api';

export const appointmentsApi = {
  create: (body) => api.post('/appointments', body),
  mine: () => api.get('/appointments/me'),
  cancel: (id) => api.patch(`/appointments/${id}/cancel`, {}),
  psychologistList: (params) => api.get('/appointments/psychologist', { params }),
  pending: () => api.get('/appointments/pending'),
  history: (params) => api.get('/appointments/history', { params }),
  decision: (id, body) => api.patch(`/appointments/${id}/decision`, body),
};
