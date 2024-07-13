import { TestBed } from '@angular/core/testing';

import { JobboerseService } from './jobboerse.service';

describe('JobboerseService', () => {
  let service: JobboerseService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(JobboerseService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
