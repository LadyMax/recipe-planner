import React, { useState, useEffect } from 'react';
import BaseModal from './BaseModal';
import FormInput from './FormInput';

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

      // Show success message instead of actual registration
      setError('Registration feature is not implemented. Please contact administrator to create an account.');
      
      // Clear form after showing message
      setTimeout(() => {
        setCredentials({
          username: '',
          email: '',
          password: '',
          confirmPassword: '',
        });
        setError(null);
      }, 3000);

    } catch (error: any) {
      setError(error.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <BaseModal
      show={show}
      onHide={onHide}
      title="Create Account"
      icon="bi-person-plus"
      variant="success"
      onSubmit={handleSubmit}
      isLoading={isLoading}
      error={error}
      submitText="Create Account"
      submitIcon="bi-person-plus"
      submitVariant="success"
    >
      <FormInput
        label="Username"
        icon="bi-person"
        type="text"
        placeholder="Enter your username"
        value={credentials.username}
        onChange={handleInputChange('username')}
        required
        disabled={isLoading}
      />

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
        placeholder="Enter your password (min 6 characters)"
        value={credentials.password}
        onChange={handleInputChange('password')}
        required
        disabled={isLoading}
      />

      <FormInput
        label="Confirm Password"
        icon="bi-lock-fill"
        type="password"
        placeholder="Confirm your password"
        value={credentials.confirmPassword}
        onChange={handleInputChange('confirmPassword')}
        required
        disabled={isLoading}
      />
    </BaseModal>
  );
}
