import type { ReactNode } from 'react';
import type { ToastStatus } from '../types/domain';
import { AlertTriangle, Check, Info, X, Heart } from 'lucide-react';

type ToastConfig = {
  iconColor: string;
  iconBg: string;
  icon: ReactNode;
};

type ToastProps = {
  text: string;
  status?: ToastStatus;
  onClose?: () => void;
};

const Toast = ({ text, status = 'info', onClose }: ToastProps) => {
  const config: Record<ToastStatus, ToastConfig> = {
    success: {
      iconColor: 'text-textSuccess',
      iconBg: 'bg-bgSuccessSoft',
      icon: <Check className="w-5 h-5" aria-hidden="true" />,
    },
    error: {
      iconColor: 'text-textError',
      iconBg: 'bg-bgErrorSoft',
      icon: <X className="w-5 h-5" aria-hidden="true" />,
    },
    warning: {
      iconColor: 'text-textWarning',
      iconBg: 'bg-bgWarningSoft',
      icon: <AlertTriangle className="w-5 h-5" aria-hidden="true" />,
    },
    info: {
      iconColor: 'text-textAccent',
      iconBg: 'bg-bgAccentPrimary',
      icon: <Info className="w-5 h-5" aria-hidden="true" />,
    },
    match: {
      iconColor: 'text-white',
      iconBg: 'bg-gradient-to-br from-textAccent to-purple-600', // Making it special/purple as requested
      icon: <Heart className="w-5 h-5 fill-current" aria-hidden="true" />,
    },
  };

  const currentConfig = config[status];

  return (
    <div className="flex items-center w-full max-w-sm p-4 text-textPrimary bg-bgSecondary rounded-lg shadow-xl border border-borderAccentLight" role="alert">
      <div className={`inline-flex items-center justify-center shrink-0 w-8 h-8 ${currentConfig.iconColor} ${currentConfig.iconBg} rounded-lg`}>
        {currentConfig.icon}
        <span className="sr-only">{status} icon</span>
      </div>

      <div className="ms-3 text-sm font-normal break-normal">{text}</div>

      <button
        type="button"
        onClick={onClose}
        className="ms-auto -mx-1.5 -my-1.5 bg-bgSecondary text-textSecondary hover:text-textPrimary rounded-lg focus:ring-2 focus:ring-borderAccent p-1.5 hover:bg-bgAccentPrimary inline-flex items-center justify-center h-8 w-8 transition-colors cursor-pointer"
        aria-label="Close"
      >
        <span className="sr-only">Close</span>
        <X className="w-3 h-3" aria-hidden="true" />
      </button>
    </div>
  );
};

export default Toast;
