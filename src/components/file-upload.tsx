import { useCallback, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Upload, Music } from "lucide-react";

interface FileUploadProps {
  onUploadComplete?: () => void;
}

export function FileUpload({ onUploadComplete }: FileUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('audio', file);
      
      const response = await apiRequest('POST', '/api/tracks/upload', formData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tracks'] });
      toast({
        title: "Upload Successful",
        description: "Your audio file has been added to the playlist.",
      });
      onUploadComplete?.();
    },
    onError: (error: Error) => {
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload audio file.",
        variant: "destructive",
      });
    },
  });

  const handleFileUpload = useCallback((files: FileList | null) => {
    if (!files || files.length === 0) return;

    Array.from(files).forEach(file => {
      const allowedTypes = ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp3'];
      
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Unsupported Format",
          description: "Please upload MP3, WAV, or OGG files.",
          variant: "destructive",
        });
        return;
      }

      if (file.size > 50 * 1024 * 1024) { // 50MB
        toast({
          title: "File Too Large",
          description: "Please upload files smaller than 50MB.",
          variant: "destructive",
        });
        return;
      }

      uploadMutation.mutate(file);
    });
  }, [uploadMutation, toast]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFileUpload(e.dataTransfer.files);
  }, [handleFileUpload]);

  return (
    <div className="mb-8">
      <h2 className="text-lg font-semibold mb-4">Add Music</h2>
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer glass ${
          isDragOver
            ? 'border-primary bg-primary/10'
            : 'border-border hover:border-primary'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => document.getElementById('file-input')?.click()}
        data-testid="file-upload-area"
      >
        <Upload className="w-8 h-8 text-muted-foreground mb-3 mx-auto" />
        <p className="text-foreground font-medium mb-1">
          {uploadMutation.isPending
            ? "Uploading..."
            : "Drop files here or click to browse"}
        </p>
        <p className="text-muted-foreground text-sm">MP3, WAV, OGG supported</p>
        <input
          id="file-input"
          type="file"
          className="hidden"
          multiple
          accept=".mp3,.wav,.ogg,audio/mpeg,audio/wav,audio/ogg"
          onChange={(e) => handleFileUpload(e.target.files)}
          data-testid="file-input"
        />
      </div>
    </div>
  );
}
