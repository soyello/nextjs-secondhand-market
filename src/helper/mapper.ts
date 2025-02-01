import { AdapterSession, AdapterUser } from 'next-auth/adapters';
import { BaseRow, ProductRow, SessionRow, UserRow } from './row';
import { Product } from './type';

export const mapToBase = (row: BaseRow) => ({
  id: row.id,
  createdAt: row.created_at,
  updatedAt: row.updated_at ?? null,
});

export const mapToAdapterUser = (row: UserRow): AdapterUser => ({
  ...mapToBase(row),
  name: row.name,
  email: row.email,
  image: row.image ?? null,
  hashedPassword: row.hashed_password,
  emailVerified: row.email_verified ?? null,
  role: row.user_type,
});

export const mapToAdapterSession = (row: SessionRow): AdapterSession => ({
  sessionToken: row.session_token,
  userId: row.user_id,
  expires: row.expires,
});

export const mapToProduct = (row: ProductRow): Product => ({
  id: row.id.toString(),
  title: row.title,
  description: row.description,
  imageSrc: row.image_src,
  category: row.category,
  latitude: row.latitude,
  longitude: row.longitude,
  price: row.price,
  userId: row.user_id,
  createdAt: new Date(row.created_at),
  updatedAt: row.updated_at ? new Date(row.updated_at) : null,
});

export const mapToProducts = (rows: ProductRow[]): Product[] => rows.map(mapToProduct);
