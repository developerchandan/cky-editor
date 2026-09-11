import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CkyEditorModule } from './cky-editor/cky-editor.module';

@Component({
  selector: 'app-root',
  imports: [FormsModule, CkyEditorModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('CKY Editor Demo');
  editorContent: string = '<p>Welcome to <strong>CKY Editor v2.0.0</strong>! 🎉</p><p>Try the new features:</p><ul><li>Undo/Redo (Ctrl+Z, Ctrl+Y)</li><li>Export to Word/PDF</li><li>Print functionality</li><li>Word & Character counter</li></ul>';
}
