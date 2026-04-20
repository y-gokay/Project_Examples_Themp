import api from '../api';

export const notesApi = {
  patients: () => api.get('/notes/patients'),
  list: (userId) => api.get('/notes', { params: { userId } }),
  create: (body) => api.post('/notes', body),
  update: (id, body) => api.patch(`/notes/${id}`, body),
  remove: (id) => api.delete(`/notes/${id}`),
};
