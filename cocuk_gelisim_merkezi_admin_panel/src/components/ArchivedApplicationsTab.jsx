import { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';
import { isSuperAdmin } from '../services/auth';
import ApplicationDetailModal from './ApplicationDetailModal';
import {
    Search, FileSpreadsheet, Trash2, RotateCcw, Eye, ArrowUpDown, Archive, MessageSquare, X, Send
} from 'lucide-react';

export default function ArchivedApplicationsTab() {
    const isSuper = isSuperAdmin();
    const [allArchivedApplications, setAllArchivedApplications] = useState([]);
    const [filteredArchivedApplications, setFilteredArchivedApplications] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortValue, setSortValue] = useState('archive-desc');
    const [selectedIds, setSelectedIds] = useState(new Set());
    const [scoringConfig, setScoringConfig] = useState(null);
    const [detailModalApp, setDetailModalApp] = useState(null);
    const [noteModalApp, setNoteModalApp] = useState(null);
    const [editingNoteValue, setEditingNoteValue] = useState('');
    const [savingNote, setSavingNote] = useState(false);
    const [sendingMessage, setSendingMessage] = useState(false);

    useEffect(() => {
        loadScoringConfig();
        loadArchivedApplications();
    }, []);

    useEffect(() => {
        applyFiltersAndSort();
    }, [searchTerm, sortValue, allArchivedApplications]);

    const getStatusLabel = (status) => {
        const labels = {
            'bekliyor': 'Bekliyor',
            'kayıt_yaptırdı': 'Kayıt Yaptırdı',
            'kayıt_yaptırmadı': 'Kayıt Yaptırmadı',
            'ulaşılamadı': 'Ulaşılamadı'
        };
        return labels[status] || status || '-';
    };

    const getStatusStyle = (status) => {
        const styles = {
            'bekliyor': 'bg-amber-50 text-amber-700 border-amber-200',
            'kayıt_yaptırdı': 'bg-emerald-50 text-emerald-700 border-emerald-200',
            'kayıt_yaptırmadı': 'bg-rose-50 text-rose-700 border-rose-200',
            'ulaşılamadı': 'bg-slate-100 text-slate-700 border-slate-200',
            'default': 'bg-slate-50 text-slate-500 border-slate-200'
        };
        return styles[status] || styles.default;
    };

    useEffect(() => {
        if (!noteModalApp) return;

        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                e.preventDefault();
                setNoteModalApp(null);
            }

            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                e.preventDefault();
                if (!savingNote) {
                    handleSaveAdminNote();
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [noteModalApp, savingNote]);

    const loadScoringConfig = async () => {
        try {
            const data = await adminAPI.getScoringConfig();
            setScoringConfig(data.config);
        } catch (error) {
            console.error('Scoring config yüklenemedi:', error);
        }
    };

    const loadArchivedApplications = async () => {
        try {
            const data = await adminAPI.getArchivedApplications();
            setAllArchivedApplications(data.items);
        } catch (error) {
            alert('Arşivlenmiş başvurular yüklenemedi: ' + error.message);
        }
    };

    const applyFiltersAndSort = () => {
        let filtered = [...allArchivedApplications];

        if (searchTerm) {
            filtered = filtered.filter((app) =>
                app.fullName.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        filtered.sort((a, b) => {
            if (sortValue === 'archive-desc') {
                return new Date(b.archivedAt) - new Date(a.archivedAt);
            } else if (sortValue === 'archive-asc') {
                return new Date(a.archivedAt) - new Date(b.archivedAt);
            } else if (sortValue === 'score-desc') {
                return (b.score || 0) - (a.score || 0);
            } else if (sortValue === 'score-asc') {
                return (a.score || 0) - (b.score || 0);
            }
            return 0;
        });

        setFilteredArchivedApplications(filtered);
    };

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedIds(new Set(filteredArchivedApplications.map((app) => app.id)));
        } else {
            setSelectedIds(new Set());
        }
    };

    const handleSelect = (id, checked) => {
        const newSelected = new Set(selectedIds);
        if (checked) {
            newSelected.add(id);
        } else {
            newSelected.delete(id);
        }
        setSelectedIds(newSelected);
    };

    const handleUnarchiveSelected = async () => {
        if (selectedIds.size === 0) return;

        if (!confirm(`${selectedIds.size} başvuruyu arşivden çıkarmak istediğinize emin misiniz?`)) {
            return;
        }

        try {
            const ids = Array.from(selectedIds);
            await adminAPI.unarchiveApplications(ids);
            alert(`${ids.length} başvuru arşivden çıkarıldı`);
            setSelectedIds(new Set());
            await loadArchivedApplications();
        } catch (error) {
            alert('Hata: ' + error.message);
        }
    };

    const handleExportExcel = async () => {
        if (selectedIds.size === 0) return;
        try {
            const ids = Array.from(selectedIds);
            await adminAPI.exportApplicationsExcel(ids);
        } catch (error) {
            alert('Hata: ' + error.message);
        }
    };

    const handleSendMessageSelected = async () => {
        if (selectedIds.size === 0) return;
        if (!confirm(`${selectedIds.size} seçili başvuruya mesaj göndermek istediğinize emin misiniz?`)) return;
        setSendingMessage(true);
        try {
            const ids = Array.from(selectedIds);
            let successCount = 0;
            const errors = [];
            for (const id of ids) {
                try {
                    await adminAPI.sendApplicationMessage(id);
                    successCount++;
                } catch (err) {
                    errors.push(err.message);
                }
            }
            if (successCount > 0) {
                alert(`${successCount} başvuruya mesaj gönderildi${errors.length > 0 ? `. ${errors.length} başvuruda hata: ${errors[0]}` : ''}`);
                setSelectedIds(new Set());
                await loadArchivedApplications();
            } else {
                alert('Mesaj gönderilemedi: ' + (errors[0] || 'Bilinmeyen hata'));
            }
        } catch (error) {
            alert('Hata: ' + error.message);
        } finally {
            setSendingMessage(false);
        }
    };

    const handleDeleteSelected = async () => {
        if (selectedIds.size === 0) return;
        if (!confirm(`${selectedIds.size} başvuruyu kalıcı olarak silmek istediğinize emin misiniz?`)) return;

        try {
            const ids = Array.from(selectedIds);
            await adminAPI.deleteApplications(ids);
            alert(`${selectedIds.size} başvuru silindi`);
            setSelectedIds(new Set());
            await loadArchivedApplications();
        } catch (error) {
            alert('Hata: ' + error.message);
        }
    };

    const handleDeleteApplication = async (id, fullName) => {
        if (!confirm(`"${fullName}" adlı başvuruyu kalıcı olarak silmek istediğinize emin misiniz?`)) return;

        try {
            await adminAPI.deleteApplication(id);
            alert('Başvuru silindi');
            await loadArchivedApplications();
        } catch (error) {
            alert('Hata: ' + error.message);
        }
    };

    const openNoteModal = (app) => {
        setNoteModalApp(app);
        setEditingNoteValue(app.adminNotes ?? '');
    };

    const handleSaveAdminNote = async () => {
        if (!noteModalApp) return;
        setSavingNote(true);
        try {
            await adminAPI.updateApplicationStatus(noteModalApp.id, noteModalApp.status, editingNoteValue || undefined);
            await loadArchivedApplications();
            setNoteModalApp(null);
        } catch (error) {
            alert('Admin notu kaydedilemedi: ' + error.message);
        } finally {
            setSavingNote(false);
        }
    };

    const allSelected = filteredArchivedApplications.length > 0 && filteredArchivedApplications.every((app) => selectedIds.has(app.id));
    const someSelected = filteredArchivedApplications.some((app) => selectedIds.has(app.id));

    return (
        <>
            <div className="space-y-6">
                {/* Toolbar */}
                <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex flex-col sm:flex-row gap-3 w-full xl:w-auto">
                        <div className="relative flex-1 sm:w-80">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="text"
                                className="input-field pl-10"
                                placeholder="Ad Soyad ile ara..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        <div className="relative">
                            <select
                                className="input-field appearance-none cursor-pointer pl-4 pr-10"
                                value={sortValue}
                                onChange={(e) => setSortValue(e.target.value)}
                            >
                                <option value="archive-desc">Arşiv Tarihi (Yeni → Eski)</option>
                                <option value="archive-asc">Arşiv Tarihi (Eski → Yeni)</option>
                                <option value="score-desc">Puan (Yüksek → Düşük)</option>
                                <option value="score-asc">Puan (Düşük → Yüksek)</option>
                            </select>
                            <ArrowUpDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap gap-2 w-full xl:w-auto justify-end">
                        {selectedIds.size > 0 && (
                            <>
                                <button onClick={handleUnarchiveSelected} className="btn btn-secondary text-green-600 hover:bg-green-50 border-green-200 gap-2">
                                    <RotateCcw size={16} /> <span className="hidden sm:inline">Geri Getir</span>
                                </button>
                                <button
                                    onClick={handleSendMessageSelected}
                                    disabled={sendingMessage}
                                    className="btn btn-secondary text-sky-600 hover:bg-sky-50 border-sky-200 gap-2"
                                    title="Mesaj Gönder"
                                >
                                    <Send size={16} /> <span className="hidden sm:inline">{sendingMessage ? 'Gönderiliyor...' : 'Mesaj Gönder'}</span>
                                </button>
                                <button onClick={handleExportExcel} className="btn btn-secondary text-blue-600 hover:bg-blue-50 border-blue-200 gap-2">
                                    <FileSpreadsheet size={16} /> <span className="hidden sm:inline">Excel</span>
                                </button>
                                {isSuper && (
                                    <button onClick={handleDeleteSelected} className="btn btn-danger gap-2">
                                        <Trash2 size={16} /> <span className="hidden sm:inline">Sil</span>
                                    </button>
                                )}
                            </>
                        )}
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                    <div className="overflow-x-auto min-h-[400px]">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500 font-semibold">
                                    <th scope="col" className="px-6 py-4 w-10">
                                        <input
                                            type="checkbox"
                                            checked={allSelected}
                                            ref={(input) => { if (input) input.indeterminate = someSelected && !allSelected; }}
                                            onChange={handleSelectAll}
                                            className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                        />
                                    </th>
                                    {/* <th className="px-6 py-4">ID</th> */}
                                    <th scope="col" className="px-6 py-4">Ad Soyad</th>
                                    <th scope="col" className="px-6 py-4">TC No</th>
                                    <th scope="col" className="px-6 py-4">Telefon</th>
                                    <th scope="col" className="px-6 py-4">Doğum Tarihi</th>
                                    <th scope="col" className="px-6 py-4">Puan</th>
                                    <th scope="col" className="px-6 py-4">Kayıt Durumu</th>
                                    <th scope="col" className="px-6 py-4">Başvuru</th>
                                    <th scope="col" className="px-6 py-4">Arşivlenme</th>
                                    <th scope="col" className="px-6 py-4 text-center">İşlemler</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredArchivedApplications.length === 0 ? (
                                    <tr>
                                        <td colSpan="10" className="px-6 py-12 text-center text-slate-500">
                                            <div className="flex flex-col items-center justify-center">
                                                <div className="bg-slate-50 p-4 rounded-full mb-3">
                                                    <Archive size={32} />
                                                </div>
                                                <p className="font-medium text-slate-600">Arşivlenmiş başvuru bulunamadı</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredArchivedApplications.map((app) => (
                                        <tr key={app.id} className="hover:bg-slate-50 transition-colors group">
                                            <td className="px-6 py-4">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedIds.has(app.id)}
                                                    onChange={(e) => handleSelect(app.id, e.target.checked)}
                                                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                                />
                                            </td>
                                            {/* <td className="px-6 py-4 text-slate-500 text-xs font-mono">{app.id}</td> */}
                                            <td className="px-6 py-4 font-medium text-slate-900">{app.fullName}</td>
                                            <td className="px-6 py-4 text-slate-600 text-sm">{app.tcno}</td>
                                            <td className="px-6 py-4 text-slate-600 text-sm">{app.phone || '-'}</td>
                                            <td className="px-6 py-4 text-slate-600 text-sm">
                                                {new Date(app.birthDate).toLocaleDateString('tr-TR')}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="inline-flex items-center px-2 py-1 rounded bg-blue-50 text-blue-700 font-bold text-xs">
                                                    {app.score || 0}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                {app.status ? (
                                                    <span
                                                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${getStatusStyle(app.status)}`}
                                                    >
                                                        {getStatusLabel(app.status)}
                                                    </span>
                                                ) : (
                                                    <span className="text-slate-400 text-sm">-</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-slate-500 text-sm">
                                                {new Date(app.createdAt).toLocaleDateString('tr-TR')}
                                            </td>
                                            <td className="px-6 py-4 text-slate-500 text-sm">
                                                {app.archivedAt ? new Date(app.archivedAt).toLocaleDateString('tr-TR') : '-'}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <div className="flex items-center justify-center gap-2">
                                                    <button
                                                        onClick={() => setDetailModalApp(app)}
                                                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                                        title="Detaylar"
                                                    >
                                                        <Eye size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => openNoteModal(app)}
                                                        className={`p-1.5 rounded transition-colors ${app.adminNotes ? 'text-amber-600 bg-amber-50 hover:bg-amber-100' : 'text-slate-400 hover:bg-slate-100 hover:text-slate-600'}`}
                                                        title={app.adminNotes ? `Admin notu: ${app.adminNotes.slice(0, 50)}${app.adminNotes.length > 50 ? '...' : ''}` : 'Admin notu ekle/düzenle'}
                                                    >
                                                        <MessageSquare size={16} fill={app.adminNotes ? 'currentColor' : 'none'} strokeWidth={app.adminNotes ? 1.5 : 2} />
                                                    </button>
                                                    {isSuper && (
                                                        <button
                                                            onClick={() => handleDeleteApplication(app.id, app.fullName)}
                                                            className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                                                            title="Sil"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {detailModalApp && (
                <ApplicationDetailModal
                    application={detailModalApp}
                    scoringConfig={scoringConfig}
                    onClose={() => setDetailModalApp(null)}
                />
            )}

            {/* Admin notu modal */}
            {noteModalApp && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="archived-admin-note-title"
                >
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
                        <div className="flex justify-between items-center gap-3 p-4 border-b border-slate-100 bg-slate-50">
                            <div className="flex items-center gap-2 min-w-0">
                                <MessageSquare size={20} className="text-amber-500 shrink-0" />
                                <div className="min-w-0">
                                    <h3 id="archived-admin-note-title" className="text-lg font-bold text-slate-800">Admin notu</h3>
                                    <p className="text-sm text-slate-500 truncate" title={noteModalApp.fullName}>{noteModalApp.fullName}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setNoteModalApp(null)}
                                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors shrink-0"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-4">
                            <textarea
                                value={editingNoteValue}
                                onChange={(e) => setEditingNoteValue(e.target.value)}
                                placeholder="Bu başvuru hakkında not ekleyin (isteğe bağlı)"
                                rows={4}
                                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none resize-y"
                                autoFocus
                            />
                        </div>
                        <div className="flex justify-end gap-2 p-4 border-t border-slate-100 bg-slate-50/50">
                            <button
                                type="button"
                                onClick={() => setNoteModalApp(null)}
                                className="btn btn-secondary"
                            >
                                İptal
                            </button>
                            <button
                                type="button"
                                onClick={handleSaveAdminNote}
                                disabled={savingNote}
                                className="btn btn-primary"
                            >
                                {savingNote ? 'Kaydediliyor...' : 'Kaydet'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
