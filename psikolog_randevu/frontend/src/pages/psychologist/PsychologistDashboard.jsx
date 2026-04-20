import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  CalendarClock,
  Check,
  X,
  ClipboardList,
  Search,
} from "lucide-react";
import { appointmentsApi } from "../../lib/endpoints";
import { useAuth } from "../../context/AuthContext";
import {
  Button,
  Card,
  Badge,
  EmptyState,
  Input,
  Dialog,
  Textarea,
} from "../../components/ui";
import { resolveAppointmentDisplay } from "../../lib/appointmentDisplay";

const TAB_ITEMS = [
  { value: "pending",  label: "Bekleyen",  dot: true },
  { value: "upcoming", label: "Yaklaşan",  dot: false },
  { value: "past",     label: "Geçmiş",    dot: false },
];

const PsychologistDashboard = () => {
  const { user } = useAuth();
  const [tab, setTab] = useState("pending");
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [rejectTarget, setRejectTarget] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [counts, setCounts] = useState({ pending: 0, upcoming: 0, past: 0 });

  const fetchList = async (scope, q = "") => {
    setLoading(true);
    try {
      if (scope === "past") {
        const res = await appointmentsApi.history({ scope: "past", q: q || undefined });
        setList(res.data.data);
      } else if (scope === "pending") {
        const res = await appointmentsApi.pending();
        setList(res.data.data);
      } else {
        const res = await appointmentsApi.psychologistList({ scope: "upcoming" });
        setList(res.data.data);
      }
    } catch {
      toast.error("Randevular yüklenemedi");
    } finally {
      setLoading(false);
    }
  };

  const refreshCounts = async () => {
    try {
      const [pending, upcoming, past] = await Promise.all([
        appointmentsApi.pending(),
        appointmentsApi.psychologistList({ scope: "upcoming" }),
        appointmentsApi.history({ scope: "past" }),
      ]);
      setCounts({
        pending: pending.data.data.length,
        upcoming: upcoming.data.data.length,
        past: past.data.data.length,
      });
    } catch {
      // swallow
    }
  };

  useEffect(() => { fetchList(tab, query); }, [tab]);
  useEffect(() => { refreshCounts(); }, []);
  useEffect(() => {
    if (tab !== "past") return undefined;
    const t = setTimeout(() => fetchList("past", query), 300);
    return () => clearTimeout(t);
  }, [query]);

  const decide = async (id, decision, reason) => {
    try {
      await appointmentsApi.decision(id, { decision, reason });
      toast.success(decision === "approved" ? "Randevu onaylandı" : "Randevu reddedildi");
      fetchList(tab, query);
      refreshCounts();
    } catch (err) {
      toast.error(err.response?.data?.message || "İşlem başarısız");
    }
  };

  const cancelAppt = async (id) => {
    if (!confirm("Randevuyu iptal etmek istediğinize emin misiniz?")) return;
    try {
      await appointmentsApi.cancel(id);
      toast.success("Randevu iptal edildi");
      fetchList(tab, query);
      refreshCounts();
    } catch (err) {
      toast.error(err.response?.data?.message || "İşlem başarısız");
    }
  };

  const tabLabel = useMemo(() => {
    const map = { pending: "Bekleyen", upcoming: "Yaklaşan", past: "Geçmiş" };
    return map[tab];
  }, [tab]);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
      {/* Başlık */}
      <div className="mb-6">
        <p
          className="text-[10px] font-extrabold uppercase tracking-[0.2em] mb-1"
          style={{ color: 'rgb(var(--accent))' }}
        >
          Randevu Yönetimi
        </p>
        <h1
          className="text-2xl sm:text-3xl font-bold"
          style={{ color: 'rgb(var(--text-1))' }}
        >
          Hoş geldin, {user?.name?.split(' ')[0]}
        </h1>
        <p className="text-sm mt-1" style={{ color: 'rgb(var(--text-2))' }}>
          Randevu taleplerini yönet, hasta notlarını güvenle tut.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Sol: Dikey tab (desktop) / Yatay (mobil) */}
        <div className="md:w-44 flex-shrink-0">
          {/* Mobil: yatay */}
          <div className="flex md:hidden gap-2 mb-4">
            {TAB_ITEMS.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => setTab(value)}
                className="flex-1 px-3 py-2 rounded-xl text-sm font-bold transition-all border"
                style={
                  tab === value
                    ? { background: 'rgb(var(--accent))', color: 'white', borderColor: 'rgb(var(--accent))' }
                    : { background: 'transparent', color: 'rgb(var(--text-2))', borderColor: 'rgba(var(--border))' }
                }
              >
                {label}
                {counts[value] > 0 && (
                  <span
                    className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full text-[10px] font-extrabold"
                    style={tab === value
                      ? { background: 'rgba(255,255,255,0.25)', color: 'white' }
                      : { background: 'rgba(var(--accent), 0.15)', color: 'rgb(var(--accent))' }
                    }
                  >
                    {counts[value]}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Desktop: dikey */}
          <nav className="hidden md:flex flex-col gap-1">
            {TAB_ITEMS.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => setTab(value)}
                className="flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold transition-all relative text-left"
                style={
                  tab === value
                    ? { background: 'rgba(var(--accent), 0.10)', color: 'rgb(var(--accent))' }
                    : { color: 'rgb(var(--text-2))' }
                }
              >
                {tab === value && (
                  <span
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r"
                    style={{ background: 'rgb(var(--accent))' }}
                  />
                )}
                {label}
                {counts[value] > 0 && (
                  <span
                    className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-[10px] font-extrabold"
                    style={tab === value
                      ? { background: 'rgba(var(--accent), 0.20)', color: 'rgb(var(--accent))' }
                      : { background: 'rgba(var(--border))', color: 'rgb(var(--text-2))' }
                    }
                  >
                    {counts[value]}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Sağ: İçerik */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-3 mb-4">
            <h2 className="text-base font-bold" style={{ color: 'rgb(var(--text-1))' }}>
              {tabLabel} Randevular
            </h2>
            {tab === "past" && (
              <div className="relative w-56">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'rgb(var(--text-3))' }} />
                <Input
                  placeholder="Hasta adı veya e-posta"
                  className="pl-9"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>
            )}
          </div>

          {loading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="h-20 animate-pulse" />
              ))}
            </div>
          ) : list.length === 0 ? (
            <Card>
              <EmptyState
                icon={<CalendarClock className="w-7 h-7" />}
                title={
                  tab === "pending"
                    ? "Bekleyen talep yok"
                    : tab === "upcoming"
                      ? "Yaklaşan randevu yok"
                      : "Geçmiş kayıt yok"
                }
                description={
                  tab === "pending"
                    ? "Yeni talepler buraya düşecek."
                    : tab === "upcoming"
                      ? "Onayladığın yaklaşan randevular burada listelenir."
                      : "Geçmiş ve iptal edilen randevular burada görünür."
                }
              />
            </Card>
          ) : (
            <div className="space-y-3">
              {list.map((apt) => (
                <AppointmentRow
                  key={apt.id}
                  apt={apt}
                  tab={tab}
                  onApprove={() => decide(apt.id, "approved")}
                  onReject={() => { setRejectTarget(apt); setRejectReason(""); }}
                  onCancel={() => cancelAppt(apt.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <Dialog
        open={!!rejectTarget}
        onClose={() => setRejectTarget(null)}
        title="Randevuyu reddet"
        description="Dilerseniz kısa bir açıklama bırakabilirsiniz (hastaya görünür)."
        footer={
          <>
            <Button variant="ghost" onClick={() => setRejectTarget(null)}>Vazgeç</Button>
            <Button
              variant="danger"
              onClick={async () => {
                await decide(rejectTarget.id, "rejected", rejectReason.trim() || undefined);
                setRejectTarget(null);
              }}
            >
              Reddet
            </Button>
          </>
        }
      >
        <Textarea
          rows={3}
          maxLength={500}
          value={rejectReason}
          onChange={(e) => setRejectReason(e.target.value)}
          placeholder="Sebep (opsiyonel)"
        />
      </Dialog>
    </div>
  );
};

const AppointmentRow = ({ apt, tab, onApprove, onReject, onCancel }) => {
  const initial = apt.user?.name?.[0]?.toUpperCase();
  const disp = resolveAppointmentDisplay(apt);
  return (
    <Card className="p-4 sm:p-5">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm flex-shrink-0 text-white"
            style={{ background: 'linear-gradient(135deg, rgb(var(--accent)), rgb(var(--accent-2)))' }}
          >
            {initial}
          </div>
          <div className="min-w-0">
            <p className="font-medium truncate" style={{ color: 'rgb(var(--text-1))' }}>
              {apt.user?.name}
            </p>
            <p className="text-xs truncate" style={{ color: 'rgb(var(--text-3))' }}>
              {apt.user?.email}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm" style={{ color: 'rgb(var(--text-2))' }}>
          <ClipboardList className="w-4 h-4" style={{ color: 'rgb(var(--text-3))' }} />
          <span>{new Date(apt.date).toLocaleDateString("tr-TR")}</span>
          <span style={{ color: 'rgb(var(--text-3))' }}>·</span>
          <span>{apt.startTime?.substring(0, 5)} – {apt.endTime?.substring(0, 5)}</span>
        </div>

        <div className="flex items-center gap-2">
          <Badge tone={disp.tone}>{disp.label}</Badge>
          {tab === "pending" && (
            <>
              <Button size="sm" onClick={onApprove}>
                <Check className="w-4 h-4" /> Onayla
              </Button>
              <Button size="sm" variant="secondary" onClick={onReject}>
                <X className="w-4 h-4" /> Reddet
              </Button>
            </>
          )}
          {tab === "upcoming" && (
            <Button size="sm" variant="ghost" onClick={onCancel}>
              <X className="w-4 h-4" /> İptal
            </Button>
          )}
        </div>
      </div>

      {apt.userNotes && (
        <p
          className="mt-3 text-xs rounded-lg px-3 py-2 border"
          style={{
            background: "rgba(var(--accent), 0.06)",
            borderColor: "rgba(var(--border))",
            color: "rgb(var(--text-2))",
          }}
        >
          <span className="font-bold" style={{ color: "rgb(var(--text-1))" }}>
            Danışan notu:{" "}
          </span>
          {apt.userNotes}
        </p>
      )}
      {apt.status === "rejected" && apt.rejectionReason && (
        <p className="mt-3 text-xs text-rose-600 dark:text-rose-300 bg-rose-50 dark:bg-rose-500/10 border border-rose-200/60 dark:border-rose-500/20 rounded-lg px-3 py-2">
          Ret sebebi: {apt.rejectionReason}
        </p>
      )}
    </Card>
  );
};

export default PsychologistDashboard;
