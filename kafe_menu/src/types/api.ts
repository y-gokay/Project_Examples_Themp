export type Role = 'SUPER_ADMIN' | 'VENUE_ADMIN';

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: Role;
  venueId: number | null;
}

export interface LoginResponse {
  token: string;
  user: AuthUser;
}

export interface Venue {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: {
    categories: number;
    admins: number;
    products?: number;
  };
}

export interface VenueCreateInput {
  name: string;
  slug: string;
  description?: string;
  isActive: boolean;
}

export interface VenueUpdateInput {
  name?: string;
  slug?: string;
  description?: string | null;
  isActive?: boolean;
}

export interface Category {
  id: number;
  name: string;
  sortOrder: number;
  venueId: number;
  createdAt: string;
  updatedAt: string;
  _count?: {
    products?: number;
  };
}

export interface CategoryCreateInput {
  venueId: number;
  name: string;
  sortOrder: number;
}

export interface CategoryUpdateInput {
  /** PUT gövdesinde API tarafından zorunlu */
  venueId: number;
  name?: string;
  sortOrder?: number;
}

export interface Product {
  id: number;
  name: string;
  description: string | null;
  price: number;
  imageUrl: string | null;
  isAvailable: boolean;
  sortOrder: number;
  categoryId: number;
  category?: {
    id: number;
    name: string;
    venueId: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ProductFormValues {
  categoryId: number;
  name: string;
  description?: string;
  price: number;
  isAvailable: boolean;
  sortOrder: number;
  image?: File | null;
}

export interface AdminUser {
  id: number;
  name: string;
  email: string;
  role: Role;
  isActive: boolean;
  venueId: number | null;
  venue: { name: string; slug: string } | null;
}

export interface AdminUserCreateInput {
  name: string;
  email: string;
  password: string;
  role: Role;
  venueId: number | null;
  isActive: boolean;
}

export interface ApiEnvelope<T> {
  data: T;
}
