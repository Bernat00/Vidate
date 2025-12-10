import React from 'react';

const Toast = ({ text, status = 'info', onClose }) => {
  // Configuration map for styles and icons based on status
  const config = {
    success: {
      iconColor: 'text-textSuccess',
      iconBg: 'bg-bgSuccessSoft',
      icon: (
        <svg className="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 11.917 9.724 16.5 19 7.5" />
        </svg>
      ),
    },
    error: {
      iconColor: 'text-textError',
      iconBg: 'bg-bgErrorSoft',
      icon: (
        <svg className="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18 17.94 6M18 18 6.06 6" />
        </svg>
      ),
    },
    warning: {
      iconColor: 'text-textWarning',
      iconBg: 'bg-bgWarningSoft',
      icon: (
        <svg className="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 13V8m0 8h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
        </svg>
      ),
    },
    info: {
      iconColor: 'text-textAccent',
      iconBg: 'bg-bgAccentPrimary',
      icon: (
        <svg className="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 11h2v5m-2 0h4m-2.592-8.5h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/>
        </svg>
      ),
    },
  };

  const currentConfig = config[status] || config.info;

  return (
    <div className="flex items-center w-full max-w-sm p-4 mb-4 text-textPrimary bg-bgSecondary rounded-lg shadow-xs border border-borderAccentLight" role="alert">
      {/* Icon Wrapper */}
      <div className={`inline-flex items-center justify-center shrink-0 w-8 h-8 ${currentConfig.iconColor} ${currentConfig.iconBg} rounded-lg`}>
        {currentConfig.icon}
        <span className="sr-only">{status} icon</span>
      </div>

      {/* Message */}
      <div className="ms-3 text-sm font-normal">{text}</div>

      {/* Close Button (Optional usage) */}
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="ms-auto -mx-1.5 -my-1.5 bg-bgSecondary text-textSecondary hover:text-textPrimary rounded-lg focus:ring-2 focus:ring-borderAccent p-1.5 hover:bg-bgAccentPrimary inline-flex items-center justify-center h-8 w-8"
          aria-label="Close"
        >
          <span className="sr-only">Close</span>
          <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
          </svg>
        </button>
      )}
    </div>
  );
};

export default Toast;