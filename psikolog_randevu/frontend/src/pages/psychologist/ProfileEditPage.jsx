import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import toast from 'react-hot-toast';
import {
  Loader2, Plus, Trash2, Upload, User, GraduationCap, FileText, Save,
  Download, FileImage, FileType, AlignLeft, Eye, Camera,
} from 'lucide-react';
import { Button, Card, Input, Textarea, EmptyState } from '../../components/ui';
import TagInput from '../../components/ui/TagInput';
import { profileApi } from '../../lib/endpoints';
import { absoluteUrl } from '../../lib/markdown';

const emptyEdu = { school: '', degree: '', field: '', year: '' };

const SECTIONS = [
  { id: 'about',     label: 'Hakkımda', icon: User,       hint: 'Genel bilgiler' },
  { id: 'education', label: 'Eğitim',   icon: GraduationCap, hint: 'Diploma & sertifika' },
  { id: 'documents', label: 'Belgeler', icon: FileText,    hint: 'Dosya veya metin' },
];

const formatBytes = (b) => {
  if (!b && b !== 0) return '';
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(0)} KB`;
  return `${(b / (1024 * 1024)).toFixed(1)} MB`;
};

const docIconFor = (doc) => {
  if (doc.type === 'text') return AlignLeft;
  if (doc.mimeType?.startsWith('image/')) return FileImage;
  if (doc.mimeType === 'application/pdf') return FileType;
  return FileText;
};

const ProfileEditPage = () => {
  const [section, setSection] = useState('about');
  const [me, setMe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);

  const [form, setForm] = useState({ title: '', bio: '', specializations: [], educations: [] });

  // Belge form state
  const [docTab, setDocTab] = useState('file');
  const [docTitle, setDocTitle] = useState('');
  const [docFile, setDocFile] = useState(null);
  const [docContent, setDocContent] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [viewDoc, setViewDoc] = useState(null);
  const docFileInput = useRef(null);
  const avatarInput = useRef(null);

  const viewDocHtml = useMemo(() => {
    if (!viewDoc?.content) return '';
    try {
      const raw = marked.parse(viewDoc.content, { async: false });
      return DOMPurify.sanitize(typeof raw === 'string' ? raw : '');
    } catch {
      return '';
    }
  }, [viewDoc]);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const res = await profileApi.me();
      const d = res.data.data;
      setMe(d);
      setForm({
        title: d.title || '',
        bio: d.bio || '',
        specializations: Array.isArray(d.specializations) ? d.specializations : [],
        educations: Array.isArray(d.educations) ? d.educations : [],
      });
    } catch {
      toast.error('Profil yüklenemedi');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { reload(); }, [reload]);

  const completion = useMemo(() => {
    if (!me) return 0;
    const checks = [
      !!form.title?.trim(),
      (form.specializations || []).length > 0,
      !!form.bio?.trim() && form.bio.trim().length >= 60,
      (form.educations || []).length > 0,
      (me.documents || []).length > 0,
      !!me.avatarUrl,
    ];
    return Math.round(checks.filter(Boolean).length / checks.length * 100);
  }, [me, form]);

  const handleSaveProfile = async (e) => {
    e?.preventDefault();
    setSaving(true);
    try {
      await profileApi.update(form);
      toast.success('Profil güncellendi');
      await reload();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Güncelleme başarısız');
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarFile = async (file) => {
    if (!file) return;
    setAvatarUploading(true);
    try {
      await profileApi.uploadAvatar(file);
      toast.success('Avatar güncellendi');
      await reload();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Avatar yüklenemedi');
    } finally {
      setAvatarUploading(false);
      if (avatarInput.current) avatarInput.current.value = '';
    }
  };

  const handleDeleteAvatar = async () => {
    try {
      await profileApi.deleteAvatar();
      toast.success('Avatar silindi');
      await reload();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Silinemedi');
    }
  };

  const handleUploadFileDoc = async (e) => {
    e?.preventDefault();
    if (!docFile || !docTitle.trim()) {
      toast.error('Başlık ve dosya gerekli');
      return;
    }
    try {
      await profileApi.addDocument(docFile, docTitle.trim());
      toast.success('Belge eklendi');
      setDocTitle(''); setDocFile(null);
      if (docFileInput.current) docFileInput.current.value = '';
      await reload();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Yüklenemedi');
    }
  };

  const handleAddTextDoc = async (e) => {
    e?.preventDefault();
    if (!docTitle.trim() || !docContent.trim()) {
      toast.error('Başlık ve içerik gerekli');
      return;
    }
    try {
      await profileApi.addTextDocument(docTitle.trim(), docContent.trim());
      toast.success('Belge eklendi');
      setDocTitle(''); setDocContent('');
      await reload();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Eklenemedi');
    }
  };

  const handleDeleteDoc = async (id) => {
    if (!window.confirm('Belgeyi silmek istediğinize emin misiniz?')) return;
    try {
      await profileApi.deleteDocument(id);
      toast.success('Belge silindi');
      await reload();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Silinemedi');
    }
  };

  const updateEdu = (idx, patch) =>
    setForm((f) => ({ ...f, educations: f.educations.map((e, i) => i === idx ? { ...e, ...patch } : e) }));
  const addEdu = () =>
    setForm((f) => ({ ...f, educations: [...f.educations, { ...emptyEdu }] }));
  const removeEdu = (idx) =>
    setForm((f) => ({ ...f, educations: f.educations.filter((_, i) => i !== idx) }));

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-6 h-6 animate-spin" style={{ color: 'rgb(var(--accent))' }} />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      {/* Hero — Avatar tıklanabilir */}
      <Card className="overflow-hidden mb-8 relative">
        <div
          className="absolute inset-0 opacity-70 pointer-events-none"
          style={{
            background: 'linear-gradient(135deg, rgba(14,124,123,0.08) 0%, rgba(20,160,152,0.03) 50%, transparent 100%)',
          }}
        />
        <div className="relative p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center gap-5">

          {/* Avatar — tıklayınca yükleme */}
          <div className="relative group">
            <input
              ref={avatarInput}
              type="file"
              accept=".jpg,.jpeg,.png,.webp"
              className="hidden"
              onChange={(e) => handleAvatarFile(e.target.files?.[0])}
            />
            <button
              type="button"
              onClick={() => avatarInput.current?.click()}
              className="relative block rounded-2xl overflow-hidden focus:outline-none focus-visible:ring-2"
              style={{ '--tw-ring-color': 'rgb(var(--accent))' }}
              aria-label="Avatar yükle veya değiştir"
            >
              {me?.avatarUrl ? (
                <img
                  src={absoluteUrl(me.avatarUrl)}
                  alt={me?.user?.name}
                  className="w-20 h-20 sm:w-24 sm:h-24 object-cover ring-4"
                  style={{ '--tw-ring-color': 'rgb(var(--bg-elev))' }}
                />
              ) : (
                <div
                  className="w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center text-3xl font-extrabold text-white ring-4"
                  style={{
                    background: 'linear-gradient(135deg, rgb(var(--accent)), rgb(var(--accent-2)))',
                    '--tw-ring-color': 'rgb(var(--bg-elev))',
                  }}
                >
                  {me?.user?.name?.[0]?.toUpperCase() || 'P'}
                </div>
              )}
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                {avatarUploading
                  ? <Loader2 className="w-5 h-5 text-white animate-spin" />
                  : <Camera className="w-5 h-5 text-white" />
                }
              </div>
            </button>
            {/* Sil butonu */}
            {me?.avatarUrl && !avatarUploading && (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); handleDeleteAvatar(); }}
                className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-rose-500 text-white flex items-center justify-center text-[10px] hover:bg-rose-600 transition-colors z-10"
                aria-label="Avatarı kaldır"
              >
                ✕
              </button>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <p
              className="text-[10px] font-extrabold uppercase tracking-[0.2em] mb-1"
              style={{ color: 'rgb(var(--accent))' }}
            >
              Psikolog Profili
            </p>
            <h1
              className="font-display font-bold text-2xl sm:text-3xl mb-1 truncate"
              style={{ color: 'rgb(var(--text-1))' }}
            >
              {me?.user?.name}
            </h1>
            <p
              className="text-sm sm:text-[15px] truncate"
              style={{ color: 'rgb(var(--text-2))' }}
            >
              {form.title || 'Ünvan ekleyin'}
              {form.specializations?.length > 0 && (
                <> · {form.specializations.slice(0, 2).join(', ')}{form.specializations.length > 2 ? ` +${form.specializations.length - 2}` : ''}</>
              )}
            </p>
            <p className="text-[11px] mt-1.5" style={{ color: 'rgb(var(--text-3))' }}>
              Avatar'a tıklayarak fotoğrafınızı güncelleyebilirsiniz.
            </p>
          </div>

          {/* Tamamlanma */}
          <div
            className="flex items-center gap-3 px-4 py-3 rounded-2xl border min-w-[180px]"
            style={{ background: 'rgb(var(--bg-elev))', borderColor: 'rgba(var(--border))' }}
          >
            <div className="relative w-12 h-12">
              <svg className="w-12 h-12 -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="15" fill="none" stroke="rgba(var(--border-strong))" strokeWidth="3" />
                <circle
                  cx="18" cy="18" r="15" fill="none"
                  stroke="rgb(var(--accent))" strokeWidth="3"
                  strokeDasharray={`${(completion / 100) * 94.25} 94.25`}
                  strokeLinecap="round"
                />
              </svg>
              <span
                className="absolute inset-0 flex items-center justify-center text-[11px] font-extrabold"
                style={{ color: 'rgb(var(--text-1))' }}
              >
                %{completion}
              </span>
            </div>
            <div className="leading-tight">
              <p className="text-[11px] font-extrabold uppercase tracking-wide" style={{ color: 'rgb(var(--text-3))' }}>
                Tamamlanma
              </p>
              <p className="text-xs font-bold" style={{ color: 'rgb(var(--text-2))' }}>
                {completion === 100 ? 'Profil tam!' : 'Profilini tamamla'}
              </p>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-[220px,1fr] gap-6">
        {/* Sidebar */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          {/* Mobil */}
          <div className="lg:hidden -mx-4 px-4 overflow-x-auto pb-2 mb-1">
            <div className="inline-flex gap-2 min-w-full">
              {SECTIONS.map((s) => {
                const Icon = s.icon;
                const active = section === s.id;
                return (
                  <button
                    key={s.id}
                    onClick={() => setSection(s.id)}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all"
                    style={
                      active
                        ? { background: 'rgb(var(--accent))', color: 'white' }
                        : { background: 'rgb(var(--bg-elev))', color: 'rgb(var(--text-2))', border: '1px solid rgba(var(--border))' }
                    }
                  >
                    <Icon className="w-4 h-4" />
                    {s.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Desktop */}
          <nav className="hidden lg:flex flex-col gap-1">
            {SECTIONS.map((s) => {
              const Icon = s.icon;
              const active = section === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => setSection(s.id)}
                  className="flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-all duration-200 relative"
                  style={
                    active
                      ? { background: 'rgba(var(--accent), 0.08)', color: 'rgb(var(--accent))' }
                      : { background: 'transparent', color: 'rgb(var(--text-2))' }
                  }
                >
                  {active && (
                    <span
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-7 rounded-r"
                      style={{ background: 'rgb(var(--accent))' }}
                    />
                  )}
                  <span
                    className="w-9 h-9 rounded-lg flex items-center justify-center"
                    style={
                      active
                        ? { background: 'rgba(var(--accent), 0.15)', color: 'rgb(var(--accent))' }
                        : { background: 'rgba(var(--border))', color: 'rgb(var(--text-2))' }
                    }
                  >
                    <Icon className="w-4 h-4" />
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold leading-tight">{s.label}</div>
                    <div className="text-[11px] mt-0.5" style={{ color: active ? 'rgb(var(--accent))' : 'rgb(var(--text-3))' }}>
                      {s.hint}
                    </div>
                  </div>
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Content */}
        <section className="min-w-0">

          {/* Hakkımda */}
          {section === 'about' && (
            <Card className="p-6 sm:p-8">
              <SectionHeader icon={User} title="Genel Bilgiler"
                subtitle="Vatandaşların sizi tanırken ilk gördüğü bilgiler." />
              <form onSubmit={handleSaveProfile} className="space-y-5">
                <Field label="Ünvan">
                  <Input
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="Uzman Klinik Psikolog"
                    maxLength={120}
                  />
                </Field>
                <Field label="Çalışma Alanları" hint="Birden fazla alan ekleyebilirsiniz. Enter veya virgül ile ekleyin.">
                  <TagInput
                    value={form.specializations}
                    onChange={(v) => setForm({ ...form, specializations: v })}
                    max={10}
                  />
                </Field>
                <Field label="Hakkımda" hint="Empati uyandıran kısa bir biyografi yazın.">
                  <Textarea
                    rows={9}
                    value={form.bio}
                    onChange={(e) => setForm({ ...form, bio: e.target.value })}
                    placeholder="Yaklaşımınızı, değer verdiğiniz ilkeleri ve deneyimlerinizi paylaşın."
                    maxLength={4000}
                  />
                  <div className="text-[11px] mt-1 text-right" style={{ color: 'rgb(var(--text-3))' }}>
                    {form.bio.length}/4000
                  </div>
                </Field>
                <StickyActionBar saving={saving} onSave={handleSaveProfile} />
              </form>
            </Card>
          )}

          {/* Eğitim */}
          {section === 'education' && (
            <Card className="p-6 sm:p-8">
              <SectionHeader icon={GraduationCap} title="Eğitim Geçmişi"
                subtitle="Lisans, yüksek lisans ve katıldığınız önemli eğitim/sertifikalar." />
              {form.educations.length === 0 ? (
                <div
                  className="rounded-2xl border border-dashed py-10 text-center"
                  style={{ borderColor: 'rgba(var(--border-strong))' }}
                >
                  <EmptyState
                    icon={<GraduationCap className="w-6 h-6" />}
                    title="İlk eğitim bilginizi ekleyin"
                    description="Eğitim geçmişiniz, vatandaşların size güvenmesinde önemli bir rol oynar."
                    action={<Button type="button" onClick={addEdu}><Plus className="w-4 h-4" /> Eğitim Ekle</Button>}
                  />
                </div>
              ) : (
                <div className="space-y-3">
                  {form.educations.map((edu, idx) => (
                    <div
                      key={idx}
                      className="p-5 rounded-2xl border transition-all hover:shadow-soft"
                      style={{ borderColor: 'rgba(var(--border))', background: 'rgb(var(--bg-elev))' }}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div
                          className="w-9 h-9 rounded-lg flex items-center justify-center"
                          style={{ background: 'rgba(var(--accent), 0.10)', color: 'rgb(var(--accent))' }}
                        >
                          <GraduationCap className="w-4 h-4" />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeEdu(idx)}
                          className="p-2 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition"
                          aria-label="Eğitimi kaldır"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="sm:col-span-2">
                          <Input value={edu.school} onChange={(e) => updateEdu(idx, { school: e.target.value })} placeholder="Okul / Kurum *" />
                        </div>
                        <Input value={edu.degree} onChange={(e) => updateEdu(idx, { degree: e.target.value })} placeholder="Derece (Lisans, Yüksek Lisans...)" />
                        <Input value={edu.field} onChange={(e) => updateEdu(idx, { field: e.target.value })} placeholder="Alan (Psikoloji...)" />
                        <Input value={edu.year || ''} onChange={(e) => updateEdu(idx, { year: e.target.value })} placeholder="Yıl (2018)" />
                      </div>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addEdu}
                    className="w-full py-4 rounded-2xl border-2 border-dashed flex items-center justify-center gap-2 text-sm font-bold transition-all hover:border-[rgb(var(--accent))] hover:text-[rgb(var(--accent))]"
                    style={{ borderColor: 'rgba(var(--border-strong))', color: 'rgb(var(--text-2))' }}
                  >
                    <Plus className="w-4 h-4" /> Yeni Eğitim Ekle
                  </button>
                </div>
              )}
              <StickyActionBar saving={saving} onSave={handleSaveProfile} />
            </Card>
          )}

          {/* Belgeler */}
          {section === 'documents' && (
            <Card className="p-6 sm:p-8">
              <SectionHeader icon={FileText} title="Belgeler"
                subtitle="Diploma, sertifika veya bilgilendirici metin ekleyin." />

              {/* Sekme seçimi */}
              <div
                className="flex gap-1 p-1 rounded-xl mb-5 w-fit"
                style={{ background: 'rgb(var(--bg-muted))' }}
              >
                {[
                  { id: 'file', label: 'Dosya Yükle', Icon: Upload },
                  { id: 'text', label: 'Metin Yaz',   Icon: AlignLeft },
                ].map(({ id, label, Icon }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setDocTab(id)}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all"
                    style={
                      docTab === id
                        ? { background: 'rgb(var(--bg-elev))', color: 'rgb(var(--accent))', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }
                        : { color: 'rgb(var(--text-2))' }
                    }
                  >
                    <Icon className="w-4 h-4" /> {label}
                  </button>
                ))}
              </div>

              {/* Dosya yükleme formu */}
              {docTab === 'file' && (
                <form
                  onSubmit={handleUploadFileDoc}
                  className="rounded-2xl border-2 border-dashed p-5 sm:p-6 mb-5 transition-all"
                  style={{
                    borderColor: dragOver ? 'rgb(var(--accent))' : 'rgba(var(--border-strong))',
                    background: dragOver ? 'rgba(var(--accent), 0.04)' : 'transparent',
                  }}
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={(e) => {
                    e.preventDefault(); setDragOver(false);
                    const file = e.dataTransfer.files?.[0];
                    if (file) setDocFile(file);
                  }}
                >
                  <div className="flex flex-col items-center text-center gap-2 mb-4">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center"
                      style={{ background: 'rgba(var(--accent), 0.10)', color: 'rgb(var(--accent))' }}
                    >
                      <Upload className="w-5 h-5" />
                    </div>
                    <p className="text-sm font-bold" style={{ color: 'rgb(var(--text-1))' }}>
                      Dosya sürükleyin veya seçin
                    </p>
                    <p className="text-[11px]" style={{ color: 'rgb(var(--text-3))' }}>
                      PDF, JPG, PNG · max 5MB
                    </p>
                    {docFile && (
                      <div
                        className="mt-1 inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold"
                        style={{ background: 'rgba(var(--accent), 0.10)', color: 'rgb(var(--accent))' }}
                      >
                        <FileText className="w-3.5 h-3.5" />
                        {docFile.name} · {formatBytes(docFile.size)}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Input
                      className="flex-1"
                      placeholder="Belge başlığı (Lisans Diploması...)"
                      value={docTitle}
                      onChange={(e) => setDocTitle(e.target.value)}
                      maxLength={200}
                    />
                    <label className="flex-shrink-0">
                      <input
                        ref={docFileInput}
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => setDocFile(e.target.files?.[0] || null)}
                        className="hidden"
                      />
                      <span
                        className="inline-flex items-center justify-center w-full sm:w-auto gap-2 px-4 py-2.5 rounded-xl text-sm font-bold cursor-pointer border-[1.5px] transition hover:border-[rgb(var(--accent))]"
                        style={{ background: 'rgb(var(--bg-elev))', borderColor: 'rgba(var(--border))', color: 'rgb(var(--text-1))' }}
                      >
                        <FileText className="w-4 h-4" /> Dosya Seç
                      </span>
                    </label>
                    <Button type="submit" disabled={!docFile || !docTitle.trim()}>
                      <Upload className="w-4 h-4" /> Yükle
                    </Button>
                  </div>
                </form>
              )}

              {/* Metin belgesi formu */}
              {docTab === 'text' && (
                <form
                  onSubmit={handleAddTextDoc}
                  className="rounded-2xl border p-5 sm:p-6 mb-5 space-y-3"
                  style={{ borderColor: 'rgba(var(--border-strong))' }}
                >
                  <Input
                    placeholder="Belge başlığı (Uzmanlık Alanım, Yaklaşımım...)"
                    value={docTitle}
                    onChange={(e) => setDocTitle(e.target.value)}
                    maxLength={200}
                  />
                  <Textarea
                    rows={6}
                    placeholder="Belge içeriğini buraya yazın. Markdown desteklenmektedir."
                    value={docContent}
                    onChange={(e) => setDocContent(e.target.value)}
                    maxLength={10000}
                  />
                  <div className="flex items-center justify-between">
                    <p className="text-[11px]" style={{ color: 'rgb(var(--text-3))' }}>
                      {docContent.length}/10.000 karakter
                    </p>
                    <Button type="submit" disabled={!docTitle.trim() || !docContent.trim()}>
                      <Plus className="w-4 h-4" /> Ekle
                    </Button>
                  </div>
                </form>
              )}

              {/* Belge listesi */}
              {!me?.documents?.length ? (
                <EmptyState
                  icon={<FileText className="w-6 h-6" />}
                  title="Henüz belge yok"
                  description="Yukarıdaki alandan dosya yükleyin veya metin ekleyin."
                />
              ) : (
                <ul className="space-y-2">
                  {me.documents.map((doc) => {
                    const Icon = docIconFor(doc);
                    return (
                      <li
                        key={doc.id}
                        className="flex items-center justify-between gap-3 p-4 rounded-2xl border transition hover:shadow-soft"
                        style={{ borderColor: 'rgba(var(--border))', background: 'rgb(var(--bg-elev))' }}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                            style={{ background: 'rgba(var(--accent), 0.10)', color: 'rgb(var(--accent))' }}
                          >
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-bold truncate" style={{ color: 'rgb(var(--text-1))' }}>
                              {doc.title}
                            </p>
                            <p className="text-[11px]" style={{ color: 'rgb(var(--text-3))' }}>
                              {doc.type === 'text' ? 'Metin belgesi' : `${formatBytes(doc.sizeBytes)} · ${doc.mimeType}`}
                              {' · '}
                              {new Date(doc.createdAt).toLocaleDateString('tr-TR')}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          {doc.type === 'text' ? (
                            <button
                              onClick={() => setViewDoc(doc)}
                              className="p-2 rounded-lg transition hover:bg-[rgba(var(--accent),0.08)]"
                              style={{ color: 'rgb(var(--text-2))' }}
                              aria-label="Görüntüle"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          ) : (
                            <a
                              href={absoluteUrl(doc.fileUrl)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 rounded-lg transition hover:bg-[rgba(var(--accent),0.08)]"
                              style={{ color: 'rgb(var(--text-2))' }}
                              aria-label="İndir"
                            >
                              <Download className="w-4 h-4" />
                            </a>
                          )}
                          <button
                            onClick={() => handleDeleteDoc(doc.id)}
                            className="p-2 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition"
                            aria-label="Sil"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </Card>
          )}
        </section>
      </div>

      {/* Metin belgesi görüntüleme modal */}
      {viewDoc && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.5)' }}
          onClick={() => setViewDoc(null)}
        >
          <div
            className="w-full max-w-lg max-h-[80vh] overflow-y-auto rounded-2xl p-6"
            style={{ background: 'rgb(var(--bg-elev))', border: '1px solid rgba(var(--border))' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg" style={{ color: 'rgb(var(--text-1))' }}>
                {viewDoc.title}
              </h3>
              <button
                onClick={() => setViewDoc(null)}
                className="p-1.5 rounded-lg hover:bg-[rgba(var(--border))]"
                style={{ color: 'rgb(var(--text-2))' }}
              >
                ✕
              </button>
            </div>
            {viewDocHtml ? (
              <div
                className="text-sm leading-relaxed prose-markdown max-w-none [&_a]:text-[rgb(var(--accent))] [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5"
                style={{ color: 'rgb(var(--text-2))' }}
                dangerouslySetInnerHTML={{ __html: viewDocHtml }}
              />
            ) : (
              <div
                className="text-sm whitespace-pre-wrap leading-relaxed"
                style={{ color: 'rgb(var(--text-2))' }}
              >
                {viewDoc.content}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const SectionHeader = ({ icon: Icon, title, subtitle }) => (
  <div className="flex items-start gap-3 mb-6 pb-5 border-b" style={{ borderColor: 'rgba(var(--border))' }}>
    <div
      className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
      style={{ background: 'rgba(var(--accent), 0.10)', color: 'rgb(var(--accent))' }}
    >
      <Icon className="w-5 h-5" />
    </div>
    <div>
      <h2 className="text-lg sm:text-xl font-extrabold" style={{ color: 'rgb(var(--text-1))' }}>{title}</h2>
      <p className="text-sm mt-0.5" style={{ color: 'rgb(var(--text-2))' }}>{subtitle}</p>
    </div>
  </div>
);

const Field = ({ label, hint, children }) => (
  <div>
    <label className="label">{label}</label>
    {children}
    {hint && <p className="text-[11px] mt-1.5" style={{ color: 'rgb(var(--text-3))' }}>{hint}</p>}
  </div>
);

const StickyActionBar = ({ saving, onSave }) => (
  <div
    className="sticky bottom-4 mt-6 -mx-6 sm:-mx-8 px-6 sm:px-8 py-4 flex items-center justify-end gap-2 rounded-b-2xl"
    style={{ background: 'rgba(var(--bg-elev), 0.92)', backdropFilter: 'blur(8px)', borderTop: '1px solid rgba(var(--border))' }}
  >
    <p className="text-xs mr-auto hidden sm:block" style={{ color: 'rgb(var(--text-3))' }}>
      Değişiklikleriniz kaydedildikten sonra herkese görünür.
    </p>
    <Button onClick={onSave} disabled={saving}>
      {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
      {saving ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
    </Button>
  </div>
);

export default ProfileEditPage;
