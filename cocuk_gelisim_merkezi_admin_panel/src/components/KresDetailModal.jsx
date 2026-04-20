import { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';
import ApplicationDetailModal from './ApplicationDetailModal';

export default function KresDetailModal({ kres, applications, onClose, onStatusUpdate }) {
    const [localApplications, setLocalApplications] = useState(applications);
    const [updatingStatuses, setUpdatingStatuses] = useState(new Set());
    const [detailModalApp, setDetailModalApp] = useState(null);

    useEffect(() => {
        setLocalApplications(applications);
    }, [applications]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                e.preventDefault();
                onClose();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    if (!kres) return null;

    // Bu çocuk gelişim merkezine seçilmiş başvuruları durumlarına göre grupla
    const selectedApps = localApplications.filter(app => 
        app.selectedKres && 
        app.selectedKres.id === kres.id && 
        app.status !== null && 
        app.status !== undefined
    );

    const handleStatusChange = async (appId, newStatus) => {
        setUpdatingStatuses(prev => new Set(prev).add(appId));
        try {
            await adminAPI.updateApplicationStatus(appId, newStatus);
            // Local state'i güncelle
            setLocalApplications(prev => prev.map(app => 
                app.id === appId ? { ...app, status: newStatus } : app
            ));
            // Parent component'e bildir
            if (onStatusUpdate) {
                onStatusUpdate();
            }
        } catch (error) {
            alert('Status güncellenemedi: ' + error.message);
        } finally {
            setUpdatingStatuses(prev => {
                const newSet = new Set(prev);
                newSet.delete(appId);
                return newSet;
            });
        }
    };

    const statusOptions = [
        { value: 'bekliyor', label: 'Bekliyor' },
        { value: 'kayıt_yaptırdı', label: 'Kayıt Yaptırdı' },
        { value: 'kayıt_yaptırmadı', label: 'Kayıt Yaptırmadı' },
        { value: 'ulaşılamadı', label: 'Ulaşılamadı' },
    ];

    const bekliyor = selectedApps.filter(app => app.status === 'bekliyor');
    const kayitYaptirdi = selectedApps.filter(app => app.status === 'kayıt_yaptırdı');
    const kayitYaptirmadi = selectedApps.filter(app => app.status === 'kayıt_yaptırmadı');
    const ulasilamadi = selectedApps.filter(app => app.status === 'ulaşılamadı');

    const statusLabels = {
        'bekliyor': 'Bekliyor',
        'kayıt_yaptırdı': 'Kayıt Yaptırdı',
        'kayıt_yaptırmadı': 'Kayıt Yaptırmadı',
        'ulaşılamadı': 'Ulaşılamadı',
    };

    const statusColors = {
        'bekliyor': '#ffa500',
        'kayıt_yaptırdı': '#10b981',
        'kayıt_yaptırmadı': '#ef4444',
        'ulaşılamadı': '#6c757d',
    };

    const renderApplicationList = (apps, title, color) => {
        if (apps.length === 0) {
            return (
                <div style={{ padding: '20px', textAlign: 'center', color: '#999' }}>
                    {title} kategorisinde başvuru bulunmamaktadır.
                </div>
            );
        }

        return (
            <div style={{ marginBottom: '30px' }}>
                <h3 style={{ 
                    color: color, 
                    marginBottom: '15px', 
                    paddingBottom: '10px',
                    borderBottom: `2px solid ${color}`,
                    fontSize: '18px',
                    fontWeight: '600'
                }}>
                    {title} ({apps.length})
                </h3>
                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Ad Soyad</th>
                                <th>TC Kimlik No</th>
                                <th>Telefon</th>
                                <th>Puan</th>
                                <th>Seçilme Tarihi</th>
                                <th>Durum</th>
                                <th>İşlemler</th>
                            </tr>
                        </thead>
                        <tbody>
                            {apps.map((app) => {
                                const isUpdating = updatingStatuses.has(app.id);
                                return (
                                    <tr key={app.id}>
                                        <td>{app.id}</td>
                                        <td><strong>{app.fullName}</strong></td>
                                        <td>{app.tcno}</td>
                                        <td>{app.phone || '-'}</td>
                                        <td>
                                            <strong style={{ color: '#667eea', fontSize: '16px' }}>
                                                {app.score || '-'}
                                            </strong>
                                        </td>
                                        <td>
                                            {app.selectedAt
                                                ? new Date(app.selectedAt).toLocaleDateString('tr-TR', {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })
                                                : '-'}
                                        </td>
                                        <td>
                                            <select
                                                value={app.status || ''}
                                                onChange={(e) => handleStatusChange(app.id, e.target.value)}
                                                disabled={isUpdating}
                                                style={{
                                                    padding: '6px 10px',
                                                    borderRadius: '4px',
                                                    border: `2px solid ${statusColors[app.status] || '#ddd'}`,
                                                    backgroundColor: '#fff',
                                                    color: '#333',
                                                    fontSize: '13px',
                                                    fontWeight: '500',
                                                    cursor: isUpdating ? 'not-allowed' : 'pointer',
                                                    minWidth: '160px',
                                                    outline: 'none',
                                                    transition: 'all 0.2s ease',
                                                }}
                                                onMouseEnter={(e) => {
                                                    if (!isUpdating) {
                                                        e.target.style.borderColor = statusColors[app.status] || '#667eea';
                                                        e.target.style.boxShadow = `0 0 0 3px ${(statusColors[app.status] || '#667eea')}33`;
                                                    }
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.target.style.borderColor = statusColors[app.status] || '#ddd';
                                                    e.target.style.boxShadow = 'none';
                                                }}
                                            >
                                                {statusOptions.map(option => (
                                                    <option key={option.value} value={option.value}>
                                                        {option.label}
                                                    </option>
                                                ))}
                                            </select>
                                            {isUpdating && (
                                                <span style={{ marginLeft: '8px', fontSize: '12px', color: '#666' }}>
                                                    Güncelleniyor...
                                                </span>
                                            )}
                                        </td>
                                        <td>
                                            <button
                                                onClick={() => setDetailModalApp(app)}
                                                title="Detayları Gör"
                                                style={{
                                                    padding: '6px 12px',
                                                    fontSize: '13px',
                                                    backgroundColor: '#f8f9fa',
                                                    color: '#495057',
                                                    border: '1px solid #dee2e6',
                                                    borderRadius: '4px',
                                                    cursor: 'pointer',
                                                    fontWeight: '500',
                                                    transition: 'all 0.2s ease',
                                                    boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.target.style.backgroundColor = '#e9ecef';
                                                    e.target.style.borderColor = '#adb5bd';
                                                    e.target.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.target.style.backgroundColor = '#f8f9fa';
                                                    e.target.style.borderColor = '#dee2e6';
                                                    e.target.style.boxShadow = '0 1px 2px rgba(0,0,0,0.05)';
                                                }}
                                            >
                                                Detay
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    };

    return (
        <div
            className="modal show"
            onClick={(e) => e.target === e.currentTarget && onClose()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="kres-detail-title"
        >
            <div className="modal-content modal-large" style={{ maxWidth: '1200px', maxHeight: '90vh', overflowY: 'auto' }}>
                <button
                    type="button"
                    className="close"
                    onClick={onClose}
                    aria-label="Pencereyi kapat"
                >
                    &times;
                </button>
                <h3 id="kres-detail-title" style={{ marginBottom: '20px' }}>
                    {kres.name} - Başvuru Detayları
                </h3>
                
                {selectedApps.length === 0 ? (
                    <div style={{ padding: '40px', textAlign: 'center', color: '#999' }}>
                        <div style={{ fontSize: '48px', marginBottom: '16px' }}>📋</div>
                        <div style={{ fontSize: '18px', fontWeight: '500', marginBottom: '8px' }}>
                            Bu çocuk gelişim merkezi için henüz seçilmiş başvuru bulunmamaktadır.
                        </div>
                    </div>
                ) : (
                    <div>
                        {/* Detaylı Listeler */}
                        {renderApplicationList(bekliyor, 'Bekliyor', statusColors.bekliyor)}
                        {renderApplicationList(kayitYaptirdi, 'Kayıt Yaptırdı', statusColors.kayıt_yaptırdı)}
                        {renderApplicationList(kayitYaptirmadi, 'Kayıt Yaptırmadı', statusColors.kayıt_yaptırmadı)}
                        {renderApplicationList(ulasilamadi, 'Ulaşılamadı', statusColors.ulaşılamadı)}
                    </div>
                )}

                <div className="form-actions" style={{ marginTop: '30px', justifyContent: 'flex-end' }}>
                    <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={onClose}
                    >
                        Kapat
                    </button>
                </div>
            </div>

            {detailModalApp && (
                <ApplicationDetailModal
                    application={detailModalApp}
                    onClose={() => setDetailModalApp(null)}
                    onStatusUpdate={() => {
                        if (onStatusUpdate) {
                            onStatusUpdate();
                        }
                    }}
                />
            )}
        </div>
    );
}
