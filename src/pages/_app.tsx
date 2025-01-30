import NavBar from '@/components/NavBar';
import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import { Lato } from 'next/font/google';

const lato = Lato({ subsets: ['latin'], weight: ['300', '400', '700'] });

export default function App({ Component, pageProps }: AppProps) {
  return (
    <div className={lato.className}>
      <NavBar />
      <Component {...pageProps} />
    </div>
  );
}
