import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CkyEditorComponent } from './cky-editor.component';

describe('CkyEditorComponent', () => {
  let component: CkyEditorComponent;
  let fixture: ComponentFixture<CkyEditorComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CkyEditorComponent]
    });
    fixture = TestBed.createComponent(CkyEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
