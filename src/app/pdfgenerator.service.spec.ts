import { TestBed } from '@angular/core/testing';

import { PDFgeneratorService } from './pdfgenerator.service';

describe('PDFgeneratorService', () => {
  let service: PDFgeneratorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PDFgeneratorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
