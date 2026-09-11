import { TestBed } from '@angular/core/testing';

import { CkyEditorService } from './cky-editor.service';

describe('CkyEditorService', () => {
  let service: CkyEditorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CkyEditorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
