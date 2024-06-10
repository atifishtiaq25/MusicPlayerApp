import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { PlaybackState } from '../interfaces/playback-state';

@Injectable({
  providedIn: 'root'
})

export class AudioHandlerService {
  private stop$ = new Subject<void>();
  private audioObj:HTMLAudioElement = new Audio();
  audioEvents = [
    'error', 'play', 'playing', 'pause', 'canplay', 'loadedmetadata', 'timeupdate'
  ];
  private state: PlaybackState = {
    playing: false,
    paused:false,
    currentTime: undefined,
    duration: undefined,
    progress: undefined,
    canplay: false,
    error: false,
  };

  private streamObservable(url: string) {
    return new Observable(observer => {
      this.audioObj.src = url;
      this.audioObj.load();
      this.audioObj.play();
  
      const handler = (event: Event) => {
        this.updateStateEvents(event);
        observer.next(event);
      };
  
      this.addEvents(this.audioObj, this.audioEvents, handler);
      return () => {
        this.audioObj.pause();
        this.audioObj.currentTime = 0;
        this.removeEvents(this.audioObj, this.audioEvents, handler);
        this.resetState();
      };
    });
  }

  private addEvents(obj:any, events: string[], handler:any) {
    events.forEach(event => {
      obj.addEventListener(event, handler);
    });
  }

  private removeEvents(obj:any, events: string[], handler:any) {
    events.forEach(event => {
      obj.removeEventListener(event, handler);
    });
  }

  playStream(fileName: string) {
    let audioUrl = `http://localhost:3000/api/files/${encodeURIComponent(fileName)}`;

    return this.streamObservable(audioUrl).pipe(takeUntil(this.stop$));
  }

  play() {
    this.audioObj.play();
  }

  pause() {
    this.audioObj.pause();
  }

  stop() {
    this.stop$.next();
  }

  private stateChange: BehaviorSubject<PlaybackState> = new BehaviorSubject(this.state);

  private updateStateEvents(event: Event): void {
    switch (event.type) {
      case 'canplay':
        this.state.canplay = true;
        break;
      case 'playing':
        this.state.playing = true;
        this.state.paused = false;

        break;
      case 'pause':
        this.state.playing = false;
        this.state.paused = true;
        break;
      case 'loadedmetadata':
        this.state.duration = this.audioObj.duration;
        break;
      case 'timeupdate':
        this.state.currentTime = this.audioObj.currentTime;
        if (this.state.duration !== undefined) {
          this.state.progress = (100 * this.audioObj.currentTime)/this.state.duration;
        }
        break;
      case 'error':
        this.resetState();
        this.state.error = true;
        break;
    }
    this.emitStateChange();
  }

  private resetState() {
    this.state = {
      playing: false,
      paused: false,
      currentTime: undefined,
      duration: undefined,
      progress: undefined,
      canplay: false,
      error: false
    };
    this.emitStateChange();
  }

  private emitStateChange(): void {
    this.stateChange.next({...this.state});
  }

  getState(): Observable<PlaybackState> {
    return this.stateChange.asObservable();
  }
}