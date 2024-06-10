import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { TrackLoaderService } from '../../services/track-loader.service';
import { AudioHandlerService } from '../../services/audio-handler.service';
import { PlaybackState } from '../../interfaces/playback-state';
import { Track } from '../../interfaces/track';
import { Subscription } from 'rxjs';

@Component({
  selector: 'music-player',
  standalone: true,
  imports: [RouterOutlet, CommonModule, MatButtonModule, MatIconModule, MatProgressBarModule],
  templateUrl: './music-player.component.html',
  styleUrl: './music-player.component.scss'
})
export class MusicPlayerComponent {

  state: PlaybackState;
  currentTrack!: {index:number, file:Track};
  files: Track[] = [];

  progress: number = 0;
  private audioSubscription!: Subscription;

  constructor(private trackLoader: TrackLoaderService, private audioHandlerService:  AudioHandlerService) {
    this.state = {
      playing: false,
      paused: false,
      currentTime: undefined,
      duration: undefined,
      progress: undefined,
      canplay: false,
      error: false,
    };

    this.trackLoader.getFilesData().subscribe({
      next: (files: Track[]) => {
        if (files && files.length !== 0) {
          this.files = files;
          this.currentTrack = {"index": 0, "file": this.files[0]};
          this.playStream();
        } else {
          this.files = [];
        }
      },
      error: (err: any) => {
        console.error('Error fetching files:', err);
      }
    });

    this.audioHandlerService.getState().subscribe(state => {
      this.state = state;
    });
  }

  ngOnInit() {
    this.audioSubscription = this.audioHandlerService.getState().subscribe(state => {
      if (state.duration && state.currentTime) {
        this.progress = (state.currentTime / state.duration) * 100;
      }
    });
  }

  ngOnDestroy() {
    if (this.audioSubscription) {
      this.audioSubscription.unsubscribe();
    }
  }

  playStream() {
    this.audioHandlerService.playStream(this.currentTrack.file.name).subscribe();
  }

  pause() {
    this.audioHandlerService.pause();
  }

  play() {
    if(!this.state.playing && !this.state.paused) {
      this.playStream();
    }
    this.audioHandlerService.play();
  }

  stop() {
    this.audioHandlerService.stop();
  }

  next() {
    if (this.currentTrack.index === (this.files.length-1)) {
      this.currentTrack.index = 0;
      this.currentTrack.file = this.files[0];
    } else {
      this.currentTrack.index++;
      this.currentTrack.file = this.files[this.currentTrack.index];
    }
    this.playStream();
  }

  previous() {
    if (this.currentTrack.index === 0) {
      this.currentTrack.index = (this.files.length-1)
    } else {
      this.currentTrack.index--;
    }
    this.currentTrack.file = this.files[this.currentTrack.index];

    this.playStream();
  }
}