import { apiCall, getAuthHeadersForFormData, API_BASE_URL } from './auth';
import { mockAdminJwt } from '../mocks/adminMock';

function downloadMockExcelBlob(fileName) {
    const blob = new Blob([], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
}

// Admin API
export const adminAPI = {
    login: async (username, password) => {
        if (import.meta.env.VITE_USE_MOCK === 'true') {
            return { token: mockAdminJwt() };
        }
        const response = await fetch(`${API_BASE_URL}/admin/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error || 'Giriş başarısız');
        }
        return data;
    },

    getApplications: (archived = false, status = null, page = 1, limit = 100, extra = {}) => {
        let url = `/admin/applications?archived=${archived}&page=${page}&limit=${limit}`;
        if (status) {
            url += `&status=${encodeURIComponent(status)}`;
        }
        if (extra.q) {
            url += `&q=${encodeURIComponent(extra.q)}`;
        }
        if (extra.tcno) {
            url += `&tcno=${encodeURIComponent(extra.tcno)}`;
        }
        if (extra.fullName) {
            url += `&fullName=${encodeURIComponent(extra.fullName)}`;
        }
        return apiCall(url);
    },

    getArchivedApplications: () => 
        apiCall('/admin/applications/archived'),

    archiveApplications: (ids) => 
        apiCall('/admin/applications/archive', {
            method: 'POST',
            body: JSON.stringify({ ids })
        }),

    unarchiveApplications: (ids) => 
        apiCall('/admin/applications/unarchive', {
            method: 'POST',
            body: JSON.stringify({ ids })
        }),

    exportApplicationsExcel: async (ids) => {
        if (import.meta.env.VITE_USE_MOCK === 'true') {
            downloadMockExcelBlob('demo-basvurular.xlsx');
            return;
        }
        const token = localStorage.getItem('adminToken');
        const response = await fetch(`${API_BASE_URL}/admin/applications/export-excel`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ ids })
        });

        if (response.status === 401) {
            localStorage.removeItem('adminToken');
            window.location.href = '/';
            throw new Error('Yetkisiz');
        }

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Excel dosyası indirilemedi');
        }

        const blob = await response.blob();
        const contentDisposition = response.headers.get('Content-Disposition');
        let fileName = 'basvurular.xlsx';
        if (contentDisposition) {
            const fileNameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
            if (fileNameMatch && fileNameMatch[1]) {
                fileName = decodeURIComponent(fileNameMatch[1].replace(/['"]/g, ''));
            }
        }

        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    },

    getAgeGroups: () =>
        apiCall('/admin/age-groups'),

    drawLottery: (kresQuotas, { selectedAgeGroupId, excelOutput = false } = {}) =>
        apiCall('/admin/applications/lottery', {
            method: 'POST',
            body: JSON.stringify({
                kresQuotas,
                selectedAgeGroupId,
                excelOutput,
            })
        }),

    updateApplicationStatus: (id, status, adminNotes) =>
        apiCall(`/admin/applications/${id}/status`, {
            method: 'PATCH',
            body: JSON.stringify({ status, ...(adminNotes !== undefined && adminNotes !== null ? { adminNotes } : {}) })
        }),

    sendApplicationMessage: (id) =>
        apiCall(`/admin/applications/${id}/send-message`, {
            method: 'POST'
        }),

    downloadLotteryExcel: async (mainIds) => {
        if (import.meta.env.VITE_USE_MOCK === 'true') {
            downloadMockExcelBlob('demo-cekilis-sonucu.xlsx');
            return;
        }
        const token = localStorage.getItem('adminToken');
        const response = await fetch(`${API_BASE_URL}/admin/applications/lottery/excel`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                mainIds
            })
        });

        if (response.status === 401) {
            localStorage.removeItem('adminToken');
            window.location.href = '/';
            throw new Error('Yetkisiz');
        }

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Excel dosyası indirilemedi');
        }

        const blob = await response.blob();
        const contentDisposition = response.headers.get('Content-Disposition');
        let fileName = 'cekilis_sonucu.xlsx';
        if (contentDisposition) {
            const fileNameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
            if (fileNameMatch && fileNameMatch[1]) {
                fileName = decodeURIComponent(fileNameMatch[1].replace(/['"]/g, ''));
            }
        }

        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    },

    getScoringConfig: () => 
        apiCall('/admin/scoring-config'),

    getApplicationsOpenStatus: () => 
        apiCall('/admin/settings/applications-open'),

    setApplicationsOpen: (open) => 
        apiCall('/admin/settings/applications-open', {
            method: 'POST',
            body: JSON.stringify({ open })
        }),

    // Super admin endpoints
    listAdmins: () => 
        apiCall('/admin/users'),

    createAdmin: (username, password) => 
        apiCall('/admin/users', {
            method: 'POST',
            body: JSON.stringify({ username, password })
        }),

    deleteAdmin: (id) => 
        apiCall(`/admin/users/${id}`, {
            method: 'DELETE'
        }),

    // Süper admin: başvuru silme
    deleteApplication: (id) =>
        apiCall(`/admin/applications/${id}`, {
            method: 'DELETE'
        }),

    deleteApplications: (ids) =>
        apiCall('/admin/applications/delete', {
            method: 'POST',
            body: JSON.stringify({ ids })
        }),

    /** Süper admin: tüm başvuruların puanını güncel SCORING_CONFIG ile yeniden hesaplar */
    recalculateApplicationScores: () =>
        apiCall('/admin/applications/recalculate-scores', {
            method: 'POST'
        })
};

// Çocuk Gelişim Merkezi API
export const kresAPI = {
    getAllKresler: () => 
        apiCall('/kresler/admin/all'),

    getKres: (id) => 
        apiCall(`/kresler/${id}`),

    createKres: async (formData) => {
        if (import.meta.env.VITE_USE_MOCK === 'true') {
            return {
                id: 99,
                name: 'Yeni Örnek Merkez',
                address: 'Demo adres',
                photos: [],
                ageGroups: [],
            };
        }
        const token = localStorage.getItem('adminToken');
        const response = await fetch(`${API_BASE_URL}/kresler/admin`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });

        if (response.status === 401) {
            localStorage.removeItem('adminToken');
            window.location.href = '/';
            throw new Error('Yetkisiz');
        }

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Çocuk gelişim merkezi kaydedilemedi');
        }

        return response.json();
    },

    updateKres: async (id, formData) => {
        if (import.meta.env.VITE_USE_MOCK === 'true') {
            return {
                id: Number(id),
                name: 'Güncellenmiş Örnek Merkez',
                address: 'Demo adres',
                photos: [],
                ageGroups: [],
            };
        }
        const token = localStorage.getItem('adminToken');
        const response = await fetch(`${API_BASE_URL}/kresler/admin/${id}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });

        if (response.status === 401) {
            localStorage.removeItem('adminToken');
            window.location.href = '/';
            throw new Error('Yetkisiz');
        }

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Çocuk gelişim merkezi güncellenemedi');
        }

        return response.json();
    },

    deleteKres: (id) => 
        apiCall(`/kresler/admin/${id}`, {
            method: 'DELETE'
        }),

    deletePhoto: (photoId) => 
        apiCall(`/kresler/admin/photos/${photoId}`, {
            method: 'DELETE'
        })
};

