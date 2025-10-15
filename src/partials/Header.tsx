import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Container, Nav, Navbar, Button, Dropdown } from 'react-bootstrap';
import { useAuth } from '../hooks/useAuth';
import LoginModal from '../components/LoginModal';
import ThemeToggle from '../components/ThemeToggle';
import routes from '../routes.ts';

export default function Header() {
  const [expanded, setExpanded] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const pathName = useLocation().pathname;
  const currentRoute = routes
    .slice()
    .sort((a, b) => (a.path.length > b.path.length ? -1 : 1))
    .find(x => pathName.indexOf(x.path.split(':')[0]) === 0);

  const isActive = (path: string) =>
    path === currentRoute?.path || path === currentRoute?.parent;

  // Function to format username with proper capitalization
  const formatDisplayName = (user: { name?: string; username?: string; email?: string } | null) => {
    if (user?.name) return user.name;
    if (user?.username) return user.username;
    if (user?.email) {
      const username = user.email.split('@')[0];
      return username.charAt(0).toUpperCase() + username.slice(1).toLowerCase();
    }
    return 'User';
  };

  return (
    <header>
      <Navbar
        expanded={expanded}
        expand="md"
        className="bg-primary"
        data-bs-theme="dark"
        fixed="top"
      >
        <Container fluid>
          <Navbar.Brand className="me-5" as={Link} to="/">
            Recipe Master
          </Navbar.Brand>
          <Navbar.Toggle onClick={() => setExpanded(!expanded)} />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              {routes
                .filter(x => x.menuLabel)
                .map(({ menuLabel, path }, i) => (
                  <Nav.Link
                    as={Link}
                    key={i}
                    to={path}
                    className={isActive(path) ? 'active' : ''}
                    onClick={() => setTimeout(() => setExpanded(false), 200)}
                  >
                    {menuLabel}
                  </Nav.Link>
                ))}
            </Nav>
            <Nav>
              <ThemeToggle className="me-2" />
              {isAuthenticated ? (
                <Dropdown align="end">
                  <Dropdown.Toggle variant="outline-light" id="user-dropdown">
                    {formatDisplayName(user)}
                  </Dropdown.Toggle>
                  <Dropdown.Menu>
                    <Dropdown.ItemText>
                      <small className="text-muted">
                        {user?.role === 'admin' ? 'Admin' : 'User'}
                      </small>
                    </Dropdown.ItemText>
                    <Dropdown.Divider />
                    <Dropdown.Item onClick={logout}>Logout</Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              ) : (
                <Button
                  variant="outline-light"
                  onClick={() => setShowLogin(true)}
                >
                  Login
                </Button>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <LoginModal show={showLogin} onHide={() => setShowLogin(false)} />
    </header>
  );
}
