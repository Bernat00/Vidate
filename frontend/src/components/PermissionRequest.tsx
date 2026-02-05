import { useState } from 'react';
import { Camera, MapPin, Check, AlertCircle } from 'lucide-react';
import { useToast } from '../context/toastContext';
import PrimaryButton from './form/PrimaryButton';

interface PermissionRequestProps {
  onGrantMedia: () => Promise<boolean>;
  onGrantLocation: () => Promise<boolean>;
  onContinue: () => void;
  hasMedia: boolean;
  hasLocation: boolean;
}

export default function PermissionRequest({
  onGrantMedia,
  onGrantLocation,
  onContinue,
  hasMedia,
  hasLocation
}: PermissionRequestProps) {
  const [isMediaLoading, setIsMediaLoading] = useState(false);
  const [isLocationLoading, setIsLocationLoading] = useState(false);
  const { showToast } = useToast();

  const handleMediaClick = async () => {
    setIsMediaLoading(true);
    try {
      await onGrantMedia();
    } catch {
      showToast("Failed to get camera/microphone permissions", "error");
    } finally {
      setIsMediaLoading(false);
    }
  };

  const handleLocationClick = async () => {
    setIsLocationLoading(true);
    try {
      await onGrantLocation();
      showToast("Location access granted", "success");
    } catch {
       // location is optional, so maybe just toast info
      showToast("Location access denied. Matching will be random.", "info");
    } finally {
      setIsLocationLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] max-w-md mx-auto p-6 space-y-8 animate-fade-in text-center">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-textPrimary">Permissions Required</h2>
        <p className="text-textSecondary">
          To match you with people nearby, we need access to your camera, microphone, and location.
        </p>
      </div>

      <div className="w-full space-y-4">
        {/* Media Permission */}
        <div className={`p-4 rounded-xl border transition-all ${
          hasMedia 
            ? 'bg-bgSuccessSoft border-textSuccess' 
            : 'bg-bgSecondary border-borderAccentLight'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-full ${hasMedia ? 'bg-textSuccess text-bgPrimary' : 'bg-bgAccentPrimary text-textAccent'}`}>
                <Camera size={20} />
              </div>
              <span className={`font-semibold ${hasMedia ? 'text-textSuccess' : 'text-textPrimary'}`}>
                Camera & Microphone
              </span>
            </div>
            {hasMedia && <Check className="text-textSuccess" size={20} />}
          </div>

          {!hasMedia && (
            <PrimaryButton
              onClick={handleMediaClick}
              disabled={isMediaLoading}
              className="mt-2 flex items-center justify-center gap-2"
            >
              {isMediaLoading ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                "Enable Access"
              )}
            </PrimaryButton>
          )}
        </div>

        {/* Location Permission */}
        <div className={`p-4 rounded-xl border transition-all ${
           hasLocation
             ? 'bg-bgSuccessSoft border-textSuccess' 
             : 'bg-bgSecondary border-borderAccentLight'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-full ${hasLocation ? 'bg-textSuccess text-bgPrimary' : 'bg-bgSecondary text-textSecondary'}`}>
                <MapPin size={20} />
              </div>
              <span className={`font-semibold ${hasLocation ? 'text-textSuccess' : 'text-textPrimary'}`}>
                Location (Optional)
              </span>
            </div>
            {hasLocation && <Check className="text-textSuccess" size={20} />}
          </div>

          {!hasLocation && (
             <PrimaryButton
              onClick={handleLocationClick}
              disabled={isLocationLoading || !hasMedia}
              className={`mt-2 flex items-center justify-center gap-2 ${
                  hasMedia 
                  ? '!bg-bgSecondary hover:!bg-bgAccentPrimary text-textPrimary border border-borderAccent' 
                  : '!bg-transparent border border-transparent text-textSecondary cursor-not-allowed shadow-none'
              }`}
            >
              {isLocationLoading ? (
                <span className="w-5 h-5 border-2 border-textSecondary border-t-textPrimary rounded-full animate-spin" />
              ) : (
                "Enable Location"
              )}
            </PrimaryButton>
          )}
        </div>
      </div>

      {hasMedia && (
        <PrimaryButton
          onClick={onContinue}
          className="!bg-textAccent hover:!bg-opacity-90 text-white text-lg font-bold !rounded-full shadow-lg hover:shadow-xl hover:scale-105"
        >
          Continue
        </PrimaryButton>
      )}

      {!hasMedia && (
          <p className="text-sm text-textSecondary flex items-center gap-2 justify-center">
              <AlertCircle size={16} />
              Camera and mic access is required to use Vidate.
          </p>
      )}
    </div>
  );
}
