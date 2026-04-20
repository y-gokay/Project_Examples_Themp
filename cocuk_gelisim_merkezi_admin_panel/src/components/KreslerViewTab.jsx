import { useState, useEffect } from 'react';
import { kresAPI, adminAPI } from '../services/api';
import KresDetailModal from './KresDetailModal';
import { Search, Eye, MapPin, Building2 } from 'lucide-react';

export default function KreslerViewTab() {
    const [allKresler, setAllKresler] = useState([]);
    const [filteredKresler, setFilteredKresler] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedKres, setSelectedKres] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        applyFilter();
    }, [searchTerm, allKresler]);

    const loadData = async () => {
        try {
            setLoading(true);
            const [kresData, appData] = await Promise.all([
                kresAPI.getAllKresler(),
                adminAPI.getApplications(false)
            ]);
            setAllKresler(kresData.items || []);
            setApplications(appData.items || []);
        } catch (error) {
            alert('Veriler yüklenemedi: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const applyFilter = () => {
        let filtered = [...allKresler];
        if (searchTerm) {
            filtered = filtered.filter(
                (kres) =>
                    kres.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    (kres.address &&
                        kres.address.toLowerCase().includes(searchTerm.toLowerCase()))
            );
        }
        setFilteredKresler(filtered);
    };

    const getSelectedApplicationsByStatus = (kresId) => {
        const selectedApps = applications.filter(app => 
            app.selectedKres && 
            app.selectedKres.id === kresId && 
            app.status !== null && 
            app.status !== undefined
        );
        
        return {
            total: selectedApps.length,
            bekliyor: selectedApps.filter(app => app.status === 'bekliyor').length,
            kayitYaptirdi: selectedApps.filter(app => app.status === 'kayıt_yaptırdı').length,
            kayitYaptirmadi: selectedApps.filter(app => app.status === 'kayıt_yaptırmadı').length,
            ulasilamadi: selectedApps.filter(app => app.status === 'ulaşılamadı').length,
        };
    };
    
    const getRegistrationCount = (kresId) => {
        return applications.filter(app => 
            app.selectedKres && 
            app.selectedKres.id === kresId && 
            app.status === 'kayıt_yaptırdı'
        ).length;
    };

    const getEmptyQuota = (kres) => {
        return kres.remainingQuota || 0;
    };

    const handleShowDetail = (kres) => {
        setSelectedKres(kres);
        setShowDetailModal(true);
    };

    const handleCloseDetail = () => {
        setShowDetailModal(false);
        setSelectedKres(null);
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                <div className="text-slate-500 font-medium">Yükleniyor...</div>
            </div>
        );
    }

    return (
        <>
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input
                            type="text"
                            className="input-field pl-10"
                            placeholder="Çocuk gelişim merkezi adı veya adres ile ara..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500 font-semibold">
                                    <th className="px-6 py-4">ID</th>
                                    <th className="px-6 py-4">Çocuk Gelişim Merkezi Adı</th>
                                    <th className="px-6 py-4">Kayıt Sayısı</th>
                                    <th className="px-6 py-4">Boş Kontenjan</th>
                                    <th className="px-6 py-4">Adres</th>
                                    <th className="px-6 py-4 text-center">İşlemler</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredKresler.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-12 text-center">
                                            <div className="flex flex-col items-center justify-center text-slate-400">
                                                <div className="bg-slate-50 p-4 rounded-full mb-3">
                                                    <Building2 size={32} />
                                                </div>
                                                <p className="font-medium text-slate-600">Çocuk gelişim merkezi bulunamadı</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredKresler.map((kres) => {
                                        const registrationCount = getRegistrationCount(kres.id);
                                        const emptyQuota = getEmptyQuota(kres);
                                        const statusBreakdown = getSelectedApplicationsByStatus(kres.id);

                                        return (
                                            <tr key={kres.id} className="hover:bg-slate-50 transition-colors group">
                                                <td className="px-6 py-4 text-slate-500 font-mono text-xs">{kres.id}</td>
                                                <td className="px-6 py-4">
                                                    <div className="font-medium text-slate-900">{kres.name}</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">
                                                        {registrationCount} Kayıt
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                                                        emptyQuota > 0 ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'
                                                    }`}>
                                                        {emptyQuota} Boş
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    {kres.address ? (
                                                        <div className="flex items-start gap-2 text-sm text-slate-600 max-w-[200px]">
                                                            <MapPin size={14} className="mt-1 shrink-0 text-slate-400" />
                                                            <span className="truncate">{kres.address}</span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-slate-400">-</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <button
                                                        className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                        onClick={() => handleShowDetail(kres)}
                                                        disabled={statusBreakdown.total === 0}
                                                        title={statusBreakdown.total === 0 ? 'Bu çocuk gelişim merkezi için seçilmiş başvuru yok' : 'Detayları Görüntüle'}
                                                    >
                                                        <Eye size={16} />
                                                        Detay
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {showDetailModal && selectedKres && (
                <KresDetailModal
                    kres={selectedKres}
                    applications={applications}
                    onClose={handleCloseDetail}
                    onStatusUpdate={loadData}
                />
            )}
        </>
    );
}
