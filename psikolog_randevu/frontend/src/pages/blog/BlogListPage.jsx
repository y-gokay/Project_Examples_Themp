import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, Search, BookOpen } from 'lucide-react';
import toast from 'react-hot-toast';
import { Card, Input, EmptyState, Button } from '../../components/ui';
import { blogApi } from '../../lib/endpoints';
import { absoluteUrl } from '../../lib/markdown';

const formatDate = (d) => {
  if (!d) return '';
  try {
    return new Date(d).toLocaleDateString('tr-TR', {
      day: '2-digit', month: 'short', year: 'numeric',
    });
  } catch { return ''; }
};

const BlogListPage = () => {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [q, setQ] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const limit = 12;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await blogApi.listPublic({ q: searchTerm || undefined, page, limit });
      setItems(res.data.data.items || []);
      setTotal(res.data.data.total || 0);
    } catch {
      toast.error('Yazılar yüklenemedi');
    } finally {
      setLoading(false);
    }
  }, [searchTerm, page]);

  useEffect(() => { load(); }, [load]);

  const onSearch = (e) => {
    e.preventDefault();
    setPage(1);
    setSearchTerm(q.trim());
  };

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
      <div className="mb-8 text-center">
        <div
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs font-extrabold uppercase tracking-widest mb-4"
          style={{
            background: 'rgba(var(--accent-2), 0.08)',
            borderColor: 'rgba(var(--accent-2), 0.20)',
            color: 'rgb(var(--accent-2))',
          }}
        >
          <BookOpen className="w-3.5 h-3.5" />
          Blog
        </div>
        <h1 className="font-display font-bold text-3xl sm:text-4xl mb-2" style={{ color: 'rgb(var(--text-1))' }}>
          Uzmanlardan İçerikler
        </h1>
        <p className="text-sm" style={{ color: 'rgb(var(--text-2))' }}>
          Psikologlarımızın kaleme aldığı yazıları keşfedin.
        </p>
      </div>

      <form onSubmit={onSearch} className="flex gap-2 max-w-xl mx-auto mb-8">
        <div className="relative flex-1">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
            style={{ color: 'rgb(var(--text-3))' }}
          />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Yazı ara..."
            className="pl-10"
          />
        </div>
        <Button type="submit">Ara</Button>
      </form>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-6 h-6 animate-spin" style={{ color: 'rgb(var(--accent))' }} />
        </div>
      ) : items.length === 0 ? (
        <Card className="p-8">
          <EmptyState
            icon={<BookOpen className="w-6 h-6" />}
            title="Henüz yazı bulunmuyor"
            description="Yakında uzmanlarımızın yazılarıyla burada olacağız."
          />
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {items.map((p) => (
              <Link key={p.id} to={`/blog/${p.slug}`}>
                <Card className="overflow-hidden h-full hover:-translate-y-1 transition-transform duration-200">
                  <div
                    className="w-full aspect-[16/9] bg-cover bg-center"
                    style={{
                      background: p.coverImageUrl
                        ? `url(${absoluteUrl(p.coverImageUrl)}) center/cover`
                        : 'linear-gradient(135deg, rgb(var(--accent)), rgb(var(--accent-2)))',
                    }}
                  />
                  <div className="p-5">
                    <h3 className="font-bold text-base mb-2 line-clamp-2" style={{ color: 'rgb(var(--text-1))' }}>
                      {p.title}
                    </h3>
                    {p.excerpt && (
                      <p className="text-sm mb-3 line-clamp-3" style={{ color: 'rgb(var(--text-2))' }}>
                        {p.excerpt}
                      </p>
                    )}
                    <div className="flex items-center justify-between text-xs" style={{ color: 'rgb(var(--text-3))' }}>
                      <span className="font-bold">{p.psychologist?.user?.name}</span>
                      <span>{formatDate(p.publishedAt)}</span>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <Button variant="secondary" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                ← Önceki
              </Button>
              <span className="text-sm font-bold" style={{ color: 'rgb(var(--text-2))' }}>
                {page} / {totalPages}
              </span>
              <Button variant="secondary" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
                Sonraki →
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default BlogListPage;
