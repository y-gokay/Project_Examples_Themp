export const isKresMockMode = process.env.NEXT_PUBLIC_USE_MOCK === "true";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "";

const PUBLIC_API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

function normalizePublicBaseUrl(baseUrl?: string): string | undefined {
  if (!baseUrl) return undefined;
  if (baseUrl.startsWith("http://") || baseUrl.startsWith("https://")) {
    return baseUrl;
  }
  if (baseUrl.startsWith("/") && SITE_URL) {
    return `${SITE_URL.replace(/\/$/, "")}${baseUrl}`;
  }
  return baseUrl;
}

if (!isKresMockMode && !PUBLIC_API_BASE_URL) {
  throw new Error("NEXT_PUBLIC_API_BASE_URL is not set");
}

const effectivePublicApiBase =
  PUBLIC_API_BASE_URL ||
  (isKresMockMode ? "http://localhost:3999" : undefined);

const INTERNAL_API_BASE_URL =
  process.env.API_BASE_URL_INTERNAL || effectivePublicApiBase!;

const mockAssetBase =
  normalizePublicBaseUrl(SITE_URL) || "http://localhost:3000";

const IMAGE_PUBLIC_BASE_URL = isKresMockMode
  ? mockAssetBase
  : normalizePublicBaseUrl(process.env.NEXT_PUBLIC_API_PUBLIC_BASE_URL) ||
    normalizePublicBaseUrl(effectivePublicApiBase);

const CLIENT_API_BASE_URL = isKresMockMode
  ? mockAssetBase
  : normalizePublicBaseUrl(process.env.NEXT_PUBLIC_API_PUBLIC_BASE_URL) ||
    normalizePublicBaseUrl(effectivePublicApiBase);

function getRuntimeApiBaseUrl(): string {
  // Server-side fetch calls can use internal docker hostname.
  if (typeof window === "undefined") {
    return INTERNAL_API_BASE_URL!;
  }
  // Browser-side calls must use public/proxied URL.
  return CLIENT_API_BASE_URL!;
}

const runtimeApiBaseUrl = getRuntimeApiBaseUrl();

export const apiConfig = {
  baseUrl: INTERNAL_API_BASE_URL,
  publicBaseUrl: IMAGE_PUBLIC_BASE_URL,
  endpoints: {
    applications: {
      open: `${runtimeApiBaseUrl}/applications/open`,
      create: `${runtimeApiBaseUrl}/applications`,
    },
    kindergartens: {
      list: `${runtimeApiBaseUrl}/kresler`,
      detail: (id: string | number) => `${runtimeApiBaseUrl}/kresler/${id}`,
    },
    incomeRanges: `${runtimeApiBaseUrl}/income-ranges`,
  },
};

export function getApiUrl(endpoint: string): string {
  return `${INTERNAL_API_BASE_URL}${endpoint}`;
}
