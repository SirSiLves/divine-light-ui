import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ActionService } from './action.service';
import { ActionStore } from './action.store';

describe('ActionService', () => {
  let actionService: ActionService;
  let actionStore: ActionStore;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ActionService, ActionStore],
      imports: [ HttpClientTestingModule ]
    });

    actionService = TestBed.inject(ActionService);
    actionStore = TestBed.inject(ActionStore);
  });

  it('should be created', () => {
    expect(actionService).toBeDefined();
  });

});
