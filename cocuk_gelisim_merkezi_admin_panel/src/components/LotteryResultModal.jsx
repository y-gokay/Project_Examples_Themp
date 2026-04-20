import { useState, useEffect } from "react";
import {
  X,
  Trophy,
  AlertCircle,
  FileCheck,
  CheckCircle2,
  ChevronDown,
} from "lucide-react";

export default function LotteryResultModal({
  result,
  excelRequested,
  onClose,
}) {
  const totalPlaced = result.totalPlaced || 0;
  const totalUnplaced = result.totalUnplaced || 0;
  const resultsByKres = result.resultsByKres || [];
  const [collapsedSections, setCollapsedSections] = useState(new Set());

  const toggleSection = (kresId) => {
    const newCollapsed = new Set(collapsedSections);
    if (newCollapsed.has(kresId)) {
      newCollapsed.delete(kresId);
    } else {
      newCollapsed.add(kresId);
    }
    setCollapsedSections(newCollapsed);
  };

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

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="lottery-result-title"
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl h-full max-h-[90vh] flex flex-col overflow-hidden transform scale-100 transition-all">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-slate-50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <Trophy className="text-blue-600" size={24} />
            </div>
            <div>
              <h3
                id="lottery-result-title"
                className="text-xl font-bold text-gray-800"
              >
                Yerleştirme Sonuçları
              </h3>
              <p className="text-sm text-slate-500">
                Otomatik kura işlemi tamamlandı
                {result.selectedAgeGroup?.name && (
                  <span className="block mt-1 text-slate-600">
                    Yaş grubu:{" "}
                    <span className="font-semibold text-slate-800">
                      {result.selectedAgeGroup.name}
                    </span>
                  </span>
                )}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-full hover:bg-white"
            type="button"
            aria-label="Pencereyi kapat"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-white p-4 rounded-xl border border-emerald-100 shadow-sm flex items-center gap-4">
              <div className="bg-emerald-50 p-3 rounded-full">
                <CheckCircle2 className="text-emerald-500" size={24} />
              </div>
              <div>
                <div className="text-sm text-slate-500 font-medium">
                  Yerleştirilen
                </div>
                <div className="text-2xl font-bold text-emerald-600">
                  {totalPlaced} kişi
                </div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-red-100 shadow-sm flex items-center gap-4">
              <div className="bg-red-50 p-3 rounded-full">
                <AlertCircle className="text-red-500" size={24} />
              </div>
              <div>
                <div className="text-sm text-slate-500 font-medium">
                  Yerleştirilemeyen
                </div>
                <div className="text-2xl font-bold text-red-600">
                  {totalUnplaced} kişi
                </div>
              </div>
            </div>

            {excelRequested && (
              <div className="bg-white p-4 rounded-xl border border-blue-100 shadow-sm flex items-center gap-4">
                <div className="bg-blue-50 p-3 rounded-full">
                  <FileCheck className="text-blue-500" size={24} />
                </div>
                <div>
                  <div className="text-sm text-slate-500 font-medium">
                    Excel Raporu
                  </div>
                  <div className="text-lg font-bold text-blue-600">
                    İndirildi
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Results per Kres */}
          {resultsByKres.length > 0 ? (
            <div className="space-y-8">
              {resultsByKres.map((kresResult) => {
                const isCollapsed = collapsedSections.has(kresResult.kres.id);
                return (
                  <div
                    key={kresResult.kres.id}
                    className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm transition-all"
                  >
                    <div
                      className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center cursor-pointer hover:bg-slate-100/50 transition-colors select-none"
                      onClick={() => toggleSection(kresResult.kres.id)}
                    >
                      <h4 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                        <span className="w-2 h-6 bg-blue-500 rounded-full"></span>
                        {kresResult.kres.name}
                      </h4>
                      <div className="flex items-center gap-3">
                        <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full">
                          {kresResult.applications.length} Kişi Yerleşti
                        </span>
                        <ChevronDown
                          size={20}
                          className={`text-slate-400 transition-transform duration-300 ${isCollapsed ? "-rotate-90" : "rotate-0"}`}
                        />
                      </div>
                    </div>

                    {!isCollapsed && (
                      <div className="overflow-x-auto animate-in slide-in-from-top-2 duration-300">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="bg-white border-b border-slate-100 text-xs uppercase text-slate-400 font-bold tracking-wider">
                              <th className="px-6 py-3 w-16">Sıra</th>
                              <th className="px-6 py-3">Ad Soyad</th>
                              <th className="px-6 py-3">TC No</th>
                              <th className="px-6 py-3">Telefon</th>
                              <th className="px-6 py-3">Puan</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-50">
                            {kresResult.applications.map((app, index) => (
                              <tr
                                key={app.id}
                                className="hover:bg-slate-50/80 transition-colors"
                              >
                                <td className="px-6 py-3">
                                  <span className="flex items-center justify-center w-6 h-6 bg-slate-100 text-slate-600 rounded-full text-xs font-bold">
                                    {index + 1}
                                  </span>
                                </td>
                                <td className="px-6 py-3 font-semibold text-slate-700">
                                  {app.fullName}
                                </td>
                                <td className="px-6 py-3 text-slate-500 font-mono text-xs">
                                  {app.tcno}
                                </td>
                                <td className="px-6 py-3 text-slate-500 text-sm">
                                  {app.phone || "-"}
                                </td>
                                <td className="px-6 py-3">
                                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-blue-50 text-blue-600 border border-blue-100">
                                    {app.score || 0} Puan
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
              <div className="bg-slate-100 p-6 rounded-full mb-4">
                <Trophy size={48} className="opacity-50" />
              </div>
              <div className="text-xl font-medium text-slate-600">
                Yerleştirilen başvuru bulunmamaktadır
              </div>
              <p className="text-sm mt-2">
                Kriterlere uygun veya kontenjan dahilinde aday bulunamadı.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-100 bg-white flex justify-end shrink-0">
          <button
            type="button"
            className="btn btn-primary min-w-[120px]"
            onClick={onClose}
          >
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
}
