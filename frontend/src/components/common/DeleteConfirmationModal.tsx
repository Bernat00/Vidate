import { Modal } from './Modal';
import { Button } from 'flowbite-react';
import { AlertTriangle } from 'lucide-react';

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  isDeleting?: boolean;
}

export function DeleteConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Delete',
  description = 'Are you sure you want to delete this? This action is permanent.',
  confirmText = "Yes, I'm sure",
  cancelText = 'No, cancel',
  isDeleting = false,
}: DeleteConfirmationModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="md"
    >
      <div className="text-center">
        <AlertTriangle className="mx-auto mb-4 h-14 w-14 text-red-500" />
        <h3 className="mb-5 text-lg font-normal text-textSecondary">
          {description}
        </h3>
        <div className="flex justify-center gap-4">
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="bg-textError hover:opacity-90 text-white font-semibold rounded-lg px-5 py-2.5 transition hover:cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isDeleting ? 'Deleting...' : confirmText}
          </button>
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="bg-bgSecondary text-textPrimary hover:bg-bgPrimary border border-borderAccentLight font-semibold rounded-lg px-5 py-2.5 transition hover:cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {cancelText}
          </button>
        </div>
      </div>
    </Modal>
  );
}
