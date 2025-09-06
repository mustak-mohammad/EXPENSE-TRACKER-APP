import { useState, useRef, useEffect } from "react";
import { AudioTrack } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Shuffle, 
  Repeat, 
  Volume2,
  VolumeX,
  Heart,
  List,
  Music
} from "lucide-react";

interface PlayerControlsProps {
  currentTrack: AudioTrack | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  progress: number;
  isLoading: boolean;
  onTogglePlayPause: () => void;
  onSeek: (progress: number) => void;
  onVolumeChange: (volume: number) => void;
  onPrevious: () => void;
  onNext: () => void;
}

function formatTime(seconds: number): string {
  if (!seconds || !isFinite(seconds)) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function PlayerControls({
  currentTrack,
  isPlaying,
  currentTime,
  duration,
  volume,
  progress,
  isLoading,
  onTogglePlayPause,
  onSeek,
  onVolumeChange,
  onPrevious,
  onNext,
}: PlayerControlsProps) {
  const [isShuffle, setIsShuffle] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [previousVolume, setPreviousVolume] = useState(volume);

  const handleVolumeToggle = () => {
    if (isMuted) {
      setIsMuted(false);
      onVolumeChange(previousVolume);
    } else {
      setPreviousVolume(volume);
      setIsMuted(true);
      onVolumeChange(0);
    }
  };

  const handleVolumeChange = (newVolume: number[]) => {
    const vol = newVolume[0];
    onVolumeChange(vol);
    setIsMuted(vol === 0);
    if (vol > 0) {
      setPreviousVolume(vol);
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;
      
      switch (e.code) {
        case 'Space':
          e.preventDefault();
          onTogglePlayPause();
          break;
        case 'ArrowRight':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            onNext();
          }
          break;
        case 'ArrowLeft':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            onPrevious();
          }
          break;
        case 'ArrowUp':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            onVolumeChange(Math.min(100, volume + 10));
          }
          break;
        case 'ArrowDown':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            onVolumeChange(Math.max(0, volume - 10));
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [volume, onTogglePlayPause, onNext, onPrevious, onVolumeChange]);

  if (!currentTrack) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center">
          <Music className="w-24 h-24 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h2 className="text-2xl font-semibold mb-2 text-muted-foreground">No Track Selected</h2>
          <p className="text-muted-foreground">Upload some music to get started</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="w-full max-w-2xl">
        
        {/* Album Art / Track Info */}
        <div className="text-center mb-8">
          <div className="w-64 h-64 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-primary to-accent shadow-2xl flex items-center justify-center glass">
            <div className="text-center">
              <Music className="w-16 h-16 text-white opacity-50 mb-4 mx-auto" />
              <div className="flex items-end justify-center gap-1">
                {[4, 8, 6, 10, 5].map((height, index) => (
                  <div
                    key={index}
                    className="w-2 bg-white opacity-30 rounded-full"
                    style={{ height: `${height * 2}px` }}
                  />
                ))}
              </div>
            </div>
          </div>
          
          <h1 className="text-3xl font-bold mb-2" data-testid="track-title">
            {currentTrack.originalName.replace(/\.[^/.]+$/, "")}
          </h1>
          <p className="text-muted-foreground text-lg">Unknown Artist</p>
          <p className="text-muted-foreground text-sm mt-1">
            {currentTrack.mimeType.toUpperCase().replace('AUDIO/', '')} • 
            {(currentTrack.fileSize / (1024 * 1024)).toFixed(1)} MB
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-2">
            <span className="text-sm font-mono text-muted-foreground min-w-[3rem]" data-testid="current-time">
              {formatTime(currentTime)}
            </span>
            <div className="flex-1 relative">
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className="waveform h-full transition-all duration-300" 
                  style={{ width: `${progress}%` }}
                  data-testid="progress-bar"
                />
              </div>
              <Slider
                value={[progress]}
                onValueChange={(value) => onSeek(value[0])}
                max={100}
                step={0.1}
                className="absolute inset-0 w-full h-2 opacity-0 cursor-pointer"
                data-testid="progress-slider"
              />
            </div>
            <span className="text-sm font-mono text-muted-foreground min-w-[3rem]" data-testid="duration">
              {formatTime(duration)}
            </span>
          </div>
        </div>

        {/* Main Controls */}
        <div className="flex items-center justify-center gap-6 mb-8">
          <Button
            variant="secondary"
            size="lg"
            className={`w-12 h-12 rounded-full transition-all duration-200 hover:scale-105 ${
              isShuffle ? 'bg-primary text-primary-foreground' : ''
            }`}
            onClick={() => setIsShuffle(!isShuffle)}
            data-testid="button-shuffle"
          >
            <Shuffle className="w-5 h-5" />
          </Button>
          
          <Button
            variant="secondary"
            size="lg"
            className="w-14 h-14 rounded-full transition-all duration-200 hover:scale-105"
            onClick={onPrevious}
            data-testid="button-previous"
          >
            <SkipBack className="w-6 h-6" />
          </Button>
          
          <Button
            variant="default"
            size="lg"
            className="w-20 h-20 rounded-full bg-primary hover:bg-primary/90 transition-all duration-200 hover:scale-105 shadow-lg shadow-primary/30"
            onClick={onTogglePlayPause}
            disabled={isLoading}
            data-testid="button-play-pause"
          >
            {isLoading ? (
              <div className="w-6 h-6 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
            ) : isPlaying ? (
              <Pause className="w-7 h-7 text-primary-foreground" />
            ) : (
              <Play className="w-7 h-7 text-primary-foreground ml-1" />
            )}
          </Button>
          
          <Button
            variant="secondary"
            size="lg"
            className="w-14 h-14 rounded-full transition-all duration-200 hover:scale-105"
            onClick={onNext}
            data-testid="button-next"
          >
            <SkipForward className="w-6 h-6" />
          </Button>
          
          <Button
            variant="secondary"
            size="lg"
            className={`w-12 h-12 rounded-full transition-all duration-200 hover:scale-105 ${
              isRepeat ? 'bg-primary text-primary-foreground' : ''
            }`}
            onClick={() => setIsRepeat(!isRepeat)}
            data-testid="button-repeat"
          >
            <Repeat className="w-5 h-5" />
          </Button>
        </div>

        {/* Secondary Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" data-testid="button-queue">
              <List className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="sm" data-testid="button-favorite">
              <Heart className="w-5 h-5" />
            </Button>
          </div>

          {/* Volume Control */}
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleVolumeToggle}
              data-testid="button-volume-toggle"
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="w-5 h-5 text-muted-foreground" />
              ) : (
                <Volume2 className="w-5 h-5 text-muted-foreground" />
              )}
            </Button>
            <div className="w-24">
              <Slider
                value={[isMuted ? 0 : volume]}
                onValueChange={handleVolumeChange}
                max={100}
                step={1}
                className="cursor-pointer"
                data-testid="volume-slider"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
