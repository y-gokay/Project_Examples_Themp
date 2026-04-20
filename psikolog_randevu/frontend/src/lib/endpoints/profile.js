import api from '../api';

export const profileApi = {
  me: () => api.get('/psychologists/me'),
  update: (body) => api.patch('/psychologists/me', body),
  uploadAvatar: (file) => {
    const fd = new FormData();
    fd.append('avatar', file);
    return api.post('/psychologists/me/avatar', fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  deleteAvatar: () => api.delete('/psychologists/me/avatar'),
  addDocument: (file, title) => {
    const fd = new FormData();
    fd.append('file', file);
    fd.append('title', title);
    return api.post('/psychologists/me/documents', fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  addTextDocument: (title, content) =>
    api.post('/psychologists/me/documents/text', { title, content }),
  deleteDocument: (id) => api.delete(`/psychologists/me/documents/${id}`),
};
