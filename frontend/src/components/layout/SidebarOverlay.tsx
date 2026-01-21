import type { ReactElement } from 'react';

type SidebarOverlayProps = {
  open: boolean;
  onClose: () => void;
};

export default function SidebarOverlay({ open, onClose }: SidebarOverlayProps): ReactElement | null {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 z-30 lg:hidden"
      onClick={onClose}
      aria-hidden="true"
    />
  );
}
