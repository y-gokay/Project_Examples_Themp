import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "../../utils/helpers";

/**
 * Pagination Component
 * @param {Object} props
 * @param {number} props.currentPage - Current page number (1-based)
 * @param {number} props.totalPages - Total number of pages
 * @param {Function} props.onPageChange - Page change handler
 * @param {boolean} props.showPageNumbers - Show page number buttons
 * @param {number} props.maxVisible - Maximum visible page buttons
 * @param {string} props.className - Additional classes
 */
const Pagination = ({
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  showPageNumbers = true,
  maxVisible = 5,
  className = "",
}) => {
  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages = [];
    let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);

    // Adjust start if we're near the end
    if (endPage - startPage < maxVisible - 1) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }

    // Add first page and ellipsis if needed
    if (startPage > 1) {
      pages.push(1);
      if (startPage > 2) {
        pages.push("...");
      }
    }

    // Add page numbers
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    // Add last page and ellipsis if needed
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push("...");
      }
      pages.push(totalPages);
    }

    return pages;
  };

  const handlePageClick = (page) => {
    if (page === currentPage || page === "...") return;
    onPageChange(page);
  };

  const buttonClass = (isActive, isDisabled) =>
    cn(
      "px-3 py-2 border rounded-lg text-sm font-medium transition-colors",
      "focus:outline-none focus:ring-2 focus:ring-blue-500",
      isActive && "bg-blue-600 text-white border-blue-600",
      !isActive &&
        !isDisabled &&
        "bg-white text-gray-700 border-gray-300 hover:bg-gray-50",
      isDisabled &&
        "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
    );

  return (
    <nav
      className={cn("flex items-center justify-center gap-2", className)}
      aria-label="Sayfa navigasyonu"
    >
      {/* Previous Button */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={buttonClass(false, currentPage === 1)}
        aria-label="Önceki sayfa"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      {/* Page Numbers */}
      {showPageNumbers &&
        getPageNumbers().map((page, index) => {
          if (page === "...") {
            return (
              <span key={`ellipsis-${index}`} className="px-2 text-gray-500">
                ...
              </span>
            );
          }

          return (
            <button
              key={page}
              onClick={() => handlePageClick(page)}
              className={buttonClass(page === currentPage, false)}
              aria-label={`Sayfa ${page}`}
              aria-current={page === currentPage ? "page" : undefined}
            >
              {page}
            </button>
          );
        })}

      {/* Next Button */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={buttonClass(false, currentPage === totalPages)}
        aria-label="Sonraki sayfa"
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </nav>
  );
};

export default Pagination;
