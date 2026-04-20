import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Loader2, User } from 'lucide-react';
import toast from 'react-hot-toast';
import { Card } from '../../components/ui';
import { blogApi } from '../../lib/endpoints';
import { renderMarkdown, absoluteUrl } from '../../lib/markdown';

const formatDate = (d) => {
  if (!d) return '';
  try {
    return new Date(d).toLocaleDateString('tr-TR', {
      day: '2-digit', month: 'long', year: 'numeric',
    });
  } catch { return ''; }
};

const BlogDetailPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    blogApi
      .getPublic(slug)
      .then((res) => setPost(res.data.data))
      .catch(() => {
        toast.error('Yazı bulunamadı');
        navigate('/blog');
      })
      .finally(() => setLoading(false));
  }, [slug, navigate]);

  const html = useMemo(() => renderMarkdown(post?.content), [post?.content]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-6 h-6 animate-spin" style={{ color: 'rgb(var(--accent))' }} />
      </div>
    );
  }
  if (!post) return null;

  const author = post.psychologist;
  const authorName = author?.user?.name;
  const authorSpecLine =
    Array.isArray(author?.specializations) && author.specializations.length > 0
      ? author.specializations.slice(0, 2).join(' · ')
      : null;

  return (
    <article className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <Link
        to="/blog"
        className="inline-flex items-center gap-1.5 text-sm font-bold mb-8 transition"
        style={{ color: 'rgb(var(--text-2))' }}
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Tüm yazılar
      </Link>

      {post.coverImageUrl && (
        <img
          src={absoluteUrl(post.coverImageUrl)}
          alt={post.title}
          className="w-full aspect-[16/9] object-cover rounded-2xl mb-6"
        />
      )}

      <h1 className="font-display font-bold text-3xl sm:text-4xl mb-4 leading-tight" style={{ color: 'rgb(var(--text-1))' }}>
        {post.title}
      </h1>

      <div className="flex items-center gap-3 mb-8 pb-6 border-b" style={{ borderColor: 'rgba(var(--border))' }}>
        {author?.avatarUrl ? (
          <img
            src={absoluteUrl(author.avatarUrl)}
            alt={authorName}
            className="w-10 h-10 rounded-full object-cover"
          />
        ) : (
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(var(--accent), 0.12)', color: 'rgb(var(--accent))' }}
          >
            <User className="w-5 h-5" />
          </div>
        )}
        <div className="min-w-0">
          {author?.id ? (
            <Link
              to={`/psikologlar/${author.id}`}
              className="text-sm font-bold hover:underline block"
              style={{ color: 'rgb(var(--text-1))' }}
            >
              {authorName}
            </Link>
          ) : (
            <div className="text-sm font-bold" style={{ color: 'rgb(var(--text-1))' }}>
              {authorName}
            </div>
          )}
          <div className="text-xs" style={{ color: 'rgb(var(--text-3))' }}>
            {author?.title || authorSpecLine || 'Psikolog'} · {formatDate(post.publishedAt)}
          </div>
        </div>
      </div>

      <div
        className="blog-content text-[15px] leading-relaxed"
        style={{ color: 'rgb(var(--text-1))' }}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </article>
  );
};

export default BlogDetailPage;
