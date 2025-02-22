import { RowDataPacket } from 'mysql2';

export interface BaseRow extends RowDataPacket {
  id: string;
  created_at: Date;
  updated_at: Date | null;
}

export interface UserRow extends BaseRow {
  name: string;
  email: string;
  image: string | null;
  hashed_password?: string;
  email_verified: Date | null;
  user_type: string;
  favorite_ids: string[];
}

export interface SessionRow extends RowDataPacket {
  session_token: string;
  user_id: string;
  expires: Date;
}

export interface ProductRow extends RowDataPacket {
  id: string;
  title: string;
  description: string;
  image_src: string;
  category: string;
  latitude: number;
  longitude: number;
  price: number;
  user_id: string;
  created_at: Date;
  updated_at: Date | null;
}
