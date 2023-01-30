import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { GameManagerService } from './game-manager.service';
import { GameManagerStore } from './game-manager.store';

describe('GameManagerService', () => {
  let gameManagerService: GameManagerService;
  let gameManagerStore: GameManagerStore;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [GameManagerService, GameManagerStore],
      imports: [ HttpClientTestingModule ]
    });

    gameManagerService = TestBed.inject(GameManagerService);
    gameManagerStore = TestBed.inject(GameManagerStore);
  });

  it('should be created', () => {
    expect(gameManagerService).toBeDefined();
  });

});
