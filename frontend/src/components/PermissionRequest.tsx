import { useState } from 'react';
import { Camera, MapPin, AlertCircle } from 'lucide-react';
import { useToast } from '../context/toastContext';
import PrimaryButton from './form/PrimaryButton';
import Toggle from './common/Toggle';

interface PermissionRequestProps {
  onGrantMedia: () => Promise<boolean>;
  onGrantLocation: () => Promise<boolean>;
  onStartMatching: () => void;
  hasMedia: boolean;
  hasLocation: boolean;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  micLevel: number;
  useLocation: boolean;
  onToggleLocation: (enabled: boolean) => void;
}

export default function PermissionRequest({
  onGrantMedia,
  onGrantLocation,
  onStartMatching,
  hasMedia,
  hasLocation,
  videoRef,
  micLevel,
  useLocation,
  onToggleLocation
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
    <div className="flex flex-col items-center justify-center min-h-[50vh] max-w-md mx-auto p-4 space-y-6 animate-fade-in text-center w-full">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-textPrimary">
            {hasMedia ? "You're All Set!" : "Permissions Required"}
        </h2>
        <p className="text-textSecondary">
          {hasMedia
            ? "Check your camera and microphone below before starting."
            : "To match you with people nearby, we need access to your camera, microphone, and location."}
        </p>
      </div>

      {hasMedia && (
          <div className="w-48 mx-auto relative aspect-[9/16] bg-black rounded-xl overflow-hidden border border-borderAccentLight shadow-lg">
              <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover mirror-mode transform scale-x-[-1]" />
              <div className="absolute bottom-3 left-3 right-3 text-left">
                  <div className="text-white text-xs mb-1 font-medium drop-shadow-md">Microphone Check</div>
                  <div className="w-full bg-white/20 h-2 rounded-full overflow-hidden backdrop-blur-sm">
                      <div className="h-full transition-all duration-100" style={{ width: `${Math.min(micLevel * 2, 100)}%`, backgroundColor: 'var(--color-textAccent)' }}></div>
                  </div>
              </div>
          </div>
      )}

      <div className="w-full space-y-3">
        {/* Media Permission */}
        {!hasMedia && (
            <div className={`p-4 rounded-xl border transition-all bg-bgSecondary border-borderAccentLight`}>
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-bgAccentPrimary text-textAccent">
                    <Camera size={20} />
                </div>
                <span className="font-semibold text-textPrimary">
                    Camera & Microphone
                </span>
                </div>
            </div>

            <PrimaryButton
                onClick={handleMediaClick}
                disabled={isMediaLoading}
                className="flex items-center justify-center gap-2"
            >
                {isMediaLoading ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                "Enable Access"
                )}
            </PrimaryButton>
            </div>
        )}

        {/* Location Permission */}
        {!hasLocation ? (
            <div className={`p-4 rounded-xl border transition-all ${
                hasMedia ? 'bg-bgSecondary border-borderAccentLight' : 'opacity-50'
             }`}>
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-bgSecondary text-textSecondary">
                    <MapPin size={20} />
                </div>
                <span className="font-semibold text-textPrimary">
                    Location (Optional)
                </span>
                </div>
            </div>

             <PrimaryButton
                onClick={handleLocationClick}
                disabled={isLocationLoading || !hasMedia}
                className={`flex items-center justify-center gap-2 ${
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
            </div>
        ) : (
             <div className="p-4 rounded-xl border transition-all bg-bgSecondary border-borderAccentLight">
                 <div className="flex items-center justify-between">
                     <div className="flex items-center gap-3">
                         <div className={`p-2 rounded-full ${useLocation ? 'bg-textSuccess text-bgPrimary' : 'bg-bgAccentPrimary text-textSecondary'}`}>
                             <MapPin size={20} />
                         </div>
                         <div className="flex flex-col items-start text-left">
                             <span className="font-semibold text-textPrimary">Location Access</span>
                             <span className="text-xs text-textSecondary">Use for matching</span>
                         </div>
                     </div>
                     <Toggle
                        checked={useLocation}
                        onChange={onToggleLocation}
                     />
                 </div>
             </div>
        )}
      </div>



      {hasMedia && (
        <PrimaryButton
          onClick={onStartMatching}
          className="!bg-textAccent hover:!bg-opacity-90 text-white text-lg font-bold !rounded-full shadow-lg hover:shadow-xl hover:scale-105 w-full py-4 mt-4 animate-pulse-gentle"
        >
          Let's Go
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
