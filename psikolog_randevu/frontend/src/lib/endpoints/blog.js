import api from '../api';

export const blogApi = {
  // Public
  listPublic: (params) => api.get('/blog', { params }),
  getPublic: (slug) => api.get(`/blog/${slug}`),
  // Me
  listMine: (params) => api.get('/blog/me', { params }),
  getMine: (id) => api.get(`/blog/me/${id}`),
  create: (body) => api.post('/blog/me', body),
  update: (id, body) => api.patch(`/blog/me/${id}`, body),
  remove: (id) => api.delete(`/blog/me/${id}`),
  publish: (id) => api.post(`/blog/me/${id}/publish`),
  unpublish: (id) => api.post(`/blog/me/${id}/unpublish`),
  uploadCover: (id, file) => {
    const fd = new FormData();
    fd.append('cover', file);
    return api.post(`/blog/me/${id}/cover`, fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};
