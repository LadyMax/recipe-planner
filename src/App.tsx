import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import Header from './partials/Header.tsx';
import Main from './partials/Main.tsx';
import Footer from './partials/Footer.tsx';

export default function App() {
  const loc = useLocation();
  useEffect(() => {
    (window as any).scrollTo?.({ top: 0, left: 0, behavior: 'instant' });
  }, [loc.pathname]);

  return (
    <ThemeProvider>
      <AuthProvider>
        <Header />
        <Main />
        <Footer />
      </AuthProvider>
    </ThemeProvider>
  );
}
