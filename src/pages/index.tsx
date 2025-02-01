import { Product } from '@/helper/type';
import axios from 'axios';
import { GetServerSideProps } from 'next';

interface HomeProps {
  products: Product[];
}

export default function Home({ products }: HomeProps) {
  console.log(products);
  return (
    <>
      <h1>누구나 볼 수 있는 페이지입니다.</h1>
      {products.length > 0 ? (
        <ul>
          {products.map((product) => (
            <li key={product.id}>{product.title}</li>
          ))}
        </ul>
      ) : (
        <p>제품이 없습니다.</p>
      )}
    </>
  );
}
export const getServerSideProps: GetServerSideProps = async (context) => {
  try {
    const { query } = context;

    const queryString = new URLSearchParams(query as Record<string, string>).toString();
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const { data: products } = await axios.get(`${baseUrl}/api/products?${queryString}`);

    return {
      props: {
        products,
      },
    };
  } catch (error) {
    console.error('Error fetching products', error);
    return {
      props: {
        products: [],
      },
    };
  }
};
