import { useState, useEffect, useRef } from "react";
import { adminAPI } from "../services/api";
import { isSuperAdmin } from "../services/auth";
import ApplicationDetailModal from "./ApplicationDetailModal";
import LotteryModal from "./LotteryModal";
import {
  Search,
  Filter,
  ChevronDown,
  CheckSquare,
  FileSpreadsheet,
  Trash2,
  Archive,
  RotateCcw,
  RefreshCw,
  Eye,
  ArrowUpDown,
  X,
  Check,
  XCircle,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  Send,
} from "lucide-react";

const PAGE_SIZE_OPTIONS = [25, 50, 100, 200];

export default function ApplicationsTab() {
  const isSuper = isSuperAdmin();
  const [allApplications, setAllApplications] = useState([]);
  const [filteredApplications, setFilteredApplications] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [detailModalApp, setDetailModalApp] = useState(null);
  const [noteModalApp, setNoteModalApp] = useState(null);
  const [editingNoteValue, setEditingNoteValue] = useState("");
  const [savingNote, setSavingNote] = useState(false);
  const [showLotteryModal, setShowLotteryModal] = useState(false);
  const [applicationsOpen, setApplicationsOpen] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [recalculatingScores, setRecalculatingScores] = useState(false);

  // Pagination
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(100);
  const [total, setTotal] = useState(0);
  const [loadingApplications, setLoadingApplications] = useState(false);

  // Inline Edit State
  const [editingStatusId, setEditingStatusId] = useState(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Filters & Sort State
  const [selectedStatuses, setSelectedStatuses] = useState(new Set());
  const [selectedKresIds, setSelectedKresIds] = useState(new Set());
  const [sortConfig, setSortConfig] = useState({
    key: "score",
    direction: "desc",
  });

  // Dropdown visibility
  const [activeDropdown, setActiveDropdown] = useState(null);
  const dropdownRef = useRef(null);

  const totalPages = Math.max(1, Math.ceil(total / limit));
  const from = total === 0 ? 0 : (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  const goToPage = (p) => {
    const next = Math.max(1, Math.min(p, totalPages));
    setPage(next);
  };

  const handleLimitChange = (newLimit) => {
    setLimit(Number(newLimit));
    setPage(1);
  };

  useEffect(() => {
    loadApplicationsStatus();
  }, []);

  useEffect(() => {
    loadApplications(page, limit);
  }, [page, limit]);

  useEffect(() => {
    applyFiltersAndSort();
  }, [sortConfig, allApplications, selectedStatuses, selectedKresIds]);

  // Arama veya durum filtresi değiştiğinde sayfayı başa al
  const statusFilterKey = Array.from(selectedStatuses).sort().join(",");
  useEffect(() => {
    setPage(1);
  }, [searchTerm, statusFilterKey]);

  // Click outside to close dropdowns and status edit
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setActiveDropdown(null);
      }
      // Close inline edit if clicking outside
      if (editingStatusId && !event.target.closest(".status-cell")) {
        setEditingStatusId(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [editingStatusId]);

  useEffect(() => {
    if (!noteModalApp) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        setNoteModalApp(null);
      }

      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        if (!savingNote) {
          handleSaveAdminNote();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [noteModalApp, savingNote]);

  const loadApplications = async (pageNum = page, limitNum = limit) => {
    try {
      setLoadingApplications(true);

      // Backend arama ve (tekli) status filtresi
      let backendStatus = null;
      if (selectedStatuses.size === 1) {
        const only = Array.from(selectedStatuses)[0];
        if (only !== "not_selected") {
          backendStatus = only;
        }
      }

      const extraParams = {};
      if (searchTerm) {
        // İsim/TC/Telefon genel araması için q parametresi
        extraParams.q = searchTerm;
      }

      const data = await adminAPI.getApplications(
        false,
        backendStatus,
        pageNum,
        limitNum,
        extraParams,
      );
      setAllApplications(data.items || []);
      const pagination = data.pagination || {};
      setTotal(
        pagination.total ?? data.pagination?.total ?? data.items?.length ?? 0,
      );
    } catch (error) {
      alert("Başvurular yüklenemedi: " + error.message);
    } finally {
      setLoadingApplications(false);
    }
  };

  const loadApplicationsStatus = async () => {
    try {
      const data = await adminAPI.getApplicationsOpenStatus();
      setApplicationsOpen(data.open);
    } catch (error) {
      console.error("Başvuru durumu yüklenemedi:", error);
      setApplicationsOpen(true);
    }
  };

  const handleToggleApplications = async () => {
    const newStatus = !applicationsOpen;
    try {
      const response = await adminAPI.setApplicationsOpen(newStatus);
      setApplicationsOpen(response.open);
    } catch (error) {
      alert("Hata: " + error.message);
    }
  };

  const handleRecalculateScores = async () => {
    if (
      !window.confirm(
        "Tüm başvuruların puanları sunucudaki güncel puanlama parametreleriyle (SCORING_CONFIG_JSON) yeniden hesaplanacak. Devam edilsin mi?",
      )
    ) {
      return;
    }
    try {
      setRecalculatingScores(true);
      const data = await adminAPI.recalculateApplicationScores();
      const changed = data.changed ?? 0;
      const total = data.total ?? 0;
      alert(
        `Puanlar güncellendi. Toplam ${total} başvuru işlendi; ${changed} kayıtta puan değişti.`,
      );
      await loadApplications(page, limit);
    } catch (error) {
      alert("Puanlar yeniden hesaplanamadı: " + error.message);
    } finally {
      setRecalculatingScores(false);
    }
  };

  const toggleDropdown = (name) => {
    setActiveDropdown(activeDropdown === name ? null : name);
  };

  const handleSort = (key) => {
    setSortConfig((current) => ({
      key,
      direction:
        current.key === key && current.direction === "desc" ? "asc" : "desc",
    }));
  };

  const applyFiltersAndSort = () => {
    let filtered = [...allApplications];

    // Status Filter (çoklu durum filtresi ve 'not_selected' desteği)
    if (selectedStatuses.size > 0) {
      filtered = filtered.filter((app) => {
        if (
          selectedStatuses.has("not_selected") &&
          (app.status === null || app.status === undefined)
        ) {
          return true;
        }
        return selectedStatuses.has(app.status);
      });
    }

    // Kres Filter
    if (selectedKresIds.size > 0) {
      filtered = filtered.filter((app) => {
        if (!app.selectedKres) return false;
        return selectedKresIds.has(app.selectedKres.id);
      });
    }

    // Sorting
    filtered.sort((a, b) => {
      const aValue = getSortValue(a, sortConfig.key);
      const bValue = getSortValue(b, sortConfig.key);

      if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });

    setFilteredApplications(filtered);
  };

  const getSortValue = (item, key) => {
    switch (key) {
      case "score":
        return item.score || 0;
      case "createdAt":
        return new Date(item.createdAt).getTime();
      case "selectedAt":
        return item.selectedAt ? new Date(item.selectedAt).getTime() : 0;
      case "fullName":
        return item.fullName.toLowerCase();
      case "status":
        return item.status || "";
      case "kres":
        return item.selectedKres?.id || 0;
      default:
        return item[key];
    }
  };

  // Toggle Helpers
  const toggleStatus = (status) => {
    const newSelected = new Set(selectedStatuses);
    if (newSelected.has(status)) newSelected.delete(status);
    else newSelected.add(status);
    setSelectedStatuses(newSelected);
  };

  const toggleKres = (kresId) => {
    const newSelected = new Set(selectedKresIds);
    if (newSelected.has(kresId)) newSelected.delete(kresId);
    else newSelected.add(kresId);
    setSelectedKresIds(newSelected);
  };

  const getAllKresler = () => {
    const kresSet = new Map();
    allApplications.forEach((app) => {
      if (app.selectedKres && app.selectedKres.id) {
        kresSet.set(app.selectedKres.id, app.selectedKres.name);
      }
    });
    return Array.from(kresSet.entries()).map(([id, name]) => ({ id, name }));
  };

  // Inline Status Update
  const handleStatusUpdate = async (appId, newStatus) => {
    if (!appId || !newStatus) return;
    setIsUpdatingStatus(true);
    try {
      await adminAPI.updateApplicationStatus(appId, newStatus);
      // Optimistic update or reload
      await loadApplications();
      setEditingStatusId(null);
    } catch (error) {
      alert("Durum güncellenemedi: " + error.message);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Bulk Actions
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(new Set(filteredApplications.map((app) => app.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelect = (id, checked) => {
    const newSelected = new Set(selectedIds);
    if (checked) newSelected.add(id);
    else newSelected.delete(id);
    setSelectedIds(newSelected);
  };

  const handleArchiveSelected = async () => {
    if (selectedIds.size === 0) return;
    if (
      !confirm(
        `${selectedIds.size} başvuruyu arşivlemek istediğinize emin misiniz?`,
      )
    )
      return;

    try {
      await adminAPI.archiveApplications(Array.from(selectedIds));
      alert("Başvurular arşivlendi");
      setSelectedIds(new Set());
      await loadApplications();
    } catch (error) {
      alert("Hata: " + error.message);
    }
  };

  const handleExportExcel = async () => {
    if (selectedIds.size === 0) return;
    try {
      await adminAPI.exportApplicationsExcel(Array.from(selectedIds));
    } catch (error) {
      alert("Hata: " + error.message);
    }
  };

  const handleSendMessageSelected = async () => {
    if (selectedIds.size === 0) return;
    if (
      !confirm(
        `${selectedIds.size} seçili başvuruya mesaj göndermek istediğinize emin misiniz?`,
      )
    )
      return;
    setSendingMessage(true);
    try {
      const ids = Array.from(selectedIds);
      let successCount = 0;
      const errors = [];
      for (const id of ids) {
        try {
          await adminAPI.sendApplicationMessage(id);
          successCount++;
        } catch (err) {
          errors.push(err.message);
        }
      }
      if (successCount > 0) {
        alert(
          `${successCount} başvuruya mesaj gönderildi${errors.length > 0 ? `. ${errors.length} başvuruda hata: ${errors[0]}` : ""}`,
        );
        setSelectedIds(new Set());
        await loadApplications();
      } else {
        alert("Mesaj gönderilemedi: " + (errors[0] || "Bilinmeyen hata"));
      }
    } catch (error) {
      alert("Hata: " + error.message);
    } finally {
      setSendingMessage(false);
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedIds.size === 0) return;
    if (
      !confirm(
        `${selectedIds.size} başvuruyu kalıcı olarak silmek istediğinize emin misiniz?`,
      )
    )
      return;

    try {
      await adminAPI.deleteApplications(Array.from(selectedIds));
      alert("Başvurular silindi");
      setSelectedIds(new Set());
      await loadApplications();
    } catch (error) {
      alert("Hata: " + error.message);
    }
  };

  const handleResetLotteryStatus = async () => {
    if (selectedIds.size === 0) return;
    if (
      !confirm(
        `${selectedIds.size} başvurunun yerleştirme durumunu sıfırlamak istediğinize emin misiniz?`,
      )
    )
      return;

    try {
      await Promise.all(
        Array.from(selectedIds).map((id) =>
          adminAPI.updateApplicationStatus(id, null),
        ),
      );
      alert("Durumlar sıfırlandı");
      setSelectedIds(new Set());
      await loadApplications();
    } catch (error) {
      alert("Hata: " + error.message);
    }
  };

  const handleDeleteApplication = async (id, fullName) => {
    if (
      !confirm(`"${fullName}" adlı başvuruyu silmek istediğinize emin misiniz?`)
    )
      return;
    try {
      await adminAPI.deleteApplication(id);
      await loadApplications();
    } catch (error) {
      alert("Hata: " + error.message);
    }
  };

  const openNoteModal = (app) => {
    setNoteModalApp(app);
    setEditingNoteValue(app.adminNotes ?? "");
  };

  const handleSaveAdminNote = async () => {
    if (!noteModalApp) return;
    setSavingNote(true);
    try {
      await adminAPI.updateApplicationStatus(
        noteModalApp.id,
        noteModalApp.status,
        editingNoteValue || undefined,
      );
      await loadApplications();
      setNoteModalApp(null);
    } catch (error) {
      alert("Admin notu kaydedilemedi: " + error.message);
    } finally {
      setSavingNote(false);
    }
  };

  const allSelected =
    filteredApplications.length > 0 &&
    filteredApplications.every((app) => selectedIds.has(app.id));
  const someSelected = filteredApplications.some((app) =>
    selectedIds.has(app.id),
  );

  const statusOptions = [
    { id: "bekliyor", label: "Bekliyor", color: "orange" },
    { id: "kayıt_yaptırdı", label: "Kayıt Yaptırdı", color: "green" },
    { id: "kayıt_yaptırmadı", label: "Kayıt Yaptırmadı", color: "red" },
    { id: "ulaşılamadı", label: "Ulaşılamadı", color: "slate" },
  ];

  const getStatusStyle = (status) => {
    const styles = {
      bekliyor:
        "bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-200",
      kayıt_yaptırdı:
        "bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-200",
      kayıt_yaptırmadı:
        "bg-rose-100 text-rose-800 border-rose-200 hover:bg-rose-200",
      ulaşılamadı:
        "bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200",
      default: "bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100",
    };
    return styles[status] || styles.default;
  };

  const getStatusLabel = (status) => {
    const labels = {
      bekliyor: "Bekliyor",
      kayıt_yaptırdı: "Kayıt Yaptırdı",
      kayıt_yaptırmadı: "Kayıt Yaptırmadı",
      ulaşılamadı: "Ulaşılamadı",
    };
    return labels[status] || status;
  };

  // Render Status Cell with Inline Edit
  const renderStatusCell = (app) => {
    // If not selected by lottery, cannot change status usually (or null status)
    if (!app.status && !app.selectedKres) {
      return <span className="text-slate-400 text-sm font-medium">-</span>;
    }

    const isEditing = editingStatusId === app.id;

    return (
      <div
        className={`status-cell relative w-[160px] group/status ${isEditing ? "z-50" : "z-0"}`}
      >
        <div
          onClick={(e) => {
            e.stopPropagation();
            setEditingStatusId(isEditing ? null : app.id);
          }}
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border cursor-pointer transition-all w-full justify-between ${getStatusStyle(app.status)}`}
          title="Durumu değiştirmek için tıklayın"
        >
          <span className="truncate">{getStatusLabel(app.status)}</span>
          <ChevronDown
            size={14}
            className={`transition-transform duration-200 shrink-0 ${isEditing ? "rotate-180 opacity-100" : "opacity-0 group-hover/status:opacity-100"}`}
          />
        </div>

        {isEditing && (
          <div className="absolute top-full left-0 mt-1 w-full bg-white rounded-xl shadow-xl border border-slate-100 z-50 py-1 animate-in fade-in zoom-in-95 duration-100 overflow-hidden">
            {statusOptions.map((opt) => (
              <button
                key={opt.id}
                onClick={(e) => {
                  e.stopPropagation();
                  handleStatusUpdate(app.id, opt.id);
                }}
                disabled={isUpdatingStatus}
                className={`w-full text-left px-3 py-2 text-xs font-medium hover:bg-slate-50 transition-colors flex items-center gap-2
                                    ${app.status === opt.id ? "bg-blue-50 text-blue-600" : "text-slate-600"}
                                `}
              >
                <div
                  className={`w-2 h-2 rounded-full ${
                    opt.color === "orange"
                      ? "bg-amber-400"
                      : opt.color === "green"
                        ? "bg-emerald-400"
                        : opt.color === "red"
                          ? "bg-rose-400"
                          : "bg-slate-400"
                  }`}
                ></div>
                {opt.label}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  // Table Header Component
  const TableHeader = ({ label, sortKey, className }) => (
    <th
      className={`px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-50 transition-colors group ${className}`}
      onClick={() => handleSort(sortKey)}
    >
      <div className="flex items-center gap-2">
        {label}
        <ArrowUpDown
          size={12}
          className={`transition-opacity ${sortConfig.key === sortKey ? "opacity-100 text-blue-500" : "opacity-0 group-hover:opacity-50"}`}
        />
      </div>
    </th>
  );

  return (
    <>
      <div className="space-y-6">
        {/* Quick Action Banner */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-6 shadow-xl flex flex-col sm:flex-row justify-between items-center gap-6 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none"></div>

          <div className="relative z-10">
            <h2 className="text-xl font-bold flex items-center gap-3">
              {applicationsOpen ? (
                <>
                  <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse shadow-[0_0_10px_rgba(74,222,128,0.5)]"></div>{" "}
                  Başvurular Şu Anda Açık
                </>
              ) : (
                <>
                  <div className="w-3 h-3 bg-red-400 rounded-full"></div>{" "}
                  Başvurular Şu Anda Kapalı
                </>
              )}
            </h2>
            <p className="text-slate-400 text-sm mt-1 max-w-xl">
              Başvuru dönemi ayarlarını buradan yönetebilirsiniz. Kapatıldığında
              yeni başvuru alınmayacaktır.
            </p>
          </div>

          <button
            onClick={handleToggleApplications}
            className={`relative z-10 px-6 py-3 rounded-xl font-semibold transition-all shadow-lg transform active:scale-95 ${
              applicationsOpen
                ? "bg-white text-red-600 hover:bg-red-50"
                : "bg-green-500 text-white hover:bg-green-600 shadow-green-900/20"
            }`}
          >
            {applicationsOpen ? "Başvuruları Kapat" : "Başvuruları Başlat"}
          </button>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm">
          {/* Search & Filters */}
          <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto flex-1 p-2">
            <div className="relative flex-1 sm:max-w-xs group">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors"
                size={18}
              />
              <input
                type="text"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all placeholder:text-slate-400"
                placeholder="İsim ile arayın..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    setPage(1);
                    loadApplications(1, limit);
                  }
                }}
              />
            </div>

            {/* Filter Dropdowns */}
            <div className="flex gap-2" ref={dropdownRef}>
              {/* Kres Filter */}
              <div className="relative">
                <button
                  onClick={() => toggleDropdown("kres")}
                  className={`h-full px-4 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center gap-2 border
                                    ${
                                      selectedKresIds.size > 0
                                        ? "bg-blue-50 text-blue-600 border-blue-200"
                                        : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                                    }`}
                >
                  <Filter size={16} />
                  Çocuk Gelişim Merkezi {selectedKresIds.size > 0 && `(${selectedKresIds.size})`}
                  <ChevronDown
                    size={14}
                    className={`transition-transform duration-200 ${activeDropdown === "kres" ? "rotate-180" : ""}`}
                  />
                </button>

                {activeDropdown === "kres" && (
                  <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-100 z-50 py-2 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="px-3 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Çocuk Gelişim Merkezi Seçimi
                    </div>
                    <div className="max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200">
                      {getAllKresler().length === 0 ? (
                        <div className="px-4 py-3 text-sm text-slate-400 text-center italic">
                          Çocuk gelişim merkezi bulunamadı
                        </div>
                      ) : (
                        getAllKresler().map((kres) => (
                          <label
                            key={kres.id}
                            className="flex items-center px-4 py-2.5 hover:bg-slate-50 cursor-pointer transition-colors"
                          >
                            <input
                              type="checkbox"
                              checked={selectedKresIds.has(kres.id)}
                              onChange={() => toggleKres(kres.id)}
                              className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 mr-3"
                            />
                            <span className="text-sm text-slate-700 font-medium">
                              {kres.name}
                            </span>
                          </label>
                        ))
                      )}
                    </div>
                    {selectedKresIds.size > 0 && (
                      <div className="border-t border-slate-100 mt-1 pt-1">
                        <button
                          onClick={() => setSelectedKresIds(new Set())}
                          className="w-full py-2 text-xs text-red-500 hover:bg-red-50 font-medium transition-colors"
                        >
                          Temizle
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Status Filter */}
              <div className="relative">
                <button
                  onClick={() => toggleDropdown("status")}
                  className={`h-full px-4 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center gap-2 border
                                    ${
                                      selectedStatuses.size > 0
                                        ? "bg-blue-50 text-blue-600 border-blue-200"
                                        : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                                    }`}
                >
                  <CheckSquare size={16} />
                  Durum{" "}
                  {selectedStatuses.size > 0 && `(${selectedStatuses.size})`}
                  <ChevronDown
                    size={14}
                    className={`transition-transform duration-200 ${activeDropdown === "status" ? "rotate-180" : ""}`}
                  />
                </button>
                {activeDropdown === "status" && (
                  <div className="absolute top-full left-0 mt-2 w-60 bg-white rounded-xl shadow-xl border border-slate-100 z-50 py-2 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="px-3 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Durum Seçimi
                    </div>
                    {statusOptions.map((option) => (
                      <label
                        key={option.id}
                        className="flex items-center px-4 py-2.5 hover:bg-slate-50 cursor-pointer transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={selectedStatuses.has(option.id)}
                          onChange={() => toggleStatus(option.id)}
                          className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 mr-3"
                        />
                        <span className="text-sm text-slate-700 font-medium">
                          {option.label}
                        </span>
                      </label>
                    ))}
                    {selectedStatuses.size > 0 && (
                      <div className="border-t border-slate-100 mt-1 pt-1">
                        <button
                          onClick={() => setSelectedStatuses(new Set())}
                          className="w-full py-2 text-xs text-red-500 hover:bg-red-50 font-medium transition-colors"
                        >
                          Temizle
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Bulk Actions & Primary Action */}
          <div className="flex items-center gap-2 p-2 w-full lg:w-auto justify-end border-t lg:border-t-0 border-slate-100 pt-3 lg:pt-2">
            {selectedIds.size > 0 ? (
              <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-4 duration-300">
                <span className="text-xs font-bold text-slate-500 mr-2 bg-slate-100 px-2 py-1 rounded-md">
                  {selectedIds.size} seçildi
                </span>

                <button
                  onClick={handleArchiveSelected}
                  className="btn bg-white hover:bg-orange-50 text-orange-600 border border-slate-200 hover:border-orange-200 gap-2 !px-3"
                  title="Arşivle"
                >
                  <Archive size={18} />{" "}
                  <span className="hidden sm:inline">Arşivle</span>
                </button>
                <button
                  onClick={handleSendMessageSelected}
                  disabled={sendingMessage}
                  className="btn bg-white hover:bg-sky-50 text-sky-600 border border-slate-200 hover:border-sky-200 gap-2 !px-3"
                  title="Mesaj Gönder"
                >
                  <Send size={18} />{" "}
                  <span className="hidden sm:inline">
                    {sendingMessage ? "Gönderiliyor..." : "Mesaj Gönder"}
                  </span>
                </button>
                <button
                  onClick={handleExportExcel}
                  className="btn bg-white hover:bg-green-50 text-green-600 border border-slate-200 hover:border-green-200 gap-2 !px-3"
                  title="Excel"
                >
                  <FileSpreadsheet size={18} />{" "}
                  <span className="hidden sm:inline">Excel</span>
                </button>
                {isSuper && (
                  <>
                    <button
                      onClick={handleResetLotteryStatus}
                      className="btn bg-white hover:bg-yellow-50 text-yellow-600 border border-slate-200 hover:border-yellow-200 gap-2 !px-3"
                      title="Sıfırla"
                    >
                      <RotateCcw size={18} />{" "}
                      <span className="hidden sm:inline">Sıfırla</span>
                    </button>
                    <button
                      onClick={handleDeleteSelected}
                      className="btn bg-white hover:bg-red-50 text-red-600 border border-slate-200 hover:border-red-200 gap-2 !px-3"
                      title="Sil"
                    >
                      <Trash2 size={18} />{" "}
                      <span className="hidden sm:inline">Sil</span>
                    </button>
                  </>
                )}
                <button
                  onClick={() => setSelectedIds(new Set())}
                  className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
            ) : (
              <div className="flex flex-wrap items-center gap-2 justify-end">
                {isSuper && (
                  <button
                    type="button"
                    onClick={handleRecalculateScores}
                    disabled={recalculatingScores}
                    className="btn bg-white hover:bg-violet-50 text-violet-700 border border-violet-200 hover:border-violet-300 gap-2 disabled:opacity-60"
                    title="Güncel parametrelerle tüm puanları yeniden hesapla"
                  >
                    <RefreshCw
                      size={18}
                      className={recalculatingScores ? "animate-spin" : ""}
                    />
                    <span className="hidden sm:inline">
                      {recalculatingScores
                        ? "Hesaplanıyor..."
                        : "Puanları tekrar hesapla"}
                    </span>
                  </button>
                )}
                <button
                  onClick={() => setShowLotteryModal(true)}
                  className="btn btn-primary gap-2 shadow-lg shadow-blue-200 hover:shadow-blue-300 hover:-translate-y-0.5 transition-all"
                >
                  Yerleştirme Başlat
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto min-h-[400px] relative">
            {loadingApplications && (
              <div className="absolute inset-0 bg-white/60 z-10 flex items-center justify-center rounded-2xl">
                <div className="animate-spin rounded-full h-10 w-10 border-2 border-blue-500 border-t-transparent" />
              </div>
            )}
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50/50 border-b border-slate-200">
                <tr>
                  <th scope="col" className="px-6 py-4 w-10">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      ref={(input) => {
                        if (input)
                          input.indeterminate = someSelected && !allSelected;
                      }}
                      onChange={handleSelectAll}
                      className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                  </th>
                  <TableHeader label="Ad Soyad" sortKey="fullName" />
                  <th
                    scope="col"
                    className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider"
                  >
                    Telefon
                  </th>
                  <TableHeader label="Puan" sortKey="score" />
                  <TableHeader label="Başvuru Tarihi" sortKey="createdAt" />
                  <TableHeader label="Durum" sortKey="status" />
                  <TableHeader label="Çocuk Gelişim Merkezi" sortKey="kres" />
                  <th
                    scope="col"
                    className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider"
                  >
                    Yerleşim yaş grubu
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center"
                  >
                    İşlemler
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredApplications.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center justify-center text-slate-400">
                        <div className="bg-slate-50 p-4 rounded-full mb-3">
                          <Search size={32} />
                        </div>
                        <p className="font-medium text-slate-600">
                          Kayıt bulunamadı
                        </p>
                        <p className="text-sm">
                          Arama kriterlerinizi değiştirerek tekrar deneyin
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredApplications.map((app) => (
                    <tr
                      key={app.id}
                      className="group hover:bg-slate-50/80 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedIds.has(app.id)}
                          onChange={(e) =>
                            handleSelect(app.id, e.target.checked)
                          }
                          className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-900">
                          {app.fullName}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-500 text-sm font-mono">
                        {app.phone || "-"}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center justify-center min-w-[32px] h-6 px-2 rounded-lg bg-blue-50 text-blue-700 font-bold text-xs border border-blue-100">
                          {app.score || 0}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-500 text-sm">
                        {new Date(app.createdAt).toLocaleDateString("tr-TR", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td className="px-6 py-4">{renderStatusCell(app)}</td>
                      <td className="px-6 py-4">
                        {app.selectedKres?.name ? (
                          <div
                            className="flex items-center gap-1.5 max-w-[180px]"
                            title={app.selectedKres.address}
                          >
                            <div className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0"></div>
                            <span className="text-sm text-slate-700 font-medium truncate">
                              {app.selectedKres.name}
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-sm">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 max-w-[140px]">
                        {app.selectedAgeGroup?.name ? (
                          <span
                            className="text-sm text-slate-700 font-medium truncate block"
                            title={app.selectedAgeGroup.name}
                          >
                            {app.selectedAgeGroup.name}
                          </span>
                        ) : (
                          <span className="text-slate-400 text-sm">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => setDetailModalApp(app)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Detayları Görüntüle"
                          >
                            <Eye size={18} />
                          </button>
                          <button
                            onClick={() => openNoteModal(app)}
                            className={`p-2 rounded-lg transition-colors ${app.adminNotes ? "text-amber-600 hover:bg-amber-100" : "text-slate-400 hover:bg-slate-100 hover:text-slate-600"}`}
                            title={
                              app.adminNotes
                                ? `Admin notu: ${app.adminNotes.slice(0, 50)}${app.adminNotes.length > 50 ? "..." : ""}`
                                : "Admin notu ekle/düzenle"
                            }
                          >
                            <MessageSquare
                              size={18}
                              fill={app.adminNotes ? "currentColor" : "none"}
                              strokeWidth={app.adminNotes ? 1.5 : 2}
                            />
                          </button>
                          {isSuper && (
                            <button
                              onClick={() =>
                                handleDeleteApplication(app.id, app.fullName)
                              }
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Kalıcı Olarak Sil"
                            >
                              <Trash2 size={18} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t border-slate-100 bg-slate-50/50">
            <div className="flex items-center gap-4">
              <span className="text-sm text-slate-600">
                <span className="font-semibold text-slate-800">{from}</span>
                {" - "}
                <span className="font-semibold text-slate-800">{to}</span>
                {" / Toplam "}
                <span className="font-semibold text-slate-800">{total}</span>
                {" başvuru"}
              </span>
              <label className="flex items-center gap-2 text-sm text-slate-600">
                <span>Sayfa başına:</span>
                <select
                  value={limit}
                  onChange={(e) => handleLimitChange(e.target.value)}
                  className="px-2 py-1.5 rounded-lg border border-slate-200 bg-white text-sm font-medium text-slate-700 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                >
                  {PAGE_SIZE_OPTIONS.map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => goToPage(page - 1)}
                disabled={page <= 1}
                className="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="Önceki sayfa"
              >
                <ChevronLeft size={20} />
              </button>
              <span className="px-4 py-2 text-sm font-medium text-slate-700 min-w-[100px] text-center">
                Sayfa {page} / {totalPages}
              </span>
              <button
                type="button"
                onClick={() => goToPage(page + 1)}
                disabled={page >= totalPages}
                className="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="Sonraki sayfa"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {detailModalApp && (
        <ApplicationDetailModal
          application={detailModalApp}
          onClose={() => setDetailModalApp(null)}
          onStatusUpdate={loadApplications}
        />
      )}

      {showLotteryModal && (
        <LotteryModal
          onClose={() => setShowLotteryModal(false)}
          onSuccess={loadApplications}
        />
      )}

      {/* Admin notu modal */}
      {noteModalApp && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
          role="dialog"
          aria-modal="true"
          aria-labelledby="applications-admin-note-title"
        >
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="flex justify-between items-center gap-3 p-4 border-b border-slate-100 bg-slate-50">
              <div className="flex items-center gap-2 min-w-0">
                <MessageSquare size={20} className="text-amber-500 shrink-0" />
                <div className="min-w-0">
                  <h3
                    id="applications-admin-note-title"
                    className="text-lg font-bold text-slate-800"
                  >
                    Admin notu
                  </h3>
                  <p
                    className="text-sm text-slate-500 truncate"
                    title={noteModalApp.fullName}
                  >
                    {noteModalApp.fullName}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setNoteModalApp(null)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors shrink-0"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-4">
              <textarea
                value={editingNoteValue}
                onChange={(e) => setEditingNoteValue(e.target.value)}
                placeholder="Bu başvuru hakkında not ekleyin (isteğe bağlı)"
                rows={4}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none resize-y"
                autoFocus
              />
            </div>
            <div className="flex justify-end gap-2 p-4 border-t border-slate-100 bg-slate-50/50">
              <button
                type="button"
                onClick={() => setNoteModalApp(null)}
                className="btn btn-secondary"
              >
                İptal
              </button>
              <button
                type="button"
                onClick={handleSaveAdminNote}
                disabled={savingNote}
                className="btn btn-primary"
              >
                {savingNote ? "Kaydediliyor..." : "Kaydet"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
