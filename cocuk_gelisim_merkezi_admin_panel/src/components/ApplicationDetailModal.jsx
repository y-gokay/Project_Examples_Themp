import { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';
import { X, User, MapPin, Users, Wallet, Activity, ClipboardList, Building2, Calendar, CheckCircle, MessageSquare } from 'lucide-react';

export default function ApplicationDetailModal({ application, onClose, onStatusUpdate }) {
    const [status, setStatus] = useState(application?.status || '');
    const [adminNotes, setAdminNotes] = useState(application?.adminNotes ?? '');
    const [updating, setUpdating] = useState(false);
    const [savingNote, setSavingNote] = useState(false);
    const [isAddressExpanded, setIsAddressExpanded] = useState(false);
    const [isExtraAddressExpanded, setIsExtraAddressExpanded] = useState(false);

    const handleStatusChange = async (newStatus) => {
        if (!application?.id) return;

        setUpdating(true);
        try {
            await adminAPI.updateApplicationStatus(application.id, newStatus, adminNotes || undefined);
            setStatus(newStatus);
            if (onStatusUpdate) {
                onStatusUpdate();
            }
        } catch (error) {
            alert('Durum güncellenemedi: ' + error.message);
        } finally {
            setUpdating(false);
        }
    };

    const handleSaveAdminNote = async () => {
        if (!application?.id) return;

        setSavingNote(true);
        try {
            await adminAPI.updateApplicationStatus(application.id, status, adminNotes || undefined);
            if (onStatusUpdate) {
                onStatusUpdate();
            }
        } catch (error) {
            alert('Admin notu kaydedilemedi: ' + error.message);
        } finally {
            setSavingNote(false);
        }
    };

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                e.preventDefault();
                onClose();
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
    }, [onClose, savingNote]);

    if (!application) return null;

    const statusOptions = [
        { value: 'bekliyor', label: 'Bekliyor', color: 'orange' },
        { value: 'kayıt_yaptırdı', label: 'Kayıt Yaptırdı', color: 'green' },
        { value: 'kayıt_yaptırmadı', label: 'Kayıt Yaptırmadı', color: 'red' },
        { value: 'ulaşılamadı', label: 'Ulaşılamadı', color: 'slate' },
    ];

    const capitalizeWords = (str) => {
        if (str == null || str === '') return str;
        return String(str)
            .split(/\s+/)
            .map((w) => (w.charAt(0).toLocaleUpperCase('tr-TR') + w.slice(1).toLocaleLowerCase('tr-TR')))
            .join(' ');
    };

    const getFullAddress = () => {
        if (application.adress && application.adress.trim().length > 0) {
            return application.adress;
        }

        const addressParts = [];
        if (application.neighborhood) addressParts.push(application.neighborhood + ' Mah.');
        if (application.district) addressParts.push(application.district);
        if (application.city) addressParts.push(application.city);
        if (application.province) addressParts.push(application.province);

        if (addressParts.length === 0) return '-';
        return addressParts.join(', ');
    };

    const fullAddress = getFullAddress();
    const shouldTruncate = fullAddress?.length > 150;
    const truncatedAddress = shouldTruncate && !isAddressExpanded
        ? fullAddress.substring(0, 150) + '...'
        : fullAddress;

    const extraAddress = application.secondaryAddress || null;
    const shouldTruncateExtra = extraAddress?.length > 150;
    const truncatedExtraAddress = shouldTruncateExtra && !isExtraAddressExpanded
        ? extraAddress.substring(0, 150) + '...'
        : extraAddress;

    const DetailSection = ({ title, icon: Icon, children }) => (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden mb-4 last:mb-0">
            <div className="px-5 py-3.5 bg-slate-50/80 border-b border-slate-100 flex items-center gap-2">
                {Icon && <Icon className="text-blue-500 shrink-0" size={18} />}
                <h4 className="font-semibold text-slate-800 text-sm">{title}</h4>
            </div>
            <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5">
                {children}
            </div>
        </div>
    );

    const DetailItem = ({ label, value, fullWidth = false }) => (
        <div className={`flex flex-col gap-1 ${fullWidth ? 'col-span-full sm:col-span-2 lg:col-span-full' : ''}`}>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">{label}</span>
            <div className="font-medium text-slate-900 break-words text-sm leading-relaxed">{value}</div>
        </div>
    );

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-200"
            onClick={(e) => e.target === e.currentTarget && onClose()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="application-detail-title"
        >
            <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl border border-slate-100 overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-lg">
                            {application.fullName.charAt(0)}
                        </div>
                        <div>
                            <h3 id="application-detail-title" className="text-xl font-bold text-slate-800">
                                {application.fullName}
                            </h3>
                            <div className="text-sm text-slate-500 flex items-center gap-2">
                                <span>ID: #{application.id}</span>
                                <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                                <span>{new Date(application.createdAt).toLocaleDateString('tr-TR')}</span>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
                        type="button"
                        aria-label="Pencereyi kapat"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-5 sm:p-6 bg-slate-50/60">

                    {/* Status Card (if applicable) */}
                    {(application.status || application.selectedKres) && (
                        <div className="bg-white p-5 rounded-xl border border-blue-100 shadow-sm mb-4 flex flex-col gap-4">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="flex items-start gap-4">
                                    <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                                        <CheckCircle size={24} />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-slate-800 mb-1">Başvuru Durumu</h4>
                                        {application.selectedKres ? (
                                            <div className="text-sm text-slate-600 space-y-1">
                                                <div>
                                                    <span className="font-medium text-slate-900">{application.selectedKres.name}</span>
                                                    {' '}tarafından kabul edildi.
                                                </div>
                                                {application.selectedAgeGroup?.name && (
                                                    <div className="text-slate-500">
                                                        Yerleştirme yaş grubu:{' '}
                                                        <span className="font-medium text-slate-700">{application.selectedAgeGroup.name}</span>
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="text-sm text-slate-500">Henüz bir çocuk gelişim merkezine yerleştirilmedi.</div>
                                        )}
                                    </div>
                                </div>

                                {application.status && (
                                    <div className="flex items-center gap-3 bg-slate-50 p-2 rounded-lg border border-slate-200">
                                        <select
                                            value={status}
                                            onChange={(e) => handleStatusChange(e.target.value)}
                                            disabled={updating}
                                            className="bg-transparent text-sm font-medium text-slate-700 focus:outline-none cursor-pointer"
                                        >
                                            <option value="">Durum Seçin</option>
                                            {statusOptions.map((option) => (
                                                <option key={option.value} value={option.value}>
                                                    {option.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                            </div>

                            {/* Admin notu */}
                            <div className="border-t border-slate-100 pt-4">
                                <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                                    <MessageSquare size={14} className="text-slate-400" />
                                    Admin notu
                                </label>
                                <div className="flex flex-col sm:flex-row gap-2">
                                    <textarea
                                        value={adminNotes}
                                        onChange={(e) => setAdminNotes(e.target.value)}
                                        placeholder="Bu başvuru hakkında not ekleyin (isteğe bağlı)"
                                        rows={2}
                                        className="flex-1 w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none resize-y min-h-[60px]"
                                    />
                                    <button
                                        type="button"
                                        onClick={handleSaveAdminNote}
                                        disabled={savingNote}
                                        className="btn btn-secondary shrink-0 self-end sm:self-auto"
                                    >
                                        {savingNote ? 'Kaydediliyor...' : 'Notu Kaydet'}
                                    </button>
                                </div>
                                <p className="text-xs text-slate-400 mt-1">Durum değiştirirken de mevcut not gönderilir.</p>
                            </div>
                        </div>
                    )}

                    <DetailSection title="Kişisel Bilgiler" icon={User}>
                        <DetailItem label="TC Kimlik No" value={application.tcno} />
                        <DetailItem label="Doğum Tarihi" value={new Date(application.birthDate).toLocaleDateString('tr-TR')} />
                        <DetailItem label="Telefon" value={application.phone || '-'} />
                        <DetailItem
                            label="Atakum Belediyesi Çalışanı"
                            value={application.isMunicipalityEmployee === true ? 'Evet' : application.isMunicipalityEmployee === false ? 'Hayır' : '-'}
                        />
                        <DetailItem
                            label="Adres"
                            fullWidth
                            value={
                                <div>
                                    <div className="text-slate-700 leading-relaxed">
                                        {truncatedAddress || '-'}
                                    </div>
                                    {shouldTruncate && (
                                        <button
                                            onClick={() => setIsAddressExpanded(!isAddressExpanded)}
                                            className="text-xs text-blue-600 hover:text-blue-700 font-medium mt-1"
                                        >
                                            {isAddressExpanded ? 'Daha az göster' : 'Daha fazla göster'}
                                        </button>
                                    )}
                                </div>
                            }
                        />
                        {extraAddress && (
                            <DetailItem
                                label="Ekstra Adres"
                                fullWidth
                                value={
                                    <div>
                                        <div className="text-slate-700 leading-relaxed">
                                            {truncatedExtraAddress}
                                        </div>
                                        {shouldTruncateExtra && (
                                            <button
                                                onClick={() => setIsExtraAddressExpanded(!isExtraAddressExpanded)}
                                                className="text-xs text-blue-600 hover:text-blue-700 font-medium mt-1"
                                            >
                                                {isExtraAddressExpanded ? 'Daha az göster' : 'Daha fazla göster'}
                                            </button>
                                        )}
                                    </div>
                                }
                            />
                        )}
                    </DetailSection>

                    <DetailSection title="Çocuk Bilgileri" icon={Calendar}>
                        <DetailItem
                            label="Ad Soyad"
                            value={
                                application.childFirstName || application.childLastName
                                    ? `${application.childFirstName || ''} ${application.childLastName || ''}`.trim()
                                    : '-'
                            }
                        />
                        <DetailItem label="TC Kimlik No" value={application.childTcno || '-'} />
                        <DetailItem
                            label="Doğum Tarihi"
                            value={
                                application.childBirthDate
                                    ? new Date(application.childBirthDate).toLocaleDateString('tr-TR')
                                    : '-'
                            }
                        />
                        <DetailItem
                            label="1 Eylül İtibarıyla Yaşı"
                            value={
                                application.childBirthDate
                                    ? (() => {
                                        const birth = new Date(application.childBirthDate);
                                        const refDate = new Date(new Date().getFullYear(), 8, 1); // 1 Eylül
                                        let months = (refDate.getFullYear() - birth.getFullYear()) * 12;
                                        months -= birth.getMonth();
                                        months += refDate.getMonth();
                                        if (refDate.getDate() < birth.getDate()) {
                                            months--;
                                        }
                                        return `${Math.floor(months / 12)} yaş ${months % 12} ay`;
                                    })()
                                    : '-'
                            }
                        />
                        <DetailItem
                            label="Cinsiyet"
                            value={
                                application.childGender
                                    ? capitalizeWords(application.childGender)
                                    : '-'
                            }
                        />
                        <DetailItem
                            label="Tuvalet Eğitimi"
                            value={
                                application.childToiletTrained === true ? 'Evet'
                                    : application.childToiletTrained === false ? 'Hayır'
                                        : application.childToiletTrained != null ? String(application.childToiletTrained)
                                            : '-'
                            }
                        />
                    </DetailSection>

                    <DetailSection title="Aile Bilgileri" icon={Users}>
                        <DetailItem label="Aile Büyüklüğü" value={`${application.familySize} kişi`} />
                        <DetailItem label="Öğrenci Sayısı" value={application.numberOfStudentsInFamily} />
                        <DetailItem label="Çalışan Sayısı" value={application.employeesNumberOfFamily} />
                        <DetailItem label="Engelli Üye" value={application.disabledMembersInFamily ? capitalizeWords(application.disabledMembersInFamily) : 'Yok'} />
                    </DetailSection>

                    <DetailSection title="Gelir Bilgileri" icon={Wallet}>
                        <DetailItem
                            label="Toplam Gelir"
                            value={
                                application.totalIncome != null
                                    ? `${Number(application.totalIncome).toLocaleString('tr-TR')} ₺`
                                    : application.incomeRange
                                        ? `${application.incomeRange.minIncome?.toLocaleString('tr-TR') ?? '-'} - ${application.incomeRange.maxIncome?.toLocaleString('tr-TR') ?? '-'} ₺`
                                        : '-'
                            }
                        />
                        <DetailItem label="Ek Gelir" value={application.additionalIncome ? 'Var' : 'Yok'} />
                        <DetailItem
                            label="Kira Bedeli"
                            value={application.houseRentalFee != null && application.houseRentalFee !== ''
                                ? `${Number(application.houseRentalFee).toLocaleString('tr-TR')} ₺`
                                : 'Ev Sahibi'}
                        />
                        <DetailItem
                            label="Maaş Bedeli"
                            value={application.familyPensionAmount != null ? `${Number(application.familyPensionAmount).toLocaleString('tr-TR')} ₺` : '-'}
                        />
                    </DetailSection>

                    <DetailSection title="Diğer Bilgiler" icon={Activity}>
                        <DetailItem label="Sosyal Güvenlik" value={application.socialSecurity} />
                        <DetailItem label="Isınma Sistemi" value={application.houseHeatingSystem ? capitalizeWords(application.houseHeatingSystem) : '-'} />
                        <DetailItem label="Kronik Hastalık" value={application.chronicDisease ? 'Var' : 'Yok'} />
                        <DetailItem label="Sosyal Yardım" value={application.socialAssistanceHistory || 'Yok'} />

                        {application.chronicDisease && application.chronicDiseaseNote && (
                            <DetailItem
                                label="Kronik Hastalık Açıklama"
                                fullWidth
                                value={application.chronicDiseaseNote}
                            />
                        )}
                        <DetailItem label="Notlar" fullWidth value={application.notes || '-'} />
                    </DetailSection>

                    {(application.firstChoiceKres || application.secondChoiceKres || application.thirdChoiceKres || application.fourthChoiceKres) && (
                        <DetailSection title="Çocuk Gelişim Merkezi Tercihleri" icon={Building2}>
                            {application.firstChoiceKres && (
                                <DetailItem
                                    label="1. Tercih"
                                    value={
                                        <div>
                                            <div className="font-semibold text-blue-700">{application.firstChoiceKres.name}</div>
                                            <div className="text-xs text-slate-500 mt-1">{application.firstChoiceKres.address}</div>
                                        </div>
                                    }
                                />
                            )}
                            {application.secondChoiceKres && (
                                <DetailItem
                                    label="2. Tercih"
                                    value={
                                        <div>
                                            <div className="font-semibold text-slate-700">{application.secondChoiceKres.name}</div>
                                            <div className="text-xs text-slate-500 mt-1">{application.secondChoiceKres.address}</div>
                                        </div>
                                    }
                                />
                            )}
                            {application.thirdChoiceKres && (
                                <DetailItem
                                    label="3. Tercih"
                                    value={
                                        <div>
                                            <div className="font-semibold text-slate-600">{application.thirdChoiceKres.name}</div>
                                            <div className="text-xs text-slate-500 mt-1">{application.thirdChoiceKres.address}</div>
                                        </div>
                                    }
                                />
                            )}
                            {application.fourthChoiceKres && (
                                <DetailItem
                                    label="4. Tercih"
                                    value={
                                        <div>
                                            <div className="font-semibold text-slate-600">{application.fourthChoiceKres.name}</div>
                                            <div className="text-xs text-slate-500 mt-1">{application.fourthChoiceKres.address}</div>
                                        </div>
                                    }
                                />
                            )}
                        </DetailSection>
                    )}
                </div>
            </div>
        </div>
    );
}
