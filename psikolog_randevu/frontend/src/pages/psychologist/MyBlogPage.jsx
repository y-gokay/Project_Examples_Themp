import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Loader2, Plus, Pencil, Trash2, Eye, EyeOff, FileText } from 'lucide-react';
import { Button, Card, Badge, Tabs, EmptyState } from '../../components/ui';
import { blogApi } from '../../lib/endpoints';

const formatDate = (d) => {
  if (!d) return '—';
  try {
    return new Date(d).toLocaleDateString('tr-TR', {
      day: '2-digit', month: 'short', year: 'numeric',
    });
  } catch { return '—'; }
};

const MyBlogPage = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await blogApi.listMine();
      setItems(res.data.data.items || []);
    } catch {
      toast.error('Yazılar yüklenemedi');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handlePublish = async (id, isPublished) => {
    try {
      if (isPublished) {
        await blogApi.unpublish(id);
        toast.success('Taslağa alındı');
      } else {
        await blogApi.publish(id);
        toast.success('Yayınlandı');
      }
      await load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'İşlem başarısız');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Yazıyı silmek istediğinize emin misiniz?')) return;
    try {
      await blogApi.remove(id);
      toast.success('Yazı silindi');
      await load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Silinemedi');
    }
  };

  const visible = items.filter((p) => filter === 'all' || p.status === filter);

  const counts = {
    all: items.length,
    published: items.filter((p) => p.status === 'published').length,
    draft: items.filter((p) => p.status === 'draft').length,
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex items-center justify-between mb-6 gap-3 flex-wrap">
        <div>
          <h1 className="font-display font-bold text-2xl mb-1" style={{ color: 'rgb(var(--text-1))' }}>
            Yazılarım
          </h1>
          <p className="text-sm" style={{ color: 'rgb(var(--text-2))' }}>
            Blog yazılarınızı yönetin — taslak, yayınla, düzenle.
          </p>
        </div>
        <Button onClick={() => navigate('/yazilarim/yeni')}>
          <Plus className="w-4 h-4" /> Yeni Yazı
        </Button>
      </div>

      <div className="mb-5">
        <Tabs
          value={filter}
          onChange={setFilter}
          tabs={[
            { value: 'all', label: 'Tümü', count: counts.all },
            { value: 'published', label: 'Yayında', count: counts.published },
            { value: 'draft', label: 'Taslak', count: counts.draft },
          ]}
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-6 h-6 animate-spin" style={{ color: 'rgb(var(--accent))' }} />
        </div>
      ) : visible.length === 0 ? (
        <Card className="p-8">
          <EmptyState
            icon={<FileText className="w-6 h-6" />}
            title="Henüz yazı yok"
            description="İlk blog yazınızı oluşturun ve hastalarınıza değerli içerikler sunun."
            action={
              <Button onClick={() => navigate('/yazilarim/yeni')}>
                <Plus className="w-4 h-4" /> İlk Yazıyı Oluştur
              </Button>
            }
          />
        </Card>
      ) : (
        <div className="space-y-3">
          {visible.map((p) => (
            <Card key={p.id} className="p-5">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {p.status === 'published' ? (
                      <Badge tone="approved">Yayında</Badge>
                    ) : (
                      <Badge tone="pending">Taslak</Badge>
                    )}
                    <span className="text-xs" style={{ color: 'rgb(var(--text-3))' }}>
                      {p.status === 'published' ? formatDate(p.publishedAt) : `Güncelleme: ${formatDate(p.updatedAt)}`}
                    </span>
                  </div>
                  <h3 className="text-base font-bold truncate" style={{ color: 'rgb(var(--text-1))' }}>
                    {p.title}
                  </h3>
                  {p.excerpt && (
                    <p className="text-sm mt-1 line-clamp-2" style={{ color: 'rgb(var(--text-2))' }}>
                      {p.excerpt}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handlePublish(p.id, p.status === 'published')}
                    title={p.status === 'published' ? 'Taslağa al' : 'Yayınla'}
                  >
                    {p.status === 'published' ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </Button>
                  <Link to={`/yazilarim/${p.id}/duzenle`}>
                    <Button variant="ghost" size="sm">
                      <Pencil className="w-4 h-4" />
                    </Button>
                  </Link>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(p.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyBlogPage;
