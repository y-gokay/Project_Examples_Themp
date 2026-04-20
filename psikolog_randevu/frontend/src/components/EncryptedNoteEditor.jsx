import { useState } from 'react';
import { Tag } from 'lucide-react';
import { Button, Card, Input, Textarea, Badge } from './ui';
import { useCryptoKeys } from '../context/KeyContext';

/**
 * Başlık, etiketler ve gövde; kayıt öncesi şifreleme üst bileşende (PatientNotesPage) yapılır.
 * Anahtar kilitliyse kısa uyarı gösterir.
 */
const EncryptedNoteEditor = ({ onSave, onCancel }) => {
  const { privateKey, status } = useCryptoKeys();
  const [title, setTitle] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState([]);
  const [body, setBody] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const addTag = () => {
    const v = tagInput.trim();
    if (!v) return;
    if (!tags.includes(v)) setTags([...tags, v]);
    setTagInput('');
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!privateKey) return;
    if (!body.trim()) return;
    setSubmitting(true);
    try {
      await onSave({ title: title.trim(), tags, body: body.trim() });
      setTitle('');
      setTags([]);
      setBody('');
      onCancel?.();
    } finally {
      setSubmitting(false);
    }
  };

  const locked = status === 'locked' || status === 'missing' || !privateKey;

  return (
    <Card className="p-5 mt-2 transition-[opacity,transform] duration-150">
      {locked && (
        <p className="text-sm text-amber-700 dark:text-amber-300/90 mb-3 rounded-lg px-3 py-2 bg-amber-500/10 border border-amber-500/20">
          Not eklemek için önce şifreleme anahtarını açın (üstteki veya Hastalar ekranındaki
          kilidi kullanın).
        </p>
      )}
      <form onSubmit={submit} className="space-y-3">
        <Input
          placeholder="Başlık (opsiyonel)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={locked}
        />
        <div className="flex gap-2">
          <Input
            placeholder="Etiket ekle (Enter)"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            disabled={locked}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addTag();
              }
            }}
          />
          <Button type="button" variant="secondary" onClick={addTag} disabled={locked}>
            Ekle
          </Button>
        </div>
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {tags.map((t) => (
              <Badge
                key={t}
                tone="accent"
                className="cursor-pointer"
                onClick={() => !locked && setTags(tags.filter((x) => x !== t))}
              >
                <Tag className="w-3 h-3" /> {t} ×
              </Badge>
            ))}
          </div>
        )}
        <Textarea
          rows={5}
          placeholder="Not içeriği… (istemcide şifrelenir)"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          required
          disabled={locked}
        />
        <div className="flex justify-end gap-2">
          {onCancel && (
            <Button type="button" variant="ghost" onClick={onCancel} disabled={submitting}>
              Vazgeç
            </Button>
          )}
          <Button type="submit" disabled={submitting || locked}>
            {submitting ? 'Kaydediliyor…' : 'Şifrele & Kaydet'}
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default EncryptedNoteEditor;
