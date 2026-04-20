import React from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { Button } from "../ui";
import { ROUTES } from "../../constants";
import { error as logError } from "../../utils/logger";

/**
 * Error Boundary Component
 * React hatalarını yakalar ve kullanıcıya anlamlı bir hata mesajı gösterir
 * 
 * @class ErrorBoundary
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error) {
    // Bir sonraki render'da fallback UI'ı göstermek için state'i güncelle
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Hata bilgilerini logla
    logError("ErrorBoundary caught an error:", error, errorInfo);
    
    // State'i güncelle
    this.setState({
      error,
      errorInfo,
    });

    // Production'da error tracking servisine gönderilebilir
    // Örnek: Sentry.captureException(error, { extra: errorInfo });
  }

  handleReset = () => {
    // State'i sıfırla ve sayfayı yenile
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
    
    // Sayfayı yenile
    window.location.reload();
  };

  handleGoHome = () => {
    // Ana sayfaya yönlendir
    window.location.href = ROUTES.HOME;
  };

  render() {
    if (this.state.hasError) {
      // Fallback UI
      const { error, errorInfo } = this.state;
      const { fallback, showDetails = false } = this.props;

      // Custom fallback varsa onu kullan
      if (fallback) {
        return fallback(error, errorInfo, this.handleReset);
      }

      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="max-w-2xl w-full bg-white rounded-lg shadow-lg border border-gray-200 p-8 text-center">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
            </div>

            <h1 className="text-2xl font-bold text-gray-900 mb-3">
              Bir Hata Oluştu
            </h1>

            <p className="text-gray-600 mb-6">
              Üzgünüz, beklenmeyen bir hata oluştu. Lütfen sayfayı yenileyin
              veya ana sayfaya dönün.
            </p>

            {showDetails && error && (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg text-left">
                <p className="text-sm font-semibold text-gray-900 mb-2">
                  Hata Detayları:
                </p>
                <p className="text-xs text-gray-600 font-mono break-all">
                  {error.toString()}
                </p>
                {errorInfo && errorInfo.componentStack && (
                  <details className="mt-3">
                    <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-700">
                      Stack Trace
                    </summary>
                    <pre className="mt-2 text-xs text-gray-600 overflow-auto max-h-40">
                      {errorInfo.componentStack}
                    </pre>
                  </details>
                )}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                onClick={this.handleReset}
                leftIcon={<RefreshCw className="w-4 h-4" />}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Sayfayı Yenile
              </Button>
              <Button
                onClick={this.handleGoHome}
                variant="outline"
                leftIcon={<Home className="w-4 h-4" />}
              >
                Ana Sayfaya Dön
              </Button>
            </div>

            {process.env.NODE_ENV === "development" && errorInfo && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-xs text-gray-500 mb-2">
                  Development Mode - Hata Detayları:
                </p>
                <pre className="text-xs text-gray-600 overflow-auto max-h-60 bg-gray-50 p-3 rounded">
                  {errorInfo.componentStack}
                </pre>
              </div>
            )}
          </div>
        </div>
      );
    }

    // Normal render
    return this.props.children;
  }
}

export default ErrorBoundary;

