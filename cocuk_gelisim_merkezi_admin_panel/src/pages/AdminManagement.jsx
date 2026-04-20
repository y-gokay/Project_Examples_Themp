import { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';
import { Plus, Trash2, Shield, User } from 'lucide-react';

export default function AdminManagement() {
    const [admins, setAdmins] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [newUsername, setNewUsername] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        loadAdmins();
    }, []);

    const loadAdmins = async () => {
        try {
            setLoading(true);
            setError('');
            const data = await adminAPI.listAdmins();
            setAdmins(data.items || []);
        } catch (err) {
            setError(err.message || 'Adminler yüklenemedi');
            setAdmins([]);
        } finally {
            setLoading(false);
        }
    };

    const handleAddAdmin = async (e) => {
        e.preventDefault();
        setError('');

        try {
            await adminAPI.createAdmin(newUsername, newPassword);
            setShowModal(false);
            setNewUsername('');
            setNewPassword('');
            await loadAdmins();
        } catch (err) {
            setError(err.message);
        }
    };

    const handleDeleteAdmin = async (id) => {
        if (!confirm('Bu admini silmek istediğinize emin misiniz?')) {
            return;
        }

        try {
            await adminAPI.deleteAdmin(id);
            await loadAdmins();
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <>
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800">Yönetici Listesi</h2>
                        <p className="text-slate-500 text-sm mt-1">Sistem yöneticilerini ve yetkilerini buradan yönetebilirsiniz.</p>
                    </div>
                    <button
                        className="btn btn-primary gap-2 shadow-lg shadow-blue-200"
                        onClick={() => setShowModal(true)}
                    >
                        <Plus size={18} />
                        Yeni Admin Ekle
                    </button>
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500 font-semibold tracking-wider">
                                    <th className="px-6 py-5">ID</th>
                                    <th className="px-6 py-5">Kullanıcı Adı</th>
                                    <th className="px-6 py-5">Rol</th>
                                    <th className="px-6 py-5">Oluşturulma</th>
                                    <th className="px-6 py-5 text-center">İşlemler</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {loading ? (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-12 text-center text-slate-500">
                                            <div className="flex flex-col items-center gap-2">
                                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                                <span>Yükleniyor...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : admins.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-12 text-center text-slate-500">
                                            Henüz admin bulunmuyor
                                        </td>
                                    </tr>
                                ) : (
                                    admins.map((admin) => (
                                        <tr key={admin.id} className="hover:bg-slate-50/80 transition-colors group">
                                            <td className="px-6 py-4 text-slate-400 font-mono text-xs">#{admin.id}</td>
                                            <td className="px-6 py-4">
                                                <div className="font-semibold text-slate-900 flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs text-slate-600 font-bold uppercase">
                                                        {admin.username.substring(0, 2)}
                                                    </div>
                                                    {admin.username}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span
                                                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border shadow-sm ${
                                                        admin.role === 'super'
                                                            ? 'bg-purple-50 text-purple-700 border-purple-100'
                                                            : 'bg-blue-50 text-blue-700 border-blue-100'
                                                    }`}
                                                >
                                                    {admin.role === 'super' ? <Shield size={12} className="fill-purple-200" /> : <User size={12} className="fill-blue-200" />}
                                                    {admin.role === 'super' ? 'Süper Admin' : 'Admin'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-slate-500 text-sm">
                                                {new Date(admin.createdAt).toLocaleDateString('tr-TR', { year: 'numeric', month: 'short', day: 'numeric' })}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                {admin.role !== 'super' ? (
                                                <button
                                                    className="inline-flex items-center justify-center w-8 h-8 text-red-500 hover:bg-red-50 hover:text-red-600 rounded-lg transition-all"
                                                    title="Sil"
                                                    onClick={() => handleDeleteAdmin(admin.id)}
                                                >
                                                        <Trash2 size={16} />
                                                    </button>
                                                ) : (
                                                    <span className="text-slate-300">-</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {showModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform scale-100 transition-all">
                        <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-slate-50">
                            <h3 className="text-lg font-bold text-gray-800">Yeni Admin Ekle</h3>
                            <button 
                                onClick={() => setShowModal(false)}
                                className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-white"
                            >
                                &times;
                            </button>
                        </div>
                        
                        <form onSubmit={handleAddAdmin} className="p-6 space-y-5">
                            <div className="space-y-2">
                                <label htmlFor="newUsername" className="block text-sm font-medium text-gray-700">
                                    Kullanıcı Adı
                                </label>
                                <input
                                    type="text"
                                    id="newUsername"
                                    className="input-field bg-slate-50 focus:bg-white"
                                    value={newUsername}
                                    onChange={(e) => setNewUsername(e.target.value)}
                                    required
                                    minLength={3}
                                    placeholder="örn: admin"
                                />
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                                    Şifre
                                </label>
                                <input
                                    type="password"
                                    id="newPassword"
                                    className="input-field bg-slate-50 focus:bg-white"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    required
                                    minLength={8}
                                    placeholder="********"
                                />
                            </div>
                            
                            {error && (
                                <div className="p-4 text-sm text-red-600 bg-red-50 rounded-xl border border-red-100 flex items-center gap-2">
                                    <span className="font-bold">Hata:</span> {error}
                                </div>
                            )}

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    className="btn btn-secondary flex-1"
                                    onClick={() => {
                                        setShowModal(false);
                                        setError('');
                                        setNewUsername('');
                                        setNewPassword('');
                                    }}
                                >
                                    İptal
                                </button>
                                <button type="submit" className="btn btn-primary flex-1">
                                    Admin Oluştur
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
