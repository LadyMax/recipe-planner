import { Alert, Button, Row, Col } from 'react-bootstrap';
import { usePWA } from '../hooks/usePWA';

export default function PWAInstallPrompt() {
  const {
    isInstallable,
    isInstalled,
    isOnline,
    isUpdateAvailable,
    installApp,
    updateApp,
  } = usePWA();

  if (isInstalled) return null;

  return (
    <>
      {isInstallable && (
        <Alert variant="info" className="mb-3">
          <Row className="align-items-center">
            <Col>
              <strong>Install App</strong>
              <p className="mb-0">
                Install Recipe Master on your device for a better experience!
              </p>
            </Col>
            <Col xs="auto">
              <Button variant="primary" onClick={installApp}>
                Install
              </Button>
            </Col>
          </Row>
        </Alert>
      )}

      {isUpdateAvailable && (
        <Alert variant="warning" className="mb-3">
          <Row className="align-items-center">
            <Col>
              <strong>App Update Available</strong>
              <p className="mb-0">
                A new version is available. Click update to get the latest
                features!
              </p>
            </Col>
            <Col xs="auto">
              <Button variant="warning" onClick={updateApp}>
                Update Now
              </Button>
            </Col>
          </Row>
        </Alert>
      )}

      {!isOnline && (
        <Alert variant="secondary" className="mb-3">
          <Row className="align-items-center">
            <Col>
              <strong>Offline Mode</strong>
              <p className="mb-0">
                You are currently offline. Some features may be limited.
              </p>
            </Col>
          </Row>
        </Alert>
      )}
    </>
  );
}
