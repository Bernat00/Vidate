import { X } from 'lucide-react';
import { useEffect } from 'react';
import { createPortal } from 'react-dom';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
}

export function Modal({ isOpen, onClose, title, children, size = 'md', className, ...props }: ModalProps) {
  // Handle ESC key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      // Prevent scrolling when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
  };

  const modalContent = (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity" onClick={onClose}>
      <div
        className={`bg-bgPrimary border border-borderAccentLight rounded-2xl shadow-2xl w-full max-h-[90vh] overflow-y-auto ${sizeClasses[size]} ${className || ''}`.trim()}
        onClick={(e) => e.stopPropagation()}
        {...props}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-borderAccentLight/30">
          <h3 className="text-lg font-bold text-textAccent">{title}</h3>
          <button
            onClick={onClose}
            className="text-textSecondary hover:text-textPrimary transition-colors p-1 rounded-lg hover:bg-bgSecondary hover:cursor-pointer"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 pt-2 text-textPrimary">
          {children}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
