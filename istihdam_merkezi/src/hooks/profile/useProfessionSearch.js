import { useState, useEffect, useRef, useCallback } from "react";
import { error as logError } from "../../utils/logger";

const EMPTY_IDS = [];

/**
 * Meslek araması için hook.
 * Açılış: loadFirstPage() ile ilk sayfa (search="", page=1)
 * Arama: 300ms debounce ile API çağrısı
 * Sayfalama: loadMore() ile sonraki sayfa
 *
 * @param {Function} searchProfessions - API (term, limit, page) => Promise
 * @param {string} professionSearch - Aranacak metin
 * @param {Object} options
 * @param {string[]} options.excludeIds - Hariç tutulacak ID'ler
 * @param {number} options.debounceMs - Debounce (varsayılan 300)
 * @param {number} options.limit - Sayfa boyutu (varsayılan 20)
 */
export const useProfessionSearch = (
  searchProfessions,
  professionSearch,
  options = {},
) => {
  const { excludeIds = EMPTY_IDS, debounceMs = 300, limit = 20 } = options;
  const [searchResults, setSearchResults] = useState([]);
  const [searchingProfessions, setSearchingProfessions] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const searchTimeoutRef = useRef(null);
  const currentPageRef = useRef(1);
  const currentSearchRef = useRef("");

  const applyExclude = useCallback(
    (data) => {
      if (!excludeIds?.length) return data || [];
      return (data || []).filter((profession) => {
        if (!profession || typeof profession !== "object") return false;
        const id = profession.id?.toString();
        return (
          id &&
          id !== "null" &&
          id !== "undefined" &&
          !excludeIds.includes(id)
        );
      });
    },
    [excludeIds],
  );

  const fetchPage = useCallback(
    async (term, page, append = false) => {
      try {
        const result = await searchProfessions(term, limit, page);
        if (!result.success) {
          setSearchResults((prev) => (append ? prev : []));
          setHasMore(false);
          return;
        }
        const data = applyExclude(result.data || []);
        setSearchResults((prev) => (append ? [...prev, ...data] : data));
        setHasMore(data.length >= limit);
      } catch (err) {
        logError("Profession search error:", err);
        setSearchResults((prev) => (append ? prev : []));
        setHasMore(false);
      }
    },
    [searchProfessions, limit, applyExclude],
  );

  /** Dropdown açıldığında ilk sayfa (search="", page=1) */
  const loadFirstPage = useCallback(() => {
    setShowDropdown(true);
    setSearchingProfessions(true);
    setHasMore(true);
    currentPageRef.current = 1;
    currentSearchRef.current = "";
    fetchPage("", 1, false).finally(() => setSearchingProfessions(false));
  }, [fetchPage]);

  /** Sonraki sayfa (scroll sonu veya "Daha fazla yükle") */
  const loadMore = useCallback(() => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    const nextPage = currentPageRef.current + 1;
    const term = currentSearchRef.current;
    fetchPage(term, nextPage, true).finally(() => {
      setLoadingMore(false);
      currentPageRef.current = nextPage;
    });
  }, [fetchPage, hasMore, loadingMore]);

  /** Yazarken debounce ile arama. Boş string: sadece kullanıcı silerse temizle (loadFirstPage ile çakışmasın) */
  const prevSearchRef = useRef(professionSearch);
  useEffect(() => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

    const term = professionSearch?.trim() ?? "";
    if (term === "") {
      // Kullanıcı arama metnini sildiyse temizle; açılışta loadFirstPage ile çakışmasın
      if (prevSearchRef.current?.trim() !== "") {
        setSearchResults([]);
        setShowDropdown(false);
        setSearchingProfessions(false);
      }
      prevSearchRef.current = professionSearch;
      return;
    }

    prevSearchRef.current = professionSearch;
    setSearchingProfessions(true);
    setShowDropdown(true);

    searchTimeoutRef.current = setTimeout(async () => {
      currentSearchRef.current = term;
      currentPageRef.current = 1;
      await fetchPage(term, 1, false);
      setSearchingProfessions(false);
    }, debounceMs);

    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, [professionSearch, debounceMs, fetchPage]);

  const clearResults = useCallback(() => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    setSearchResults([]);
    setSearchingProfessions(false);
    setLoadingMore(false);
    setShowDropdown(false);
    setHasMore(true);
  }, []);

  return {
    searchResults,
    searchingProfessions,
    loadingMore,
    hasMore,
    showDropdown,
    setShowDropdown,
    clearResults,
    loadFirstPage,
    loadMore,
  };
};

export default useProfessionSearch;
