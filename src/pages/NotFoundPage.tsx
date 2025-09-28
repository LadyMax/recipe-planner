import { Link, useLocation } from 'react-router-dom';
import { Container, Alert, Button, Row, Col } from 'react-bootstrap';

NotFoundPage.route = {
  path: '*',
};

export default function NotFoundPage() {
  const location = useLocation();

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          <div className="text-center fade-in">
            <div className="mb-4">
              <h1 className="display-1 text-primary fw-bold">404</h1>
              <h2 className="h3 mb-3">Page Not Found</h2>
            </div>

            <Alert variant="warning" className="mb-4">
              <Alert.Heading>
                Sorry, the page you visited does not exist
              </Alert.Heading>
              <p className="mb-2">The path you tried to access is:</p>
              <code className="bg-light p-2 rounded d-block">
                {location.pathname}
              </code>
            </Alert>

            <div className="d-flex gap-3 justify-content-center">
              <Button
                as={Link as any}
                to="/recipes"
                variant="primary"
                size="lg"
              >
                <i className="bi bi-house-door me-2"></i>
                Return Home
              </Button>
              <Button
                variant="outline-secondary"
                size="lg"
                onClick={() => window.history.back()}
              >
                <i className="bi bi-arrow-left me-2"></i>
                Go Back
              </Button>
            </div>
          </div>
        </Col>
      </Row>
    </Container>
  );
}
