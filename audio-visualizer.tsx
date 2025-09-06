export function AudioVisualizer({ isPlaying }: { isPlaying: boolean }) {
  return (
    <div className="hidden md:flex items-end gap-1 h-8">
      {[8, 12, 6, 10, 4].map((height, index) => (
        <div
          key={index}
          className={`w-1 rounded-full transition-all duration-300 ${
            isPlaying
              ? index % 2 === 0
                ? 'bg-primary visualizer-bar'
                : 'bg-accent visualizer-bar'
              : 'bg-muted'
          }`}
          style={{ height: isPlaying ? `${height}px` : '4px' }}
          data-testid={`visualizer-bar-${index}`}
        />
      ))}
    </div>
  );
}
