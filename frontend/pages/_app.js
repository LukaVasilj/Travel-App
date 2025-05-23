import 'bootstrap/dist/css/bootstrap.min.css';
import AOS from 'aos';

import '../styles/globals.css'
import RootLayout from './layout';
import { useEffect } from 'react';


function MyApp({ Component, pageProps }) {
  useEffect(() => {
    AOS.init({ duration: 800, once: true });
  }, []);

  return (
    <RootLayout>
      <Component {...pageProps} />
    </RootLayout>
  );
}

export default MyApp;