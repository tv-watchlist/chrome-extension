import { TestBed, inject } from '@angular/core/testing';

import { IndexedDBService } from './indexed-db.service';

describe('IndexedDBService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [IndexedDBService]
    });
  });

  it('should be created', inject([IndexedDBService], (service: IndexedDBService) => {
    expect(service).toBeTruthy();
  }));
});
