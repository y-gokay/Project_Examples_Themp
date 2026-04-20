import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowLeft, NotebookPen, Trash2, Plus, Tag } from 'lucide-react';
import { Button, Card, EmptyState, Badge } from '../../components/ui';
import KeyGate from '../../components/KeyGate';
import EncryptedNoteEditor from '../../components/EncryptedNoteEditor';
import { useCryptoKeys } from '../../context/KeyContext';
import { encryptNote, decryptNote } from '../../lib/crypto';
import { notesApi } from '../../lib/endpoints';

const PatientNotesPage = () => {
  const { userId } = useParams();
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <Link
        to="/psikolog/hastalar"
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 dark:hover:text-white mb-4"
      >
        <ArrowLeft className="w-4 h-4" /> Hastalar
      </Link>
      <KeyGate>
        <NotesContent userId={Number(userId)} />
      </KeyGate>
    </div>
  );
};

const NotesContent = ({ userId }) => {
  const { publicKey, privateKey } = useCryptoKeys();
  const [notes, setNotes] = useState([]);
  const [decrypted, setDecrypted] = useState({});
  const [loading, setLoading] = useState(true);
  const [showEditor, setShowEditor] = useState(false);
  const [patient, setPatient] = useState(null);

  const fetchNotes = async () => {
    setLoading(true);
    try {
      const [notesRes, patientsRes] = await Promise.all([
        notesApi.list(userId),
        notesApi.patients(),
      ]);
      setNotes(notesRes.data.data);
      setPatient(patientsRes.data.data.find((p) => p.userId === userId) || null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Notlar yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  useEffect(() => {
    if (!privateKey) return;
    (async () => {
      const next = {};
      for (const n of notes) {
        if (decrypted[n.id]) {
          next[n.id] = decrypted[n.id];
          continue;
        }
        try {
          next[n.id] = await decryptNote(n, privateKey);
        } catch {
          next[n.id] = { _error: true };
        }
      }
      setDecrypted(next);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notes, privateKey]);

  const handleSave = async ({ title, tags, body }) => {
    if (!publicKey) return toast.error('Anahtar hazır değil');
    const payload = await encryptNote({ title, tags, body }, publicKey);
    try {
      await notesApi.create({ userId, ...payload });
      toast.success('Not eklendi');
      setShowEditor(false);
      fetchNotes();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Kaydedilemedi');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Notu silmek istediğinize emin misiniz?')) return;
    try {
      await notesApi.remove(id);
      toast.success('Not silindi');
      fetchNotes();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Silinemedi');
    }
  };

  return (
    <div>
      <div className="flex items-end justify-between gap-4 mb-6">
        <div>
          <p className="text-xs font-medium text-violet-600 dark:text-violet-400 uppercase tracking-wide mb-1">
            E2E Şifreli Notlar
          </p>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">
            {patient?.name || 'Hasta'}
          </h1>
          {patient && (
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {patient.email}
            </p>
          )}
        </div>
        <Button onClick={() => setShowEditor((s) => !s)}>
          <Plus className="w-4 h-4" /> {showEditor ? 'Kapat' : 'Yeni Not'}
        </Button>
      </div>

      {showEditor && (
        <EncryptedNoteEditor onSave={handleSave} onCancel={() => setShowEditor(false)} />
      )}

      {loading ? (
        <div className="space-y-3 mt-4">
          {[...Array(2)].map((_, i) => (
            <Card key={i} className="h-24 animate-pulse" />
          ))}
        </div>
      ) : notes.length === 0 ? (
        <Card className="mt-4">
          <EmptyState
            icon={<NotebookPen className="w-7 h-7" />}
            title="Henüz not yok"
            description="İlk notunuzu ekleyin. Sadece sizin şifrenizle okunabilir."
          />
        </Card>
      ) : (
        <div className="space-y-3 mt-4">
          {notes.map((n) => {
            const d = decrypted[n.id];
            return (
              <Card key={n.id} className="p-5">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white">
                      {d ? (d._error ? 'Çözülemedi' : d.title || 'Başlıksız') : 'Çözülüyor…'}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {new Date(n.createdAt).toLocaleString('tr-TR')}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDelete(n.id)}
                    className="text-slate-400 hover:text-rose-500 transition"
                    aria-label="Sil"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                {d && !d._error && (
                  <>
                    {d.tags?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-2">
                        {d.tags.map((t) => (
                          <Badge key={t} tone="accent">
                            <Tag className="w-3 h-3" /> {t}
                          </Badge>
                        ))}
                      </div>
                    )}
                    <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                      {d.body}
                    </p>
                  </>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PatientNotesPage;
