import { useState, useEffect, useRef } from 'react';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';
import { Button } from './button';
import { Slider } from './slider';
import { Card } from './card';

interface AudioPlayerProps {
  audioUrl: string;
  autoPlay?: boolean;
  className?: string;
}

export function AudioPlayer({ audioUrl, autoPlay = false, className = '' }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Construire l'URL complète de l'audio
  const fullAudioUrl = audioUrl.startsWith('http') 
    ? audioUrl 
    : `/${audioUrl}`;

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    // Charger les métadonnées
    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
    };

    // Mettre à jour le temps de lecture
    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    // Gérer la fin de la lecture
    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);

    // Auto-play si demandé
    if (autoPlay) {
      audio.play()
        .then(() => setIsPlaying(true))
        .catch(err => console.error('Erreur autoplay:', err));
    }

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [audioUrl, autoPlay]);

  // Gérer le volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play()
        .then(() => setIsPlaying(true))
        .catch(err => console.error('Erreur lecture:', err));
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const handleVolumeChange = (value: number[]) => {
    setVolume(value[0]);
    if (value[0] > 0 && isMuted) {
      setIsMuted(false);
    }
  };

  const formatTime = (time: number): string => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <Card className={`p-4 bg-blue-50 border-blue-200 ${className}`}>
      <audio ref={audioRef} src={fullAudioUrl} preload="metadata" />
      
      <div className="flex items-center gap-4">
        {/* Bouton Play/Pause */}
        <Button
          onClick={togglePlay}
          variant="outline"
          size="icon"
          className="h-10 w-10 rounded-full"
        >
          {isPlaying ? (
            <Pause className="h-5 w-5" />
          ) : (
            <Play className="h-5 w-5 ml-0.5" />
          )}
        </Button>

        {/* Temps */}
        <div className="flex items-center gap-2 text-sm text-gray-600 min-w-[80px]">
          <span>{formatTime(currentTime)}</span>
          <span>/</span>
          <span>{formatTime(duration)}</span>
        </div>

        {/* Contrôles de volume */}
        <div className="flex items-center gap-2 ml-auto">
          <Button
            onClick={toggleMute}
            variant="ghost"
            size="icon"
            className="h-8 w-8"
          >
            {isMuted || volume === 0 ? (
              <VolumeX className="h-4 w-4" />
            ) : (
              <Volume2 className="h-4 w-4" />
            )}
          </Button>
          
          <Slider
            value={[isMuted ? 0 : volume]}
            onValueChange={handleVolumeChange}
            max={1}
            step={0.1}
            className="w-24"
          />
        </div>
      </div>
    </Card>
  );
}
