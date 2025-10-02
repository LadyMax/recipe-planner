import React, { useState, useEffect } from 'react';
import { Modal, Form, Button, Alert } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';

interface RegisterCredentials {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface RegisterModalProps {
  show: boolean;
  onHide: () => void;
}

export default function RegisterModal({ show, onHide }: RegisterModalProps) {
  const { login } = useAuth();
  const [credentials, setCredentials] = useState<RegisterCredentials>({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (show) {
      setError(null);
      setCredentials({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
      });
    }
  }, [show]);

  const handleInputChange =
    (field: keyof RegisterCredentials) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setCredentials(prev => ({
        ...prev,
        [field]: e.target.value,
      }));
    };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Validation
    if (credentials.password !== credentials.confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    if (credentials.password.length < 6) {
      setError('Password must be at least 6 characters long');
      setIsLoading(false);
      return;
    }

    try {
      // Simulate API call with delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Auto-login after successful registration
      await login({
        email: credentials.email,
        password: credentials.password,
      });

      onHide();
    } catch (error: any) {
      setError(error.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      show={show}
      onHide={onHide}
      centered
      backdrop="static"
      keyboard={false}
    >
      <Modal.Header
        closeButton
        className="bg-success text-white modal-no-select"
      >
        <Modal.Title className="modal-title-no-select">
          <i className="bi bi-person-plus me-2"></i>
          Create Account
        </Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body
          className="modal-no-select"
          onMouseDown={e => {
            // Only prevent default if not clicking on input elements
            if (!(e.target as HTMLElement).closest('input, textarea, select')) {
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
              <i className="bi bi-person me-1"></i>
              Username
            </Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter your username"
              value={credentials.username}
              onChange={handleInputChange('username')}
              required
              disabled={isLoading}
            />
          </Form.Group>

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
              placeholder="Enter your password (min 6 characters)"
              value={credentials.password}
              onChange={handleInputChange('password')}
              required
              disabled={isLoading}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label className="form-label-no-select">
              <i className="bi bi-lock-fill me-1"></i>
              Confirm Password
            </Form.Label>
            <Form.Control
              type="password"
              placeholder="Confirm your password"
              value={credentials.confirmPassword}
              onChange={handleInputChange('confirmPassword')}
              required
              disabled={isLoading}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide} disabled={isLoading}>
            <i className="bi bi-x-circle me-1"></i>
            Cancel
          </Button>
          <Button variant="success" type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <span
                  className="spinner-border spinner-border-sm me-2"
                  role="status"
                  aria-hidden="true"
                ></span>
                Creating Account...
              </>
            ) : (
              <>
                <i className="bi bi-person-plus me-1"></i>
                Create Account
              </>
            )}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}
