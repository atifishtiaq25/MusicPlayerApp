import { Component } from '@angular/core';
import { MusicPlayerComponent } from './music-player/music-player.component';
import { RouterOutlet } from '@angular/router';

@Component({
  standalone: true,
  imports: [MusicPlayerComponent, RouterOutlet],
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})

export class AppComponent {
  title = 'MusicPlayerApp';

  constructor() {}

}
