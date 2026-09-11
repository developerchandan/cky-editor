# cky-editor

[![npm version](https://img.shields.io/npm/v/cky-editor.svg)](https://www.npmjs.com/package/cky-editor)
[![npm downloads](https://img.shields.io/npm/dm/cky-editor.svg)](https://www.npmjs.com/package/cky-editor)
[![Angular](https://img.shields.io/badge/Angular-21-dd0031.svg)](https://angular.dev)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE)

A rich text editor for Angular 21 with a full document toolbar, editable tables, media embeds, find and replace, and Word/PDF export. It has no runtime dependencies beyond Angular and works with both template-driven and reactive forms.

## Contents

- [Features](#features)
- [Requirements](#requirements)
- [Installation](#installation)
- [Quick start](#quick-start)
- [API](#api)
- [Theming](#theming)
- [Displaying saved content](#displaying-saved-content)
- [Keyboard shortcuts](#keyboard-shortcuts)
- [Security](#security)
- [Browser support](#browser-support)
- [Development](#development)
- [Changelog](#changelog)
- [License](#license)

## Features

**Document**
- Undo and redo (100 steps)
- HTML source view and read-only preview
- Import from `.html`, `.txt` and HTML-based `.doc` files
- Export to Word (`.doc`) and PDF, and print

**Text formatting**
- Headings H1 to H6, inline and block styles
- Font family, font size, font color and highlight
- Bold, italic, underline, strikethrough, superscript and subscript
- Change case (upper, lower, title), format painter, remove formatting

**Paragraphs and lists**
- Alignment, line height, indent and outdent
- Block quotes and code blocks
- Bulleted lists (disc, circle, square), numbered lists (decimal, alphabetic, roman), multi-level lists and to-do checklists

**Tables**
- Grid picker up to 10 x 10
- Insert rows above or below and columns left or right
- Toggle a header row; delete a row, column or the whole table
- `Tab` / `Shift+Tab` to move between cells

**Insert**
- Links, bookmarks, images (upload, paste or URL) and file attachments
- YouTube, Vimeo and MP4/WebM media
- Page breaks, horizontal lines, emoji and special characters
- Multi-column layouts and ready-made templates

**Editing experience**
- Find and replace with highlighted matches
- Clean paste from Microsoft Word and Google Docs
- Full-screen mode and a live word and character count

## Requirements

| Package | Version |
|---------|---------|
| `@angular/core`, `@angular/common`, `@angular/forms`, `@angular/platform-browser` | `^21.0.0` |

## Installation

```bash
npm install cky-editor
```

## Quick start

### Standalone component

```typescript
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CkyEditorComponent } from 'cky-editor';

@Component({
  selector: 'app-article-form',
  imports: [FormsModule, CkyEditorComponent],
  template: `<lib-cky-editor [(ngModel)]="content" />`,
})
export class ArticleFormComponent {
  content = '<p>Hello, world.</p>';
}
```

### NgModule

```typescript
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CkyEditorModule } from 'cky-editor';

@NgModule({
  imports: [FormsModule, CkyEditorModule],
})
export class ArticlesModule {}
```

### Reactive forms

```typescript
form = new FormGroup({
  description: new FormControl(''),
});
```

```html
<form [formGroup]="form">
  <lib-cky-editor formControlName="description" placeholder="Describe the role" />
</form>
```

Disabling the form control (`form.controls.description.disable()`) makes the editor read-only.

## API

### Selector

`lib-cky-editor`

### Inputs

| Input | Type | Default | Description |
|-------|------|---------|-------------|
| `placeholder` | `string` | `'Type or paste your content here…'` | Text shown while the editor is empty |
| `minHeight` | `number` | `260` | Minimum height of the editing area, in pixels |
| `documentTitle` | `string` | `'document'` | File name and title used by Word export, PDF export and print |

### Value

The editor implements `ControlValueAccessor`. Its value is an HTML string; an empty editor reports `''`.

### Methods

Available through `@ViewChild(CkyEditorComponent)`.

| Method | Description |
|--------|-------------|
| `undo()` / `redo()` | Step backward or forward through the edit history |
| `insertHtml(html: string)` | Insert HTML at the caret |
| `insertText(text: string)` | Insert plain text at the caret |
| `exportToWord()` | Download the content as a `.doc` file |
| `exportToPDF()` | Open the print dialog to save as PDF |
| `printContent()` | Print the content |
| `toggleFullscreen()` | Enter or leave full-screen mode |

## Theming

The editor is styled through CSS custom properties. Override them on the editor element:

```css
lib-cky-editor .cky-editor {
  --cky-accent: #00bfa6;
  --cky-accent-soft: #e0f7f4;
  --cky-border: #ced4da;
  --cky-radius: 8px;
}
```

| Property | Default | Used for |
|----------|---------|----------|
| `--cky-accent` | `#2563eb` | Active buttons, links, focus rings, primary actions |
| `--cky-accent-soft` | `#e8efff` | Active button and selected item backgrounds |
| `--cky-border` | `#ccced1` | Outer border, toolbar and input borders |
| `--cky-border-soft` | `#e4e6e9` | Dividers |
| `--cky-text` | `#1f2328` | Text and icons |
| `--cky-muted` | `#6b7280` | Secondary text |
| `--cky-hover` | `#f0f1f3` | Hover backgrounds |
| `--cky-surface` | `#ffffff` | Editor and menu backgrounds |
| `--cky-toolbar` | `#fafafa` | Toolbar and status bar background |
| `--cky-radius` | `6px` | Corner radius |

## Displaying saved content

Tables, to-do lists, layouts and text styles use `cky-*` classes. Add the `cky-content` class to the element that renders saved HTML so it matches the editor:

```html
<article class="cky-content" [innerHTML]="job.description"></article>
```

The stylesheet is registered when the editor component is loaded. On pages that render content without ever loading the editor, import the component once or copy the `.cky-content` rules into your global styles.

Angular's `[innerHTML]` binding removes inline `style` attributes, so font family, font size, colors, line height and alignment are dropped. To keep them, sanitize the HTML on your server and bind it with `DomSanitizer.bypassSecurityTrustHtml`.

## Keyboard shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl/Cmd + Z` | Undo |
| `Ctrl/Cmd + Y`, `Ctrl/Cmd + Shift + Z` | Redo |
| `Ctrl/Cmd + B`, `I`, `U` | Bold, italic, underline |
| `Ctrl/Cmd + K` | Insert or edit a link |
| `Ctrl/Cmd + F` | Find and replace |
| `Tab`, `Shift + Tab` | Next or previous table cell; indent or outdent a list item |
| `Esc` | Leave full-screen mode |

## Security

HTML that enters the editor through paste, file import or the source view is sanitized: scripts, styles, forms, event handler attributes, `javascript:` URLs and iframes from hosts other than YouTube and Vimeo are removed. Links opened in a new tab get `rel="noopener noreferrer"`.

This protects the editing session only. Always sanitize submitted HTML on the server before storing or displaying it.

## Browser support

The latest two versions of Chrome, Edge, Firefox and Safari. Match highlighting in find and replace uses the CSS Custom Highlight API and falls back to selecting the current match where it is unavailable.

## Development

```bash
git clone https://github.com/developerchandan/cky-editor.git
cd cky-editor
npm install
npm run build          # outputs to dist/cky-editor
```

A demo application in [`demo/`](./demo) consumes the built package the same way an npm user would:

```bash
cd demo
npm install
npm start              # http://localhost:4200
```

Rebuild the library (`npm run build` in the repository root) to see library changes in the demo.

### Contributing

1. Fork the repository and create a branch from `main`.
2. Make your change and confirm `npm run build` succeeds.
3. Verify the change in the demo application.
4. Open a pull request describing the change and how you tested it.

Report bugs and request features through [GitHub Issues](https://github.com/developerchandan/cky-editor/issues).

## Changelog

### 3.0.0

- Redesigned two-row toolbar with an SVG icon set; Font Awesome is no longer required
- Table editing: insert and delete rows and columns, header row toggle, cell navigation with `Tab`
- Added find and replace, format painter, change case, font family, superscript and subscript, bookmarks, file attachments, media embeds, code blocks, page breaks, emoji, special characters, layouts, templates, line height, list styles, multi-level and to-do lists, preview, import and full-screen mode
- Paste cleanup for Word and Google Docs; sanitization of pasted, imported and source-edited HTML
- Each toolbar action is a separate undo step
- The editor is now a standalone component; `CkyEditorModule` is still exported

**Breaking changes**

- Removed `CkyEditorService`
- Removed the `@fortawesome/fontawesome-free` peer dependency
- Added `@angular/platform-browser` as a peer dependency

### 2.0.0

- Upgraded to Angular 21
- Added undo and redo, Word and PDF export, print and a word counter

### 1.0.0

- Initial release for Angular 16

## License

[MIT](./LICENSE) © Chandan Kumar
