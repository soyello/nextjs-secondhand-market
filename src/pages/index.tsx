import Container from '@/components/Container';
import EmptyState from '@/components/EmptyState';
import FloatingButton from '@/components/FloatingButton';
import ProductCard from '@/components/product/ProductCard';
import { Product } from '@/helper/type';
import axios from 'axios';
import { GetServerSideProps } from 'next';
import { AdapterUser } from 'next-auth/adapters';

interface HomeProps {
  products: Product[];
  currentUser: AdapterUser | null;
}

export default function Home({ products, currentUser }: HomeProps) {
  return (
    <Container>
      {products.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          <div className='grid grid-cols-1 gap-8 pt-12 sm:grid-cols-1 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-6'>
            {products.map((product) => (
              <ProductCard currentUser={currentUser} key={product.id} data={product} />
            ))}
          </div>
        </>
      )}
      <FloatingButton href='/products/upload'>+</FloatingButton>
    </Container>
  );
}
export const getServerSideProps: GetServerSideProps = async (context) => {
  try {
    const { query } = context;
    const queryString = new URLSearchParams(query as Record<string, string>).toString();
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

    const { data: currentUser } = await axios.get(`${baseUrl}/api/currentUser`, {
      headers: {
        cookie: context.req.headers.cookie || '',
      },
    });

    const { data: products } = await axios.get(`${baseUrl}/api/products?${queryString}`);

    return {
      props: {
        products,
        currentUser,
      },
    };
  } catch (error) {
    console.error('Error fetching products', error);
    return {
      props: {
        products: [],
        currentUser: null,
      },
    };
  }
};
