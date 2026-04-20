import { apiConfig, isKresMockMode } from "@/lib/api-config";
import {
  getMockKindergartenById,
  mockKindergartenListItems,
} from "@/lib/kres-mock-data";

// API Response Interfaces
export interface ApiPhoto {
  id: number;
  photoPath: string;
  order: number;
}

export interface ApiAgeGroup {
  id: number;
  name: string;
  minAge: number;
  maxAge: number;
  order: number;
}

export interface ApiKindergarten {
  id: number;
  name: string;
  address: string;
  phone: string;
  email: string;
  description: string;
  latitude?: number;
  longitude?: number;
  photos: ApiPhoto[];
  ageGroups?: ApiAgeGroup[];
  createdAt: string;
  updatedAt: string;
}

export interface ApiKindergartenListResponse {
  items: ApiKindergarten[];
}

// App Interface
export interface Kindergarten {
  id: string;
  name: string;
  address: string;
  latitude?: number;
  longitude?: number;
  capacity: number;
  ageRange: string;
  ageGroups: AgeGroup[];
  image: string;
  available: boolean;
  description: string;
  features: string[];
  workingHours: string;
  phone: string;
  email: string;
  gallery: string[];
}

export interface AgeGroup {
  id: number;
  name: string;
  minAge: number;
  maxAge: number;
}

// ---------------------------

export async function fetchKindergartens(): Promise<Kindergarten[]> {
  if (isKresMockMode) {
    return mockKindergartenListItems.map((item) =>
      mapApiKindergartenToKindergarten(item as unknown as ApiKindergarten),
    );
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(apiConfig.endpoints.kindergartens.list, {
      cache: "no-store",
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(
        `Çocuk Gelişim Merkezleri yüklenemedi: ${response.status} ${response.statusText}`,
      );
    }

    const data: ApiKindergartenListResponse = await response.json();
    return data.items.map(mapApiKindergartenToKindergarten);
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === "AbortError") {
        console.warn(
          "Çocuk Gelişim Merkezi listesi isteği zaman aşımına uğradı, boş liste döndürülüyor",
        );
      } else if (
        error.message.includes("fetch failed") ||
        error.message.includes("ECONNREFUSED")
      ) {
        console.warn(
          "Çocuk Gelişim Merkezi listesi API'ye bağlanılamadı, boş liste döndürülüyor:",
          error.message,
        );
      } else {
        console.error("Çocuk Gelişim Merkezleri yüklenirken hata:", error.message);
      }
    } else {
      console.error("Çocuk Gelişim Merkezleri yüklenirken bilinmeyen hata:", error);
    }
    return [];
  }
}

export async function fetchKindergartenById(
  id: string | number,
): Promise<Kindergarten | null> {
  const numericId = typeof id === "string" ? parseInt(id, 10) : id;

  if (isKresMockMode) {
    if (isNaN(numericId)) {
      console.warn(`Geçersiz ID formatı: ${id}. API sayısal ID bekliyor.`);
      return null;
    }
    const raw = getMockKindergartenById(numericId);
    if (!raw) return null;
    return mapApiKindergartenToKindergarten(raw as unknown as ApiKindergarten);
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(
      apiConfig.endpoints.kindergartens.detail(numericId),
      {
        cache: "no-store",
        signal: controller.signal,
      },
    );

    clearTimeout(timeoutId);

    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error(
        `Çocuk Gelişim Merkezi yüklenemedi: ${response.status} ${response.statusText}`,
      );
    }

    const data: ApiKindergarten = await response.json();
    return mapApiKindergartenToKindergarten(data);
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === "AbortError") {
        console.warn(
          "Tekil çocuk gelişim merkezi isteği zaman aşımına uğradı, null döndürülüyor",
        );
      } else if (
        error.message.includes("fetch failed") ||
        error.message.includes("ECONNREFUSED")
      ) {
        console.warn(
          "Tekil çocuk gelişim merkezi API'ye bağlanılamadı, null döndürülüyor:",
          error.message,
        );
      } else {
        console.error("Çocuk Gelişim Merkezi yüklenirken hata:", error.message);
      }
    } else {
      console.error("Çocuk Gelişim Merkezi yüklenirken bilinmeyen hata:", error);
    }
    return null;
  }
}

// Mapping function
function mapApiKindergartenToKindergarten(
  apiKindergarten: ApiKindergarten,
): Kindergarten {
  const sortedPhotos = [...apiKindergarten.photos].sort(
    (a, b) => a.order - b.order,
  );
  const gallery = sortedPhotos.map((photo) => {
    if (
      photo.photoPath.startsWith("http://") ||
      photo.photoPath.startsWith("https://")
    ) {
      return photo.photoPath;
    }
    const cleanPath = photo.photoPath.startsWith("/")
      ? photo.photoPath
      : `/${photo.photoPath}`;
    return `${apiConfig.publicBaseUrl}${cleanPath}`;
  });
  const image = gallery.length > 0 ? gallery[0] : "/placeholder.svg";

  // Yaş aralığı ve mappedAgeGroups
  let calculatedAgeRange = "3-5";
  const mappedAgeGroups: AgeGroup[] = [];

  if (apiKindergarten.ageGroups && apiKindergarten.ageGroups.length > 0) {
    const sortedGroups = [...apiKindergarten.ageGroups].sort(
      (a, b) => a.order - b.order,
    );
    const minAge = Math.min(...sortedGroups.map((g) => g.minAge));
    const maxAge = Math.max(...sortedGroups.map((g) => g.maxAge));
    calculatedAgeRange = `${minAge}-${maxAge}`;
    sortedGroups.forEach((g) => {
      mappedAgeGroups.push({
        id: g.id,
        name: g.name,
        minAge: g.minAge,
        maxAge: g.maxAge,
      });
    });
  }

  return {
    id: apiKindergarten.id.toString(),
    name: apiKindergarten.name,
    address: apiKindergarten.address,
    latitude: apiKindergarten.latitude ?? undefined,
    longitude: apiKindergarten.longitude ?? undefined,
    phone: apiKindergarten.phone,
    email: apiKindergarten.email,
    description: apiKindergarten.description,
    image,
    gallery,
    capacity: 50,
    ageRange: calculatedAgeRange,
    ageGroups: mappedAgeGroups,
    available: true,
    features: [
      "Geniş oyun alanları",
      "Uzman eğitimci kadrosu",
      "Güvenli ve hijyenik ortam",
      "Dengeli beslenme programı",
    ],
    workingHours: "07:30 - 18:00",
  };
}
