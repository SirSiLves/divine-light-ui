import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { MatrixService } from './matrix.service';
import { MatrixStore } from './matrix.store';

describe('MatrixService', () => {
  let matrixService: MatrixService;
  let matrixStore: MatrixStore;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MatrixService, MatrixStore],
      imports: [ HttpClientTestingModule ]
    });

    matrixService = TestBed.inject(MatrixService);
    matrixStore = TestBed.inject(MatrixStore);
  });

  it('should be created', () => {
    expect(matrixService).toBeDefined();
  });

});
