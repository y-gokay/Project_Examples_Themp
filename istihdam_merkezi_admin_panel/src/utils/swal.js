import Swal from 'sweetalert2';

/**
 * Success alert
 */
export const showSuccess = (title, text = '') => {
  return Swal.fire({
    icon: 'success',
    title,
    text,
    confirmButtonColor: '#9333ea',
    confirmButtonText: 'Tamam',
  });
};

/**
 * Error alert
 */
export const showError = (title, text = '') => {
  return Swal.fire({
    icon: 'error',
    title,
    text,
    confirmButtonColor: '#dc2626',
    confirmButtonText: 'Tamam',
  });
};

/**
 * Warning alert
 */
export const showWarning = (title, text = '') => {
  return Swal.fire({
    icon: 'warning',
    title,
    text,
    confirmButtonColor: '#f59e0b',
    confirmButtonText: 'Tamam',
  });
};

/**
 * Info alert
 */
export const showInfo = (title, text = '') => {
  return Swal.fire({
    icon: 'info',
    title,
    text,
    confirmButtonColor: '#3b82f6',
    confirmButtonText: 'Tamam',
  });
};

/**
 * Confirm dialog
 */
export const showConfirm = (title, text = '', confirmButtonText = 'Evet', cancelButtonText = 'Hayır') => {
  return Swal.fire({
    title,
    text,
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: '#9333ea',
    cancelButtonColor: '#6b7280',
    confirmButtonText,
    cancelButtonText,
    reverseButtons: true,
    buttonsStyling: true,
    customClass: {
      confirmButton: 'swal2-confirm-custom',
      cancelButton: 'swal2-cancel-custom',
    },
  });
};

/**
 * Confirm delete dialog
 */
export const showConfirmDelete = (title, text = '') => {
  return Swal.fire({
    title,
    text,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#dc2626',
    cancelButtonColor: '#6b7280',
    confirmButtonText: 'Evet, Sil',
    cancelButtonText: 'İptal',
    reverseButtons: true,
    buttonsStyling: true,
    customClass: {
      confirmButton: 'swal2-confirm-custom',
      cancelButton: 'swal2-cancel-custom',
    },
  });
};

/**
 * Confirm action dialog
 */
export const showConfirmAction = (title, text = '', actionName = 'Onayla') => {
  return Swal.fire({
    title,
    text,
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: '#9333ea',
    cancelButtonColor: '#6b7280',
    confirmButtonText: actionName,
    cancelButtonText: 'İptal',
    reverseButtons: true,
    buttonsStyling: true,
    customClass: {
      confirmButton: 'swal2-confirm-custom',
      cancelButton: 'swal2-cancel-custom',
    },
  });
};

