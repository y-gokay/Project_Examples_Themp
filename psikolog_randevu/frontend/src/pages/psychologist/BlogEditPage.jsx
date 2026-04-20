import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Loader2, Save, Upload, ArrowLeft, Eye } from 'lucide-react';
import { Button, Card, Input, Textarea, Tabs, Badge } from '../../components/ui';
import { blogApi } from '../../lib/endpoints';
import { renderMarkdown, absoluteUrl } from '../../lib/markdown';

const BlogEditPage = () => {
  const { id } = useParams();
  const isNew = !id;
  const navigate = useNavigate();

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: '', excerpt: '', content: '', status: 'draft',
  });
  const [coverUrl, setCoverUrl] = useState('');
  const [mode, setMode] = useState('edit');

  const load = useCallback(async () => {
    if (isNew) return;
    setLoading(true);
    try {
      const res = await blogApi.getMine(id);
      const d = res.data.data;
      setForm({
        title: d.title || '',
        excerpt: d.excerpt || '',
        content: d.content || '',
        status: d.status || 'draft',
      });
      setCoverUrl(d.coverImageUrl || '');
    } catch {
      toast.error('Yazı yüklenemedi');
      navigate('/yazilarim');
    } finally {
      setLoading(false);
    }
  }, [id, isNew, navigate]);

  useEffect(() => { load(); }, [load]);

  const handleSave = async (e) => {
    e?.preventDefault();
    if (form.title.trim().length < 3) {
      toast.error('Başlık en az 3 karakter olmalı');
      return;
    }
    if (form.content.trim().length < 10) {
      toast.error('İçerik en az 10 karakter olmalı');
      return;
    }
    setSaving(true);
    try {
      if (isNew) {
        const res = await blogApi.create(form);
        toast.success('Taslak oluşturuldu');
        navigate(`/yazilarim/${res.data.data.id}/duzenle`, { replace: true });
      } else {
        await blogApi.update(id, form);
        toast.success('Kaydedildi');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Kaydedilemedi');
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    if (isNew) {
      toast.error('Önce yazıyı kaydedin');
      return;
    }
    setSaving(true);
    try {
      if (form.status === 'published') {
        await blogApi.unpublish(id);
        setForm((f) => ({ ...f, status: 'draft' }));
        toast.success('Taslağa alındı');
      } else {
        await blogApi.publish(id);
        setForm((f) => ({ ...f, status: 'published' }));
        toast.success('Yayınlandı');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'İşlem başarısız');
    } finally {
      setSaving(false);
    }
  };

  const handleCover = async (e) => {
    const file = e.target.files?.[0];
    if (!file || isNew) {
      if (isNew) toast.error('Önce yazıyı kaydedin');
      return;
    }
    try {
      const res = await blogApi.uploadCover(id, file);
      setCoverUrl(res.data.data.coverImageUrl);
      toast.success('Kapak güncellendi');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Yüklenemedi');
    }
  };

  const previewHtml = useMemo(() => renderMarkdown(form.content), [form.content]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-6 h-6 animate-spin" style={{ color: 'rgb(var(--accent))' }} />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex items-center justify-between mb-6 gap-3 flex-wrap">
        <button
          onClick={() => navigate('/yazilarim')}
          className="inline-flex items-center gap-2 text-sm font-semibold"
          style={{ color: 'rgb(var(--text-2))' }}
        >
          <ArrowLeft className="w-4 h-4" /> Yazılarım
        </button>
        <div className="flex items-center gap-2">
          {!isNew && (
            form.status === 'published'
              ? <Badge tone="approved">Yayında</Badge>
              : <Badge tone="pending">Taslak</Badge>
          )}
          {!isNew && (
            <Button variant="secondary" onClick={handlePublish} disabled={saving}>
              {form.status === 'published' ? 'Taslağa Al' : 'Yayınla'}
            </Button>
          )}
          <Button onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Kaydet
          </Button>
        </div>
      </div>

      <Card className="p-6 mb-5">
        <div className="space-y-4">
          <div>
            <label className="label">Başlık *</label>
            <Input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Örn. Kaygı ile Baş Etmenin 5 Yolu"
              maxLength={200}
            />
          </div>
          <div>
            <label className="label">Kısa özet (opsiyonel)</label>
            <Textarea
              rows={2}
              value={form.excerpt}
              onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
              placeholder="Kart görünümünde kullanılacak 1-2 cümle."
              maxLength={400}
            />
          </div>

          {!isNew && (
            <div>
              <label className="label">Kapak Görseli</label>
              <div className="flex items-center gap-3 flex-wrap">
                {coverUrl && (
                  <img
                    src={absoluteUrl(coverUrl)}
                    alt="Cover"
                    className="w-40 h-24 object-cover rounded-xl border"
                    style={{ borderColor: 'rgba(var(--border))' }}
                  />
                )}
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept=".jpg,.jpeg,.png,.webp"
                    className="hidden"
                    onChange={handleCover}
                  />
                  <span
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold border"
                    style={{ borderColor: 'rgba(var(--border))', color: 'rgb(var(--text-1))' }}
                  >
                    <Upload className="w-4 h-4" /> Yükle
                  </span>
                </label>
                <p className="text-xs" style={{ color: 'rgb(var(--text-3))' }}>
                  Max 3MB, 1600×900'e sığdırılır
                </p>
              </div>
            </div>
          )}
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <Tabs
            value={mode}
            onChange={setMode}
            tabs={[
              { value: 'edit', label: 'Düzenle' },
              { value: 'preview', label: 'Önizle' },
            ]}
          />
          <p className="text-xs" style={{ color: 'rgb(var(--text-3))' }}>
            Markdown desteklenir — **kalın**, *italik*, # başlık, liste...
          </p>
        </div>

        {mode === 'edit' ? (
          <Textarea
            rows={20}
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
            placeholder="Yazınızı markdown formatında yazın..."
            maxLength={60000}
            className="font-mono text-sm"
          />
        ) : (
          <div
            className="prose max-w-none"
            style={{ color: 'rgb(var(--text-1))' }}
            dangerouslySetInnerHTML={{ __html: previewHtml }}
          />
        )}
      </Card>
    </div>
  );
};

export default BlogEditPage;
