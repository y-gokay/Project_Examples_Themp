export default function LoadingSpinner({
  message = "Yükleniyor...",
  size = 24,
  className = "",
}) {
  const spinnerSizeClass = size >= 28 ? "h-8 w-8" : "h-6 w-6";
  return (
    <div className={`flex items-center justify-center py-8 ${className}`}>
      <div className={`loading-spinner ${spinnerSizeClass}`}></div>
      {message && <span className="ml-2 text-gray-600">{message}</span>}
    </div>
  );
}
