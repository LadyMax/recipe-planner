import React from 'react';
import { Modal, Form, Button, Alert } from 'react-bootstrap';

interface BaseModalProps {
  show: boolean;
  onHide: () => void;
  title: string;
  icon?: string;
  variant?: 'primary' | 'success' | 'warning' | 'danger';
  onSubmit: (e: React.FormEvent) => void;
  isLoading?: boolean;
  error?: string | null;
  children: React.ReactNode;
  submitText?: string;
  submitIcon?: string;
  cancelText?: string;
  cancelIcon?: string;
  submitVariant?: 'primary' | 'success' | 'warning' | 'danger';
  showFooter?: boolean;
}

export default function BaseModal({
  show,
  onHide,
  title,
  icon,
  variant = 'primary',
  onSubmit,
  isLoading = false,
  error,
  children,
  submitText = 'Submit',
  submitIcon,
  cancelText = 'Cancel',
  cancelIcon = 'x-circle',
  submitVariant = 'primary',
  showFooter = true,
}: BaseModalProps) {
  const handleMouseDown = (e: React.MouseEvent) => {
    // Only prevent default if not clicking on input elements
    if (!(e.target as HTMLElement).closest('input, textarea, select')) {
      e.preventDefault();
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
        className={`bg-${variant} text-white modal-no-select`}
      >
        <Modal.Title className="modal-title-no-select">
          {icon && <i className={`bi ${icon} me-2`}></i>}
          {title}
        </Modal.Title>
      </Modal.Header>
      <Form onSubmit={onSubmit}>
        <Modal.Body
          className="modal-no-select"
          onMouseDown={handleMouseDown}
        >
          {error && (
            <Alert variant="danger" className="mb-3">
              {error}
            </Alert>
          )}
          {children}
        </Modal.Body>
        {showFooter && (
          <Modal.Footer>
            <div className="w-100">
              <div className="d-flex gap-2">
                <Button
                  variant="secondary"
                  onClick={onHide}
                  disabled={isLoading}
                  className="flex-fill"
                >
                  <i className={`bi bi-${cancelIcon} me-1`}></i>
                  {cancelText}
                </Button>
                <Button
                  variant={submitVariant}
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
                      Loading...
                    </>
                  ) : (
                    <>
                      {submitIcon && <i className={`bi ${submitIcon} me-1`}></i>}
                      {submitText}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </Modal.Footer>
        )}
      </Form>
    </Modal>
  );
}
