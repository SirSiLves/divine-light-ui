import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { PlayerService } from './player.service';
import { PlayerStore } from './player.store';

describe('PlayerService', () => {
  let playerService: PlayerService;
  let playerStore: PlayerStore;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [PlayerService, PlayerStore],
      imports: [ HttpClientTestingModule ]
    });

    playerService = TestBed.inject(PlayerService);
    playerStore = TestBed.inject(PlayerStore);
  });

  it('should be created', () => {
    expect(playerService).toBeDefined();
  });

});
