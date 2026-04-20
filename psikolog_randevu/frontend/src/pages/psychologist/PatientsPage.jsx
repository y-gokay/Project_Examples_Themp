import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Users, ArrowRight } from 'lucide-react';
import { notesApi } from '../../lib/endpoints';
import { Card, EmptyState, Input } from '../../components/ui';
import KeyGate from '../../components/KeyGate';

const PatientsPage = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');

  useEffect(() => {
    notesApi
      .patients()
      .then((r) => setPatients(r.data.data))
      .catch(() => toast.error('Hastalar yüklenemedi'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = patients.filter((p) => {
    const needle = q.trim().toLowerCase();
    if (!needle) return true;
    return (
      p.name.toLowerCase().includes(needle) || p.email.toLowerCase().includes(needle)
    );
  });

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-6">
        <p className="text-xs font-medium text-violet-600 dark:text-violet-400 tracking-wide uppercase mb-1">
          Klinik Not
        </p>
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">
          Hastalarım
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Yalnızca onayladığın hastalar için şifreli not tutabilirsin.
        </p>
      </div>

      <KeyGate>
        <div className="mb-4 max-w-sm">
          <Input
            placeholder="Hasta ara…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>

        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="h-16 animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <Card>
            <EmptyState
              icon={<Users className="w-7 h-7" />}
              title="Henüz onaylı hastan yok"
              description="Bekleyen randevu taleplerini panelden onaylayarak burada görünmelerini sağlayabilirsin."
            />
          </Card>
        ) : (
          <div className="space-y-2">
            {filtered.map((p) => (
              <Link
                key={p.userId}
                to={`/psikolog/hastalar/${p.userId}/notlar`}
                className="block"
              >
                <Card className="p-4 hover:border-violet-300 dark:hover:border-violet-500/40 transition">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-full bg-violet-100 dark:bg-violet-500/10 text-violet-700 dark:text-violet-300 flex items-center justify-center font-semibold">
                        {p.name?.[0]?.toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-slate-900 dark:text-white truncate">
                          {p.name}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                          {p.email}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                      <span>Son seans: {new Date(p.lastDate).toLocaleDateString('tr-TR')}</span>
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </KeyGate>
    </div>
  );
};

export default PatientsPage;
