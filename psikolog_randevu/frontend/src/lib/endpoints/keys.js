import api from '../api';

export const keysApi = {
  setup: (body) => api.post('/keys/setup', body),
  me: () => api.get('/keys/me'),
  publicForPsychologist: (psychologistId) =>
    api.get(`/keys/psychologist/${psychologistId}/public`),
};
