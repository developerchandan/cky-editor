import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CkyEditorComponent } from 'cky-editor';

@Component({
  selector: 'app-root',
  imports: [FormsModule, CkyEditorComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  content =
    '<h2>Welcome to CKY Editor 3</h2>' +
    '<p>A professional rich text editor for <strong>Angular 21</strong>. Try the toolbar above — ' +
    'insert a <em>table</em>, add rows and columns, embed a YouTube video, or press <strong>Ctrl+F</strong> to find &amp; replace.</p>' +
    '<ul class="cky-todo"><li class="cky-checked">Upgrade to Angular 21</li><li>Ship v3 to npm</li></ul>';
}
