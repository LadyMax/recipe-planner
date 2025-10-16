import { Outlet, useLocation } from 'react-router-dom';
import { Container } from 'react-bootstrap';

export default function Main() {
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  return (
    <main>
      {/* Banner Section */}
      <div className="banner-section">
        <div className="banner-overlay">
          <Container>
            <div className="banner-content">
              <h1 className="banner-title">Recipe Master</h1>
              <p className="banner-subtitle">Discover, Create & Share Amazing Recipes</p>
            </div>
          </Container>
        </div>
      </div>

      {/* Main Content */}
      {isHomePage ? (
        <Outlet />
      ) : (
        <Container className="py-4">
          <Outlet />
        </Container>
      )}
    </main>
  );
}
