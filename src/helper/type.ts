export interface Product {
  id: string;
  title: string;
  description: string;
  imageSrc: string;
  category: string;
  latitude: number;
  longitude: number;
  price: number;
  userId: string;
  createdAt: Date;
  updatedAt: Date | null;
}
