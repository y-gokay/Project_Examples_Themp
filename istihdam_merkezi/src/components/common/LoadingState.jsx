import { Loader2 } from "lucide-react";
import { cn } from "../../utils/helpers";

/**
 * LoadingState Component
 * Standart loading state gösterimi için kullanılır
 * 
 * @param {Object} props
 * @param {string} props.text - Loading mesajı
 * @param {string} props.size - Loading boyutu (sm, md, lg, xl)
 * @param {boolean} props.fullScreen - Tam ekran loading
 * @param {string} props.className - Ek CSS class'ları
 * @param {React.ReactNode} props.children - Custom loading içeriği
 */
const LoadingState = ({
  text = "Yükleniyor...",
  size = "md",
  fullScreen = false,
  className = "",
  children,
}) => {
  const sizes = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12",
    xl: "w-16 h-16",
  };

  const spinner = (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3",
        className
      )}
    >
      <Loader2
        className={cn(
          "animate-spin text-blue-600",
          sizes[size]
        )}
        aria-label="Yükleniyor"
      />
      {text && (
        <p className="text-gray-600 text-sm font-medium">{text}</p>
      )}
      {children}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white/90 backdrop-blur-sm flex items-center justify-center z-50">
        {spinner}
      </div>
    );
  }

  return spinner;
};

/**
 * PageLoading Component
 * Sayfa yüklenirken gösterilen loading state
 */
export const PageLoading = ({ text = "Sayfa yükleniyor..." }) => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <LoadingState text={text} size="lg" />
    </div>
  );
};

/**
 * InlineLoading Component
 * Inline loading state (örneğin tablo içinde)
 */
export const InlineLoading = ({ text = "Yükleniyor..." }) => {
  return (
    <div className="py-8 flex items-center justify-center">
      <LoadingState text={text} size="md" />
    </div>
  );
};

/**
 * ButtonLoading Component
 * Buton içinde gösterilen küçük loading
 */
export const ButtonLoading = ({ size = "sm" }) => {
  return (
    <Loader2
      className={cn(
        "animate-spin text-current",
        size === "sm" ? "w-4 h-4" : "w-5 h-5"
      )}
      aria-label="Yükleniyor"
    />
  );
};

export default LoadingState;

