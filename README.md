# CKY Editor

A professional, dependency-free rich text editor for **Angular 21**. Crisp SVG toolbar, tables you can actually edit, media embeds, find & replace, Word/PDF export — and it plugs straight into `ngModel` and reactive forms.

## Features

| Area | What you get |
|------|--------------|
| **History** | Undo / redo (100 steps) with `Ctrl+Z` / `Ctrl+Y` |
| **Document** | HTML source view, preview mode, import (`.html`, `.txt`, `.doc`), export to Word, export to PDF, print |
| **Tools** | Format painter, change case (UPPER / lower / Title), find & replace with match highlighting, select all, spell-check toggle |
| **Text** | Headings H1–H6, text & block styles, bold, italic, underline, strikethrough, superscript, subscript, font size, font color, highlight, remove format |
| **Paragraph** | Alignment, line height, indent / outdent, block quote, code block |
| **Lists** | Bulleted (disc / circle / square), numbered (1, 01, a, A, i, I), multi-level (1.1, 1.2), to-do checklists |
| **Tables** | Grid picker up to 10×10, insert row above/below, insert column left/right, header row toggle, delete row/column/table, `Tab` to move between cells |
| **Insert** | Links, bookmarks, images (upload, paste or URL), file attachments, YouTube / Vimeo / MP4 media, page break, horizontal line, emoji, special characters, column layouts, ready-made templates |
| **View** | Full-screen mode, live word & character count |

Pasted content from Word or Google Docs is cleaned automatically, and all imported / pasted / source-edited HTML is sanitized (scripts, event handlers and untrusted iframes are stripped).

## Installation

```bash
npm install cky-editor
```

No icon fonts or other runtime dependencies are needed.

## Usage

### Standalone components (recommended)

```typescript
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CkyEditorComponent } from 'cky-editor';

@Component({
  selector: 'app-root',
  imports: [FormsModule, CkyEditorComponent],
  template: `<lib-cky-editor [(ngModel)]="content" />`,
})
export class AppComponent {
  content = '<p>Hello CKY Editor!</p>';
}
```

### NgModule apps

```typescript
import { CkyEditorModule } from 'cky-editor';

@NgModule({
  imports: [BrowserModule, FormsModule, CkyEditorModule],
})
export class AppModule {}
```

### Reactive forms

```html
<form [formGroup]="form">
  <lib-cky-editor formControlName="content" placeholder="Write your job description…" />
</form>
```

`form.get('content').disable()` puts the editor into a read-only state.

## API

### Inputs

| Input | Type | Default | Description |
|-------|------|---------|-------------|
| `placeholder` | `string` | `'Type or paste your content here…'` | Shown while the editor is empty |
| `minHeight` | `number` | `260` | Minimum height of the editing area in px |
| `documentTitle` | `string` | `'document'` | File name / title used for Word export, PDF and print |

### Public methods (via `@ViewChild`)

`undo()`, `redo()`, `exportToWord()`, `exportToPDF()`, `printContent()`, `toggleFullscreen()`, `insertHtml(html)`, `insertText(text)`

### Theming

The editor reads CSS custom properties, so you can match your brand:

```css
lib-cky-editor .cky-editor {
  --cky-accent: #00bfa6;
  --cky-accent-soft: #e0f7f4;
  --cky-border: #ced4da;
  --cky-radius: 8px;
}
```

### Rendering saved content

Tables, to-do lists, layouts and styles use `cky-*` classes. Wrap rendered output in `class="cky-content"` so it looks the same as in the editor:

```html
<article class="cky-content" [innerHTML]="content"></article>
```

## Keyboard shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl/⌘ + Z` | Undo |
| `Ctrl/⌘ + Y`, `Ctrl/⌘ + Shift + Z` | Redo |
| `Ctrl/⌘ + B / I / U` | Bold / italic / underline |
| `Ctrl/⌘ + K` | Insert or edit link |
| `Ctrl/⌘ + F` | Find & replace |
| `Tab` / `Shift + Tab` | Next / previous table cell, or indent / outdent a list |
| `Esc` | Exit full screen |

## Demo

A runnable example lives in [`demo/`](./demo). It consumes the built package exactly like an npm user would:

```bash
npm install && npm run build
cd demo && npm install && npm start
```

Then open `http://localhost:4200`.

## Changelog

### v3.0.0
- Redesigned toolbar with a professional SVG icon set — the Font Awesome dependency is gone
- Tables: add/remove rows and columns, header row toggle, Tab navigation
- New: find & replace, format painter, change case, superscript/subscript, bookmarks, file attachments, media embeds, code blocks, page breaks, emoji, special characters, layouts, templates, line height, bullet/number styles, multi-level and to-do lists, full-screen, preview, import
- Clean paste from Word / Google Docs and HTML sanitization on paste, import and source edits
- Standalone component (still exported through `CkyEditorModule`)
- **Breaking:** removed the empty `CkyEditorService`; Font Awesome is no longer a peer dependency

### v2.0.0
- Undo/redo, export to Word and PDF, print, word counter
- Upgraded to Angular 21

### v1.0.0
- Initial release (Angular 16)

## Support

- Open an issue on [GitHub](https://github.com/developerchandan/cky-editor/issues)
- Email: chandan.ydv498@gmail.com

## License

MIT © Chandan Kumar
