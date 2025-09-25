import { TestBed } from '@angular/core/testing';

import { Options } from './options.service';

describe('Options', () => {
  let service: Options;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Options);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
