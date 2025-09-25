import { TestBed } from '@angular/core/testing';

import { Exports } from './exports.service';

describe('Exports', () => {
  let service: Exports;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Exports);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
