import React, { useState } from 'react';
import { Modal, Form, Button, Alert } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import type { LoginCredentials } from '../types/user';
import RegisterModal from './RegisterModal';

interface LoginModalProps {
  show: boolean;
  onHide: () => void;
}

export default function LoginModal({ show, onHide }: LoginModalProps) {
  const { login, error, clearError } = useAuth();
  const [credentials, setCredentials] = useState<LoginCredentials>({
    email: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    clearError();

    try {
      await login(credentials);
      onHide();
      setCredentials({ email: '', password: '' });
    } catch (error) {
      // Error is handled in AuthContext
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange =
    (field: keyof LoginCredentials) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setCredentials(prev => ({
        ...prev,
        [field]: e.target.value,
      }));
    };

  return (
    <>
      <Modal
        show={show}
        onHide={onHide}
        centered
        backdrop="static"
        keyboard={false}
      >
        <Modal.Header
          closeButton
          className="bg-primary text-white modal-no-select"
        >
          <Modal.Title className="modal-title-no-select">
            <i className="bi bi-person-circle me-2"></i>
            Login
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body
            className="modal-no-select"
            onMouseDown={e => {
              // Only prevent default if not clicking on input elements
              if (
                !(e.target as HTMLElement).closest('input, textarea, select')
              ) {
                e.preventDefault();
              }
            }}
          >
            {error && (
              <Alert variant="danger" className="mb-3">
                {error}
              </Alert>
            )}

            <Form.Group className="mb-3">
              <Form.Label className="form-label-no-select">
                <i className="bi bi-envelope me-1"></i>
                Email
              </Form.Label>
              <Form.Control
                type="email"
                placeholder="Enter your email"
                value={credentials.email}
                onChange={handleInputChange('email')}
                required
                disabled={isLoading}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="form-label-no-select">
                <i className="bi bi-lock me-1"></i>
                Password
              </Form.Label>
              <Form.Control
                type="password"
                placeholder="Enter your password"
                value={credentials.password}
                onChange={handleInputChange('password')}
                required
                disabled={isLoading}
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <div className="w-100">
              <div className="text-center mb-3">
                <small className="text-muted text-muted-no-select">
                  Don't have an account?{' '}
                  <Button
                    variant="link"
                    className="p-0 text-decoration-none"
                    onClick={() => {
                      onHide();
                      setShowRegister(true);
                    }}
                  >
                    Create one here
                  </Button>
                </small>
              </div>
              <div className="d-flex gap-2">
                <Button
                  variant="secondary"
                  onClick={onHide}
                  disabled={isLoading}
                  className="flex-fill"
                >
                  <i className="bi bi-x-circle me-1"></i>
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  type="submit"
                  disabled={isLoading}
                  className="flex-fill"
                >
                  {isLoading ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                        aria-hidden="true"
                      ></span>
                      Logging in...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-box-arrow-in-right me-1"></i>
                      Login
                    </>
                  )}
                </Button>
              </div>
            </div>
          </Modal.Footer>
        </Form>
      </Modal>

      <RegisterModal
        show={showRegister}
        onHide={() => setShowRegister(false)}
      />
    </>
  );
}
