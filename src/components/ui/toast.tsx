import React, { useState, useEffect } from 'react';

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
  onClose?: () => void;
}

export const Toast: React.FC<ToastProps> = ({ 
  message, 
  type = 'info', 
  duration = 3000,
  onClose 
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      if (onClose) onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  if (!isVisible) return null;

  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-green-500 text-white';
      case 'error':
        return 'bg-red-500 text-white';
      case 'warning':
        return 'bg-yellow-500 text-white';
      default:
        return 'bg-blue-500 text-white';
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 animate-fadeIn">
      <div className={`${getTypeStyles()} px-4 py-2 rounded-lg shadow-lg flex items-center`}>
        <span className="text-sm font-medium">{message}</span>
        <button 
          onClick={() => {
            setIsVisible(false);
            if (onClose) onClose();
          }}
          className="ml-2 text-white hover:text-gray-200 focus:outline-none"
        >
          ×
        </button>
      </div>
    </div>
  );
};

export const showToast = (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info', duration = 3000) => {
  const toastContainer = document.getElementById('toast-container');
  if (!toastContainer) return;

  const toastElement = document.createElement('div');
  toastContainer.appendChild(toastElement);

  const removeToast = () => {
    toastContainer.removeChild(toastElement);
  };

  const toast = (
    <Toast 
      message={message} 
      type={type} 
      duration={duration} 
      onClose={removeToast} 
    />
  );

  // Since we're in a non-React context, we'll need to render this differently
  // For now, we'll just create a simple toast element
  toastElement.innerHTML = `
    <div class="fixed top-4 right-4 z-50 animate-fadeIn">
      <div class="${type === 'success' ? 'bg-green-500' : type === 'error' ? 'bg-red-500' : type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'} text-white px-4 py-2 rounded-lg shadow-lg flex items-center">
        <span class="text-sm font-medium">${message}</span>
        <button class="ml-2 text-white hover:text-gray-200 focus:outline-none">×</button>
      </div>
    </div>
  `;

  // Add animation styles if not present
  if (!document.getElementById('toast-styles')) {
    const style = document.createElement('style');
    style.id = 'toast-styles';
    style.innerHTML = `
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(-10px); }
        to { opacity: 1; transform: translateY(0); }
      }
      .animate-fadeIn {
        animation: fadeIn 0.3s ease-in-out;
      }
    `;
    document.head.appendChild(style);
  }

  // Add close functionality
  const closeButton = toastElement.querySelector('button');
  if (closeButton) {
    closeButton.addEventListener('click', () => {
      toastElement.remove();
    });
  }

  // Auto remove after duration
  setTimeout(() => {
    if (toastElement.parentNode) {
      toastElement.remove();
    }
  }, duration);
};