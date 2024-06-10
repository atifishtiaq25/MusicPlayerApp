import { TestBed } from '@angular/core/testing';

import { TrackLoaderService } from './track-loader.service';

describe('TrackLoaderService', () => {
  let service: TrackLoaderService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TrackLoaderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
