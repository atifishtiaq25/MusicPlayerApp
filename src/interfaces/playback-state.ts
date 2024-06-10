export interface PlaybackState {
    playing: boolean;
    paused: boolean;
    currentTime: number | undefined;
    duration: number | undefined;
    progress: number | undefined;
    canplay: boolean;
    error: boolean;
  }