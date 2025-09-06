import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AudioTrack } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Music, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PlaylistProps {
  tracks: AudioTrack[];
  currentTrack: AudioTrack | null;
  isPlaying: boolean;
  onTrackSelect: (track: AudioTrack) => void;
  onClearPlaylist: () => void;
}

function formatDuration(seconds: number | null): string {
  if (!seconds) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function formatFileSize(bytes: number): string {
  const mb = bytes / (1024 * 1024);
  return `${mb.toFixed(1)} MB`;
}

export function Playlist({ 
  tracks, 
  currentTrack, 
  isPlaying, 
  onTrackSelect, 
  onClearPlaylist 
}: PlaylistProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const deleteMutation = useMutation({
    mutationFn: async (trackId: string) => {
      await apiRequest('DELETE', `/api/tracks/${trackId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tracks'] });
      toast({
        title: "Track Deleted",
        description: "The track has been removed from your playlist.",
      });
    },
    onError: () => {
      toast({
        title: "Delete Failed",
        description: "Failed to delete the track.",
        variant: "destructive",
      });
    },
  });

  const handleDeleteTrack = (e: React.MouseEvent, trackId: string) => {
    e.stopPropagation();
    deleteMutation.mutate(trackId);
  };

  return (
    <div className="flex-1 overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Playlist</h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearPlaylist}
          className="text-muted-foreground hover:text-foreground"
          data-testid="button-clear-playlist"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
      
      <div className="space-y-2 overflow-y-auto max-h-96" data-testid="playlist-container">
        {tracks.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Music className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No tracks in your playlist</p>
            <p className="text-sm">Upload some music to get started</p>
          </div>
        ) : (
          tracks.map((track) => {
            const isCurrentTrack = currentTrack?.id === track.id;
            return (
              <div
                key={track.id}
                className={`flex items-center gap-3 p-3 rounded-lg hover:bg-secondary cursor-pointer transition-colors border-l-2 ${
                  isCurrentTrack
                    ? 'border-primary bg-secondary/50'
                    : 'border-transparent hover:border-primary'
                }`}
                onClick={() => onTrackSelect(track)}
                data-testid={`track-item-${track.id}`}
              >
                <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
                  <Music className="w-6 h-6 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate" title={track.originalName}>
                    {track.originalName}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {formatDuration(track.duration)} • {formatFileSize(track.fileSize)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {isCurrentTrack && isPlaying && (
                    <span 
                      className="w-2 h-2 bg-primary rounded-full animate-pulse-soft"
                      data-testid="playing-indicator"
                    />
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => handleDeleteTrack(e, track.id)}
                    className="text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                    data-testid={`button-delete-${track.id}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
