import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Track } from '../interfaces/track';

@Injectable({
  providedIn: 'root'
})

export class TrackLoaderService {
  private apiUrl = 'http://localhost:3000/api/files';

  constructor(private http: HttpClient) { }

  getFilesData(): Observable<Track[]> {
    return this.http.get<Track[]>(this.apiUrl);
  }
}
