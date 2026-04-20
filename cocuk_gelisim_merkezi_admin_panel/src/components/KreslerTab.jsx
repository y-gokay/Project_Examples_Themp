import { useState, useEffect } from 'react';
import { kresAPI } from '../services/api';
import { getPhotoUrl } from '../services/auth';
import KresModal from './KresModal';
import { Search, Plus, Edit2, Trash2, MapPin, Phone, Mail, Image as ImageIcon } from 'lucide-react';

export default function KreslerTab({ isSuperAdmin = false }) {
    const [allKresler, setAllKresler] = useState([]);
    const [filteredKresler, setFilteredKresler] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingKres, setEditingKres] = useState(null);

    useEffect(() => {
        loadKresler();
    }, []);

    useEffect(() => {
        applyFilter();
    }, [searchTerm, allKresler]);

    const loadKresler = async () => {
        try {
            const data = await kresAPI.getAllKresler();
            setAllKresler(data.items);
        } catch (error) {
            alert('Çocuk gelişim merkezleri yüklenemedi: ' + error.message);
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

    const handleAddKres = () => {
        setEditingKres(null);
        setShowModal(true);
    };

    const handleEditKres = async (id) => {
        try {
            const kres = await kresAPI.getKres(id);
            setEditingKres(kres);
            setShowModal(true);
        } catch (error) {
            alert('Çocuk gelişim merkezi bilgileri yüklenemedi: ' + error.message);
        }
    };

    const handleDeleteKres = async (id) => {
        const kres = allKresler.find((k) => k.id === id);
        if (!kres) return;

        if (
            !confirm(
                `"${kres.name}" adlı çocuk gelişim merkezini silmek istediğinize emin misiniz?`
            )
        ) {
            return;
        }

        try {
            await kresAPI.deleteKres(id);
            await loadKresler();
        } catch (error) {
            alert('Çocuk gelişim merkezi silinemedi: ' + error.message);
        }
    };

    const handleModalClose = () => {
        setShowModal(false);
        setEditingKres(null);
    };

    const handleModalSuccess = () => {
        loadKresler();
        handleModalClose();
    };

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
                    {isSuperAdmin && (
                        <button className="btn btn-primary gap-2" onClick={handleAddKres}>
                            <Plus size={18} />
                            Yeni Çocuk Gelişim Merkezi Ekle
                        </button>
                    )}
                </div>

                <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500 font-semibold">
                                    <th className="px-6 py-4">ID</th>
                                    <th className="px-6 py-4">Fotoğraf</th>
                                    <th className="px-6 py-4">Çocuk Gelişim Merkezi Adı</th>
                                    <th className="px-6 py-4">Adres</th>
                                    <th className="px-6 py-4">İletişim</th>
                                    <th className="px-6 py-4 text-center">İşlemler</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredKresler.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-12 text-center">
                                            <div className="flex flex-col items-center justify-center text-slate-400">
                                                <div className="bg-slate-50 p-4 rounded-full mb-3">
                                                    <Search size={32} />
                                                </div>
                                                <p className="font-medium text-slate-600">Çocuk gelişim merkezi bulunamadı</p>
                                                <p className="text-sm">Arama kriterlerinizi değiştirerek tekrar deneyin</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredKresler.map((kres) => {
                                        const photos = kres.photos && kres.photos.length > 0 ? kres.photos : [];
                                        const firstPhoto = photos.length > 0 ? getPhotoUrl(photos[0].photoPath) : null;
                                        const photoCount = photos.length;

                                        return (
                                            <tr key={kres.id} className="hover:bg-slate-50 transition-colors group">
                                                <td className="px-6 py-4 text-slate-500 font-mono text-xs">{kres.id}</td>
                                                <td className="px-6 py-4">
                                                    {firstPhoto ? (
                                                        <div className="relative inline-block">
                                                            <img
                                                                src={firstPhoto}
                                                                alt={kres.name}
                                                                className="w-12 h-12 object-cover rounded-lg border border-slate-200"
                                                            />
                                                            {photoCount > 1 && (
                                                                <span className="absolute -bottom-1 -right-1 bg-slate-800 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border-2 border-white">
                                                                    +{photoCount - 1}
                                                                </span>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400">
                                                            <ImageIcon size={20} />
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="font-medium text-slate-900">{kres.name}</div>
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
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-col gap-1">
                                                        {kres.phone && (
                                                            <div className="flex items-center gap-2 text-sm text-slate-600">
                                                                <Phone size={14} className="text-slate-400" />
                                                                {kres.phone}
                                                            </div>
                                                        )}
                                                        {kres.email && (
                                                            <div className="flex items-center gap-2 text-sm text-slate-600">
                                                                <Mail size={14} className="text-slate-400" />
                                                                {kres.email}
                                                            </div>
                                                        )}
                                                        {!kres.phone && !kres.email && <span className="text-slate-400">-</span>}
                                                    </div>
                                                </td>
                                            <td className="px-6 py-4 text-center">
                                                {isSuperAdmin ? (
                                                    <div className="flex items-center justify-center gap-2">
                                                        <button
                                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                                onClick={() => handleEditKres(kres.id)}
                                                                title="Düzenle"
                                                            >
                                                                <Edit2 size={16} />
                                                            </button>
                                                            <button
                                                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                                onClick={() => handleDeleteKres(kres.id)}
                                                                title="Sil"
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <span className="text-slate-300">-</span>
                                                    )}
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

            {showModal && (
                <KresModal
                    kres={editingKres}
                    onClose={handleModalClose}
                    onSuccess={handleModalSuccess}
                />
            )}
        </>
    );
}
