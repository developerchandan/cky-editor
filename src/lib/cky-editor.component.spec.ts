import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CkyEditorComponent } from './cky-editor.component';

describe('CkyEditorComponent', () => {
  let component: CkyEditorComponent;
  let fixture: ComponentFixture<CkyEditorComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [CkyEditorComponent] });
    fixture = TestBed.createComponent(CkyEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('renders the value written by the form control', () => {
    component.writeValue('<p>Hello</p>');
    const content = fixture.nativeElement.querySelector('.cky-content') as HTMLElement;
    expect(content.innerHTML).toBe('<p>Hello</p>');
  });
});
