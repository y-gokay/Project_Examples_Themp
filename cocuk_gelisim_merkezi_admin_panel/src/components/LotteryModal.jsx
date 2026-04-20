import { useState, useEffect, useMemo } from "react";
import { adminAPI, kresAPI } from "../services/api";
import LotteryResultModal from "./LotteryResultModal";

export default function LotteryModal({ onClose, onSuccess }) {
  const [allKresler, setAllKresler] = useState([]);
  const [ageGroups, setAgeGroups] = useState([]);
  const [selectedAgeGroupId, setSelectedAgeGroupId] = useState("");
  const [loadingKresler, setLoadingKresler] = useState(true);
  const [loadingAgeGroups, setLoadingAgeGroups] = useState(true);
  const [kresQuotas, setKresQuotas] = useState({}); // { kresId: quota }
  const [excelOutput, setExcelOutput] = useState(false);
  const [error, setError] = useState("");
  const [lotteryResult, setLotteryResult] = useState(null);

  const filteredKresler = useMemo(() => {
    if (!selectedAgeGroupId) return [];
    const agId = Number(selectedAgeGroupId);
    return allKresler.filter((k) =>
      (k.ageGroups || []).some((ag) => ag.id === agId),
    );
  }, [allKresler, selectedAgeGroupId]);

  useEffect(() => {
    loadKresler();
    loadAgeGroups();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  useEffect(() => {
    if (filteredKresler.length > 0) {
      const calculatedQuotas = {};
      filteredKresler.forEach((kres) => {
        const remainingQuota = kres.remainingQuota || 0;
        calculatedQuotas[kres.id] = remainingQuota;
      });
      setKresQuotas(calculatedQuotas);
    } else {
      setKresQuotas({});
    }
  }, [filteredKresler]);

  const loadKresler = async () => {
    try {
      setLoadingKresler(true);
      const data = await kresAPI.getAllKresler();
      setAllKresler(data.items || []);
    } catch (err) {
      setError("Çocuk gelişim merkezleri yüklenemedi: " + err.message);
    } finally {
      setLoadingKresler(false);
    }
  };

  const loadAgeGroups = async () => {
    try {
      setLoadingAgeGroups(true);
      const data = await adminAPI.getAgeGroups();
      setAgeGroups(data.items || []);
    } catch (err) {
      setError((prev) =>
        prev
          ? prev
          : "Yaş grupları yüklenemedi: " + err.message,
      );
    } finally {
      setLoadingAgeGroups(false);
    }
  };

  const handleQuotaChange = (kresId, value) => {
    setKresQuotas((prev) => ({
      ...prev,
      [kresId]: parseInt(value) || 0,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!selectedAgeGroupId) {
      setError("Yerleştirme öncesi yaş grubu seçmelisiniz");
      return;
    }

    if (filteredKresler.length === 0) {
      setError(
        "Bu yaş grubunu kabul eden çocuk gelişim merkezi bulunmuyor; önce merkez kayıtlarında yaş grubu tanımlayın",
      );
      return;
    }

    const hasAnyQuota = Object.values(kresQuotas).some((quota) => quota > 0);
    if (!hasAnyQuota) {
      setError("En az bir çocuk gelişim merkezi için kontenjan belirlemelisiniz");
      return;
    }

    try {
      const result = await adminAPI.drawLottery(kresQuotas, {
        selectedAgeGroupId: Number(selectedAgeGroupId),
        excelOutput,
      });
      setLotteryResult(result);

      if (excelOutput && result.resultsByKres) {
        const allPlacedIds = [];
        result.resultsByKres.forEach((kresResult) => {
          allPlacedIds.push(...kresResult.applications.map((app) => app.id));
        });
        if (allPlacedIds.length > 0) {
          await adminAPI.downloadLotteryExcel(allPlacedIds);
        }
      }

      await loadKresler();

      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      setError(err.message || "Bir hata oluştu");
    }
  };

  if (lotteryResult) {
    return (
      <LotteryResultModal
        result={lotteryResult}
        excelRequested={excelOutput}
        onClose={() => {
          setLotteryResult(null);
          onClose();
        }}
      />
    );
  }

  const loading = loadingKresler || loadingAgeGroups;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="lottery-modal-title"
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden transform scale-100 transition-all flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-slate-50 shrink-0">
          <h3
            id="lottery-modal-title"
            className="text-lg font-bold text-gray-800"
          >
            Yerleştirme Başlat
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-white"
            type="button"
            aria-label="Pencereyi kapat"
          >
            &times;
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label
                htmlFor="lottery-age-group"
                className="block text-sm font-bold text-slate-700"
              >
                Yerleştirme yaş grubu
              </label>
              <p className="text-sm text-slate-500">
                Çocukların yaşı, kayıt döneminde kullanılan kurala göre{" "}
                <strong>1 Eylül</strong> tarihi esas alınarak hesaplanır. Sadece
                bu aralıktaki çocuklar ve bu yaş grubunu kabul eden merkezler
                yerleştirmeye dahil edilir.
              </p>
              <select
                id="lottery-age-group"
                value={selectedAgeGroupId}
                onChange={(e) => setSelectedAgeGroupId(e.target.value)}
                disabled={loadingAgeGroups}
                className="w-full px-3 py-2.5 text-sm font-medium border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none bg-white"
              >
                <option value="">Yaş grubu seçin…</option>
                {ageGroups.map((ag) => (
                  <option key={ag.id} value={ag.id}>
                    {ag.name} yaş
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-bold text-slate-700">
                Çocuk Gelişim Merkezi Kontenjanları
              </label>
              <p className="text-sm text-slate-500 bg-blue-50 p-3 rounded-lg border border-blue-100">
                {selectedAgeGroupId
                  ? "Aşağıda yalnızca seçtiğiniz yaş grubunu kabul eden merkezler listelenir. Her merkez için bu turda yerleştirilecek kişi sayısını girin."
                  : "Önce yerleştirme yaş grubunu seçin; ardından ilgili merkezler ve kontenjanlar yüklenecektir."}
              </p>

              {loading ? (
                <div className="py-8 text-center text-slate-500">
                  Veriler yükleniyor...
                </div>
              ) : !selectedAgeGroupId ? (
                <div className="py-8 text-center text-slate-400 italic">
                  Yaş grubu seçin
                </div>
              ) : filteredKresler.length === 0 ? (
                <div className="py-8 text-center text-amber-700 text-sm bg-amber-50 border border-amber-100 rounded-xl px-4">
                  Bu yaş grubunu tanımlı merkez yok. Kreş kayıtlarında &quot;Kabul
                  edilen yaş grupları&quot; alanını güncelleyin.
                </div>
              ) : (
                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                  {filteredKresler.map((kres) => {
                    const selectedCount = kres.selectedCount || 0;
                    const remainingQuota = kres.remainingQuota || 0;
                    const currentQuota =
                      kresQuotas[kres.id] !== undefined
                        ? kresQuotas[kres.id]
                        : remainingQuota;

                    return (
                      <div
                        key={kres.id}
                        className="p-4 bg-slate-50 border border-slate-200 rounded-xl hover:border-blue-200 transition-colors"
                      >
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                          <div>
                            <div className="font-bold text-slate-800">
                              {kres.name}
                            </div>
                            {kres.quota && (
                              <div className="text-xs text-slate-500 mt-1">
                                Toplam Kontenjan: {kres.quota}
                              </div>
                            )}
                          </div>

                          <div className="flex items-center gap-4 w-full sm:w-auto">
                            <div className="flex flex-col gap-1 w-1/2 sm:w-auto">
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                Durum
                              </span>
                              <span className="text-xs font-medium text-slate-600 bg-white px-2 py-1.5 rounded border border-slate-200 text-center">
                                {selectedCount} / {remainingQuota} (Maks)
                              </span>
                            </div>

                            <div className="flex flex-col gap-1 w-1/2 sm:w-auto">
                              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                Yerleştirme Adedi
                              </label>
                              <input
                                type="number"
                                min="0"
                                max={remainingQuota}
                                value={currentQuota}
                                onChange={(e) => {
                                  const val = parseInt(e.target.value) || 0;
                                  const maxVal = Math.max(0, remainingQuota);
                                  handleQuotaChange(
                                    kres.id,
                                    Math.min(val, maxVal),
                                  );
                                }}
                                className="w-full sm:w-24 px-3 py-1.5 text-sm font-bold text-center border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg border border-slate-100">
              <input
                type="checkbox"
                id="excelOutput"
                checked={excelOutput}
                onChange={(e) => setExcelOutput(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
              <label
                htmlFor="excelOutput"
                className="text-sm font-medium text-slate-700 cursor-pointer select-none"
              >
                Yerleştirme sonucunda Excel çıktısı indir
              </label>
            </div>

            {error && (
              <div className="p-4 text-sm text-red-600 bg-red-50 rounded-xl border border-red-100 flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
                <span className="font-bold">Hata:</span> {error}
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                className="btn btn-secondary flex-1"
                onClick={onClose}
              >
                İptal
              </button>
              <button
                type="submit"
                className="btn btn-primary flex-1 shadow-lg shadow-blue-200"
                disabled={loading || !selectedAgeGroupId}
              >
                Yerleştirme Başlat
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
