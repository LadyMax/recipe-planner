import React from 'react';
import { Form } from 'react-bootstrap';

interface FormInputProps {
  label: string;
  icon?: string;
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

export default function FormInput({
  label,
  icon,
  type = 'text',
  placeholder,
  value,
  onChange,
  required = false,
  disabled = false,
  className = '',
}: FormInputProps) {
  return (
    <Form.Group className={`mb-3 ${className}`}>
      <Form.Label className="form-label-no-select">
        {icon && <i className={`bi ${icon} me-1`}></i>}
        {label}
      </Form.Label>
      <Form.Control
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
      />
    </Form.Group>
  );
}
