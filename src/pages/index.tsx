import Container from '@/components/Container';
import EmptyState from '@/components/EmptyState';
import FloatingButton from '@/components/FloatingButton';
import Pagination from '@/components/Pagination';
import Categories from '@/components/categories/Categories';
import ProductCard from '@/components/product/ProductCard';
import { PRODUCTS_PER_PAGE } from '@/constants';
import { Product } from '@/helper/type';
import axios from 'axios';
import { GetServerSideProps } from 'next';
import { AdapterUser } from 'next-auth/adapters';

interface HomeProps {
  products: { data: Product[]; totalItems: number };
  currentUser: AdapterUser | null;
  page: number;
}

export default function Home({ products, currentUser, page }: HomeProps) {
  console.log('products', products.data);
  return (
    <Container>
      <Categories />
      {products.data.length === 0 ? (
        <EmptyState showReset />
      ) : (
        <>
          <div className='grid grid-cols-1 gap-8 pt-12 sm:grid-cols-1 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-6'>
            {products.data.map((product) => (
              <ProductCard currentUser={currentUser} key={product.id} data={product} />
            ))}
          </div>
        </>
      )}
      <Pagination page={page} totalItems={products.totalItems} perPage={PRODUCTS_PER_PAGE} />
      <FloatingButton href='/products/upload'>+</FloatingButton>
    </Container>
  );
}
export const getServerSideProps: GetServerSideProps = async (context) => {
  try {
    const { query } = context;
    const page = query.page ? Number(query.page) : 1;

    const queryString = new URLSearchParams(query as Record<string, string>).toString();
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

    const { data: currentUser } = await axios.get(`${baseUrl}/api/currentUser`, {
      headers: {
        cookie: context.req.headers.cookie || '',
      },
    });

    const productResponse = await axios.get(`${baseUrl}/api/products?${queryString}`);

    return {
      props: {
        products: productResponse.data,
        currentUser,
        page,
      },
    };
  } catch (error) {
    console.error('Error fetching products', error);
    return {
      props: {
        products: [],
        currentUser: null,
        page: 1,
      },
    };
  }
};
