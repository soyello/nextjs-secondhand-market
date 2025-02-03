import { PRODUCTS_PER_PAGE } from '@/constants';
import mySQLAdapter from './mysqlAdapter';

export interface ProductsParams {
  latitude?: number;
  longitude?: number;
  category?: string;
  page?: number;
}

export default async function getProducts(params: ProductsParams) {
  try {
    const { latitude, longitude, category, page = 1 } = params;
    const itemsPerPage = PRODUCTS_PER_PAGE;

    let query: Record<string, any> = {};

    if (category) {
      query.category = category;
    }
    if (latitude) {
      query.latitude = {
        min: Number(latitude) - 0.01,
        max: Number(latitude) + 0.01,
      };
    }
    if (longitude) {
      query.longitude = {
        min: Number(longitude) - 0.01,
        max: Number(longitude) + 0.01,
      };
    }
    try {
      const result = await mySQLAdapter.getProducts(query, page, itemsPerPage);
      if (!result || !result.data || typeof result.totalItems !== 'number') {
        return { data: [], totalItems: 0 };
      }
      return result;
    } catch (error) {
      console.error('Error fetching products:', error);
      throw new Error('Failed to fetch products');
    }
  } catch (error: any) {
    throw new Error(error);
  }
}
