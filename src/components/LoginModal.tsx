import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import type { LoginCredentials } from '../types/user';
import BaseModal from './BaseModal';
import FormInput from './FormInput';

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
      console.warn('Login error handled by AuthContext:', error);
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
      <BaseModal
        show={show}
        onHide={onHide}
        title="Login"
        icon="bi-person-circle"
        variant="primary"
        onSubmit={handleSubmit}
        isLoading={isLoading}
        error={error}
        submitText="Login"
        submitIcon="bi-box-arrow-in-right"
        submitVariant="primary"
      >
        <FormInput
          label="Email"
          icon="bi-envelope"
          type="email"
          placeholder="Enter your email"
          value={credentials.email}
          onChange={handleInputChange('email')}
          required
          disabled={isLoading}
        />

        <FormInput
          label="Password"
          icon="bi-lock"
          type="password"
          placeholder="Enter your password"
          value={credentials.password}
          onChange={handleInputChange('password')}
          required
          disabled={isLoading}
        />

        <div className="text-center mb-3">
          <small className="text-muted text-muted-no-select">
            Please contact administrator for account access
          </small>
        </div>
      </BaseModal>
    </>
  );
}
