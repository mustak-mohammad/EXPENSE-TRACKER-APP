import { useQuery } from "@tanstack/react-query";
import { AudioTrack } from "@shared/schema";
import { useAudioPlayer } from "@/hooks/use-audio-player";
import { FileUpload } from "@/components/file-upload";
import { Playlist } from "@/components/playlist";
import { PlayerControls } from "@/components/player-controls";
import { AudioVisualizer } from "@/components/audio-visualizer";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { useState } from "react";
import { Menu, Music, Settings, ChevronUp } from "lucide-react";

export default function MediaPlayer() {
  const isMobile = useIsMobile();
  const [showSidebar, setShowSidebar] = useState(!isMobile);

  const { data: tracks = [], isLoading } = useQuery<AudioTrack[]>({
    queryKey: ['/api/tracks'],
  });

  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    progress,
    isLoading: audioLoading,
    setCurrentTrack,
    togglePlayPause,
    seek,
    setVolume,
    nextTrack,
    previousTrack,
  } = useAudioPlayer(tracks);

  const handleTrackSelect = (track: AudioTrack) => {
    setCurrentTrack(track);
    if (isMobile) {
      setShowSidebar(false);
    }
  };

  const handleClearPlaylist = () => {
    setCurrentTrack(null);
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      
      {/* Sidebar - Playlist and Upload */}
      <div className={`${
        isMobile 
          ? showSidebar 
            ? 'fixed inset-0 z-50 bg-card' 
            : 'hidden'
          : 'lg:w-80'
      } bg-card border-r border-border p-6 flex flex-col h-screen lg:h-auto`}>
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Music className="w-6 h-6 text-primary" />
              <h1 className="text-2xl font-bold text-primary">Audio Wave</h1>
            </div>
            {isMobile && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSidebar(false)}
                data-testid="button-close-sidebar"
              >
                <ChevronUp className="w-5 h-5" />
              </Button>
            )}
          </div>
          <p className="text-muted-foreground text-sm">Your personal media player</p>
        </div>

        {/* File Upload */}
        <FileUpload onUploadComplete={() => {}} />

        {/* Playlist */}
        <Playlist
          tracks={tracks}
          currentTrack={currentTrack}
          isPlaying={isPlaying}
          onTrackSelect={handleTrackSelect}
          onClearPlaylist={handleClearPlaylist}
        />
      </div>

      {/* Main Player Area */}
      <div className="flex-1 flex flex-col">
        
        {/* Top Bar */}
        <div className="p-6 border-b border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden"
                onClick={() => setShowSidebar(true)}
                data-testid="button-show-sidebar"
              >
                <Menu className="w-5 h-5" />
              </Button>
              <div>
                <h2 className="text-xl font-semibold">Now Playing</h2>
                <p className="text-muted-foreground text-sm">Local Collection</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <AudioVisualizer isPlaying={isPlaying} />
              <Button variant="ghost" size="sm" data-testid="button-settings">
                <Settings className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Player Content */}
        <PlayerControls
          currentTrack={currentTrack}
          isPlaying={isPlaying}
          currentTime={currentTime}
          duration={duration}
          volume={volume}
          progress={progress}
          isLoading={audioLoading}
          onTogglePlayPause={togglePlayPause}
          onSeek={seek}
          onVolumeChange={setVolume}
          onPrevious={previousTrack}
          onNext={nextTrack}
        />
      </div>

      {/* Mobile Player Mini */}
      {isMobile && !showSidebar && currentTrack && (
        <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border p-4 glass">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Music className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate" data-testid="mini-track-title">
                {currentTrack.originalName.replace(/\.[^/.]+$/, "")}
              </p>
              <p className="text-sm text-muted-foreground truncate">Unknown Artist</p>
            </div>
            <Button
              variant="default"
              size="sm"
              className="w-10 h-10 rounded-full bg-primary"
              onClick={togglePlayPause}
              data-testid="mini-play-button"
            >
              {isPlaying ? (
                <div className="w-2 h-2 border border-primary-foreground" />
              ) : (
                <div className="w-0 h-0 border-l-[6px] border-l-primary-foreground border-y-[4px] border-y-transparent ml-0.5" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSidebar(true)}
              data-testid="button-expand-player"
            >
              <ChevronUp className="w-5 h-5" />
            </Button>
          </div>
          
          {/* Mini Progress Bar */}
          <div className="mt-3">
            <div className="h-1 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-1 bg-primary rounded-full transition-all duration-300" 
                style={{ width: `${progress}%` }}
                data-testid="mini-progress-bar"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
