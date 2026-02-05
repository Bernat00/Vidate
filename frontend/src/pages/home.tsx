import { useState, useEffect, useRef, useCallback } from 'react';
import { useWebSocket } from '../context/webSocketContext';
import api from '../api';
import { Video, MapPin, ThumbsUp, ThumbsDown, PhoneOff } from 'lucide-react';
import { useToast } from '../context/toastContext';
import PermissionRequest from '../components/PermissionRequest';

type ViewState = 'PERMISSIONS' | 'TESTING' | 'WAITING' | 'CONNECTING' | 'IN_CALL' | 'FEEDBACK';

type PeerProfile = {
  peer_id: string;
  peer_name: string;
  peer_age: number;
  distance_km?: number;
  initiator: boolean;
  conversation_id: number;
};

export default function Home() {
  const { send, subscribe } = useWebSocket();
  const { showToast } = useToast();

  const [viewState, setViewState] = useState<ViewState>('PERMISSIONS');
  const viewStateRef = useRef<ViewState>('PERMISSIONS');
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [peerProfile, setPeerProfile] = useState<PeerProfile | null>(null);
  const peerProfileRef = useRef<PeerProfile | null>(null);
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [useLocation, setUseLocation] = useState(true);
  const [timeLeft, setTimeLeft] = useState<number>(120); // 2 minutes
  const [micLevel, setMicLevel] = useState(0);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Audio Analysis Setup
  useEffect(() => {
    if (!localStream) return;

    const setupAudio = () => {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        audioContextRef.current = audioContext;
        const analyser = audioContext.createAnalyser();
        analyserRef.current = analyser;
        const microphone = audioContext.createMediaStreamSource(localStream);
        microphone.connect(analyser);
        analyser.fftSize = 256;

        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        const updateMicLevel = () => {
          analyser.getByteFrequencyData(dataArray);
          let sum = 0;
          for (let i = 0; i < bufferLength; i++) {
            sum += dataArray[i];
          }
          setMicLevel(sum / bufferLength);
          animationFrameRef.current = requestAnimationFrame(updateMicLevel);
        };
        updateMicLevel();
    }

    setupAudio();

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (audioContextRef.current) {
          audioContextRef.current.close().catch(e => console.error("Error closing audio context", e));
      }
    };
  }, [localStream]);

  const grantMedia = useCallback(async (): Promise<boolean> => {
       try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1920, max: 1920 },
            height: { ideal: 1080, max: 1080 },
            frameRate: { ideal: 30, max: 30 }
          },
          audio: true
        });
        setLocalStream(stream);
        return true;
      } catch (err) {
        console.error("Media permission error", err);
        throw err;
      }
  }, []);

  const grantLocation = useCallback(async (): Promise<boolean> => {
      return new Promise((resolve, reject) => {
           navigator.geolocation.getCurrentPosition(
              (pos) => {
                setCoords({ lat: pos.coords.latitude, lon: pos.coords.longitude });
                resolve(true);
              },
              (err) => {
                console.error("GPS error", err);
                // We don't block on error, but we reject the promise so UI knows it failed (optional)
                reject(err);
              }
            );
      });
  }, []);

  // Automatically check for existing location permission
  useEffect(() => {
      if (navigator.permissions && navigator.permissions.query) {
          navigator.permissions.query({ name: 'geolocation' as any }).then((result) => {
              if (result.state === 'granted') {
                  grantLocation();
              }
              // Optional: Listen for changes
              result.onchange = () => {
                  if (result.state === 'granted') {
                      grantLocation();
                  }
              };
          });
      }
  }, [grantLocation]);

      // Update local video element when stream changes
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream, viewState]);

  // Update remote video element when stream changes
  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream, viewState]);

  // Clean up PeerConnection on unmount
  useEffect(() => {
    return () => {
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
      }
    };
  }, []);

  // Call Timer
  useEffect(() => {
    let interval: number;
    if (viewState === 'IN_CALL') {
        setTimeLeft(120);
        interval = window.setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    endCall();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    }
    return () => clearInterval(interval);
  }, [viewState]);


  const startSearching = () => {
    // Fallback coords if location not granted or disabled
    const finalCoords = (useLocation && coords) ? coords : { lat: null, lon: null };

    setViewState('WAITING');
    viewStateRef.current = 'WAITING';
    peerProfileRef.current = null;
    send({
      type: 'joined_feed',
      payload: { lat: finalCoords.lat, lon: finalCoords.lon }
    });
  };

  const endCall = () => {
    const currentState = viewStateRef.current;
    if (currentState !== 'IN_CALL' && currentState !== 'CONNECTING') return;

    if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
        peerConnectionRef.current = null;
    }
    setViewState('FEEDBACK');
    viewStateRef.current = 'FEEDBACK';
    send({ type: 'end_call', payload: { peer_id: peerProfileRef.current?.peer_id } });
  };

  const handleFeedback = async (liked: boolean) => {
      if (!peerProfile) return;
      try {
          await api.post('/matches/feedback', {
              partner_id: peerProfile.peer_id,
              liked
          });
          // After feedback, return to matchmaking
          setPeerProfile(null);
          startSearching();
      } catch (e) {
          console.error(e);
          showToast("Failed to submit feedback", "error");
      }
  };

  const createPeerConnection = useCallback((profile: PeerProfile) => {
    const pc = new RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
    });

    pc.onicecandidate = (event) => {
        if (event.candidate) {
            send({
                type: 'ice_candidate',
                payload: {
                    peer_id: profile.peer_id,
                    candidate: event.candidate
                }
            });
        }
    };

    pc.ontrack = (event) => {
        console.log("Track received", event.streams[0]);
        setRemoteStream(event.streams[0]);
        if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = event.streams[0];
        }
    };

    if (localStream) {
        localStream.getTracks().forEach(track => {
            pc.addTrack(track, localStream);
        });
    }

    // Safety timeout ensuring state change
    pc.onconnectionstatechange = () => {
        console.log("Connection State Change:", pc.connectionState);
        if (pc.connectionState === 'connected') {
             setViewState('IN_CALL');
             viewStateRef.current = 'IN_CALL';
        } else if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
             if (viewStateRef.current === 'IN_CALL') endCall();
        }
    };

    peerConnectionRef.current = pc;
    return pc;
  }, [localStream, send]); // Removed viewState dependency


  // Subscribe to WS events
  useEffect(() => {
      const unsubMatch = subscribe('match_found', async (payload: any) => {
          console.log("Match Found:", payload);
          setPeerProfile(payload);
          peerProfileRef.current = payload;
          setViewState('CONNECTING');
          viewStateRef.current = 'CONNECTING';

          const pc = createPeerConnection(payload);

          if (payload.initiator) {
              try {
                  const offer = await pc.createOffer();
                  await pc.setLocalDescription(offer);
                  send({
                      type: 'offer',
                      payload: {
                          peer_id: payload.peer_id,
                          sdp: offer
                      }
                  });
              } catch (e) {
                  console.error("Offer error", e);
              }
          }
      });

      const unsubOffer = subscribe('offer', async (payload: any) => {
          if (!peerConnectionRef.current) return;
          console.log("Offer received");
          const pc = peerConnectionRef.current;
          try {
              await pc.setRemoteDescription(new RTCSessionDescription(payload.sdp));
              const answer = await pc.createAnswer();
              await pc.setLocalDescription(answer);

              const currentPeerId = peerProfileRef.current?.peer_id;
              if (!currentPeerId) {
                  console.error("Cannot send answer: Peer ID unknown");
                  return;
              }

              send({
                   type: 'answer',
                   payload: {
                       peer_id: currentPeerId,
                       sdp: answer
                   }
              });
          } catch (e) { console.error("Answer error", e); }
      });

      const unsubAnswer = subscribe('answer', async (payload: any) => {
          if (!peerConnectionRef.current) return;
          console.log("Answer received");
          try {
              await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(payload.sdp));
          } catch(e) { console.error("Set Remote Desc Error", e); }
      });

      const unsubIce = subscribe('ice_candidate', async (payload: any) => {
           if (!peerConnectionRef.current) return;
           console.log("ICE candidate received");
           try {
               await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(payload.candidate));
           } catch (e) { console.error("ICE Error", e); }
      });

      const unsubEnd = subscribe('end_call', () => {
          endCall();
      });

      return () => {
          unsubMatch();
          unsubOffer();
          unsubAnswer();
          unsubIce();
          unsubEnd();
      };
  }, [subscribe, createPeerConnection, send]); // Removed peerProfile dependency


  // Render Helpers
  const renderDistance = () => {
      if (!peerProfile?.distance_km) return "Unknown distance";
      return `${peerProfile.distance_km.toFixed(1)} km away`;
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] p-4 max-w-lg mx-auto w-full">

      {/* State: PERMISSIONS (Setup) */}
      {(viewState === 'PERMISSIONS' || viewState === 'TESTING') && (
        <PermissionRequest
            onGrantMedia={grantMedia}
            onGrantLocation={grantLocation}
            onStartMatching={startSearching}
            hasMedia={!!localStream}
            hasLocation={!!coords}
            videoRef={localVideoRef}
            micLevel={micLevel}
            useLocation={useLocation}
            onToggleLocation={setUseLocation}
        />
      )}

      {/* State: WAITING */}
      {viewState === 'WAITING' && (
        <div className="text-center flex flex-col items-center gap-4 animate-pulse">
           <div className="w-24 h-24 rounded-full bg-bgAccentSecondary flex items-center justify-center">
               <Video className="w-10 h-10 text-white" />
           </div>
           <p className="text-textPrimary text-xl font-semibold">Looking for someone...</p>
           <button onClick={() => {
               send({ type: 'left_feed', payload: {} });
               setViewState('TESTING');
               viewStateRef.current = 'TESTING';
           }} className="text-textSecondary text-sm underline hover:cursor-pointer">Cancel</button>
        </div>
      )}

      {/* State: CONNECTING */}
      {viewState === 'CONNECTING' && (
         <div className="flex flex-col items-center justify-center h-full w-full">
             <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-textAccent mb-4"></div>
             <h2 className="text-2xl font-bold text-textPrimary">{peerProfile?.peer_name}, {peerProfile?.peer_age}</h2>
             <p className="text-textSecondary flex items-center gap-1">
                 <MapPin size={16} />
                 {renderDistance()}
             </p>
         </div>
      )}

      {/* State: IN_CALL */}
      {viewState === 'IN_CALL' && (
          <div className="relative w-full aspect-[9/16] bg-black rounded-lg overflow-hidden shadow-2xl border border-borderAccentLight">
              {/* Remote Video */}
              <video
                  ref={remoteVideoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                  onLoadedMetadata={(e) => e.currentTarget.play()}
              />

              {/* Local Video Overlay */}
              <div className="absolute top-4 right-4 w-24 h-32 bg-black rounded-lg overflow-hidden border border-white/20 shadow-lg">
                  <video ref={localVideoRef} autoPlay muted playsInline className="w-full h-full object-cover transform scale-x-[-1]" />
              </div>

              {/* Controls Overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent flex flex-col gap-2">
                  <div className="flex justify-between items-end">
                      <div className="text-white">
                          <h3 className="font-bold text-lg drop-shadow-md">{peerProfile?.peer_name}, {peerProfile?.peer_age}</h3>
                          <p className="text-sm opacity-90 drop-shadow-md">{renderDistance()}</p>
                      </div>
                      <div className="text-white font-mono text-xl bg-black/40 px-2 rounded">
                          {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                      </div>
                  </div>

                  <div className="flex justify-center mt-2">
                      <button
                        onClick={endCall}
                        className="bg-red-500 hover:bg-red-600 text-white p-4 rounded-full shadow-lg transition-transform hover:scale-105"
                      >
                          <PhoneOff size={24} />
                      </button>
                  </div>
              </div>
          </div>
      )}

      {/* State: FEEDBACK */}
      {viewState === 'FEEDBACK' && (
          <div className="flex flex-col items-center gap-6 text-center animate-fade-in">
              <h2 className="text-2xl font-bold text-textPrimary">How was your chat with {peerProfile?.peer_name}?</h2>
               <div className="flex gap-8">
                   <button
                       onClick={() => handleFeedback(false)}
                       className="flex flex-col items-center gap-2 group hover:cursor-pointer"
                   >
                       <div className="w-16 h-16 rounded-full bg-bgSecondary flex items-center justify-center border border-borderAccent group-hover:bg-red-500/20 transition-colors">
                           <ThumbsDown className="text-textSecondary group-hover:text-red-500" size={32} />
                       </div>
                       <span className="text-sm text-textSecondary">Pass</span>
                   </button>

                   <button
                       onClick={() => handleFeedback(true)}
                       className="flex flex-col items-center gap-2 group hover:cursor-pointer"
                       >
                           <div className="w-16 h-16 rounded-full bg-bgSecondary flex items-center justify-center border border-borderAccent group-hover:bg-green-500/20 transition-colors">
                               <ThumbsUp className="text-textSecondary group-hover:text-green-500" size={32} />
                           </div>
                           <span className="text-sm text-textSecondary">Like</span>
                       </button>
                   </div>
              </div>
          )}
        </div>
      );
    }
