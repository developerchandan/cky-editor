import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  HostListener,
  Input,
  OnDestroy,
  ViewChild,
  Injector,
  ViewEncapsulation,
  afterNextRender,
  forwardRef,
  inject,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import {
  BULLET_STYLES,
  COLORS,
  EMOJIS,
  FONT_FAMILIES,
  FONT_SIZES,
  HEADINGS,
  LAYOUTS,
  LINE_HEIGHTS,
  NUMBER_STYLES,
  SPECIAL_CHARS,
  STYLES,
  StyleOption,
  TABLE_GRID_SIZE,
  TEMPLATES,
} from './editor-config';
import {
  buildPrintDocument,
  buildWordDocument,
  cleanPastedHtml,
  countWords,
  downloadFile,
  escapeHtml,
  readFileAsDataUrl,
  sanitizeHtml,
  toEmbedHtml,
  toTitleCase,
} from './html-utils';
import { ICONS, IconName } from './icons';
import { TableAction, applyTableAction, buildTableHtml, closestCell, moveToAdjacentCell } from './table-utils';

type Mode = 'wysiwyg' | 'source' | 'preview';
type DialogKind = 'link' | 'find' | 'imageUrl' | 'media' | 'bookmark';
type MenuId =
  | 'textCase' | 'image' | 'table' | 'emoji' | 'special' | 'heading' | 'style' | 'fontSize'
  | 'fontFamily' | 'fontColor' | 'highlight' | 'align' | 'lineHeight' | 'layout' | 'template' | 'bullet' | 'number';

interface PainterFormat {
  bold: boolean;
  italic: boolean;
  underline: boolean;
  strike: boolean;
  color: string;
  background: string | null;
  fontSize: string;
  fontFamily: string;
}

const BLOCK_SELECTOR = 'p,h1,h2,h3,h4,h5,h6,blockquote,pre,li';
const MAX_ATTACHMENT_BYTES = 10 * 1024 * 1024;
const HISTORY_LIMIT = 100;

@Component({
  selector: 'cky-editor',
  standalone: true,
  templateUrl: './cky-editor.component.html',
  styleUrl: './cky-editor.component.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => CkyEditorComponent), multi: true }],
})
export class CkyEditorComponent implements ControlValueAccessor, AfterViewInit, OnDestroy {
  @Input() placeholder = 'Type or paste your content here…';
  @Input() minHeight = 260;
  @Input() documentTitle = 'document';

  @ViewChild('editorEl', { static: true }) private editableRef!: ElementRef<HTMLDivElement>;

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly injector = inject(Injector);
  private readonly sanitizer = inject(DomSanitizer);

  // Icons are static in-house SVG constants, never user input.
  readonly icon = Object.fromEntries(
    Object.entries(ICONS).map(([name, markup]) => [name, this.sanitizer.bypassSecurityTrustHtml(markup)]),
  ) as Record<IconName, SafeHtml>;

  readonly headings = HEADINGS;
  readonly styles = STYLES;
  readonly fontFamilies = FONT_FAMILIES;
  readonly fontSizes = FONT_SIZES;
  readonly lineHeights = LINE_HEIGHTS;
  readonly colors = COLORS;
  readonly bulletStyles = BULLET_STYLES;
  readonly numberStyles = NUMBER_STYLES;
  readonly layouts = LAYOUTS;
  readonly templates = TEMPLATES;
  readonly emojis = EMOJIS;
  readonly specialChars = SPECIAL_CHARS;
  readonly gridIndexes = Array.from({ length: TABLE_GRID_SIZE }, (_, i) => i);

  mode: Mode = 'wysiwyg';
  sourceHtml = '';
  openMenu: MenuId | null = null;
  dialog: DialogKind | null = null;
  dialogError = '';
  findStatus = '';
  notice = '';
  form = {
    linkUrl: '', linkText: '', linkNewTab: true,
    find: '', replace: '', matchCase: false,
    imageUrl: '', imageAlt: '', mediaUrl: '', bookmark: '',
  };
  tableHover = { rows: 0, cols: 0 };
  state = {
    bold: false, italic: false, underline: false, strike: false, superscript: false, subscript: false,
    ul: false, ol: false, blockquote: false, link: false, inTable: false, block: 'p', align: 'left',
    font: 'Default',
  };
  painter: PainterFormat | null = null;
  fullscreen = false;
  spellcheck = true;
  disabled = false;
  isEmpty = true;
  wordCount = 0;
  charCount = 0;

  private html = '';
  private viewReady = false;
  private savedRange: Range | null = null;
  private matchIndex = -1;
  private history: string[] = [];
  private historyIndex = 0;
  private historyTimer?: ReturnType<typeof setTimeout>;
  private noticeTimer?: ReturnType<typeof setTimeout>;
  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  get canUndo(): boolean {
    return this.historyIndex > 0 || this.historyTimer !== undefined;
  }

  get canRedo(): boolean {
    return this.historyIndex < this.history.length - 1;
  }

  get headingLabel(): string {
    return this.headings.find((h) => h.value === this.state.block)?.label ?? 'Paragraph';
  }

  get editable(): boolean {
    return this.mode === 'wysiwyg' && !this.disabled;
  }

  private get editor(): HTMLDivElement {
    return this.editableRef.nativeElement;
  }

  ngAfterViewInit(): void {
    document.execCommand('defaultParagraphSeparator', false, 'p');
    this.editor.innerHTML = this.html;
    this.viewReady = true;
    this.resetHistory();
    this.updateCounts();
  }

  ngOnDestroy(): void {
    clearTimeout(this.historyTimer);
    clearTimeout(this.noticeTimer);
    if (this.fullscreen) document.body.style.overflow = '';
  }

  // ControlValueAccessor

  writeValue(value: string | null): void {
    const next = value ?? '';
    if (next === this.html) return;
    this.html = next;
    if (!this.viewReady) return;
    this.editor.innerHTML = next;
    this.resetHistory();
    this.updateCounts();
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(disabled: boolean): void {
    this.disabled = disabled;
    this.cdr.markForCheck();
  }

  // Editor events

  onInput(): void {
    this.emitChange();
  }

  onBlur(): void {
    this.onTouched();
  }

  onMouseUp(): void {
    if (this.painter) this.applyPainter();
  }

  onEditorClick(event: MouseEvent): void {
    const item = (event.target as HTMLElement).closest('ul.cky-todo > li') as HTMLLIElement | null;
    if (!item || event.clientX - item.getBoundingClientRect().left > 24) return;
    item.classList.toggle('cky-checked');
    this.emitChange();
  }

  onPaste(event: ClipboardEvent): void {
    const data = event.clipboardData;
    if (!data) return;
    event.preventDefault();

    const image = Array.from(data.files).find((f) => f.type.startsWith('image/'));
    if (image) {
      this.insertImageFile(image);
      return;
    }
    const html = data.getData('text/html');
    if (html) this.insertHtml(cleanPastedHtml(html));
    else this.insertText(data.getData('text/plain'));
  }

  onKeydown(event: KeyboardEvent): void {
    const mod = event.ctrlKey || event.metaKey;
    const key = event.key.toLowerCase();

    if (mod && key === 'z' && !event.shiftKey) return this.handled(event, () => this.undo());
    if (mod && (key === 'y' || (key === 'z' && event.shiftKey))) return this.handled(event, () => this.redo());
    if (mod && key === 'k') return this.handled(event, () => this.openDialog('link'));
    if (mod && key === 'f') return this.handled(event, () => this.openDialog('find'));
    if (key === 'escape' && this.fullscreen) return this.handled(event, () => this.toggleFullscreen());

    if (key === 'tab') {
      const cell = closestCell(this.selectionNode(), this.editor);
      if (cell) {
        return this.handled(event, () => {
          const target = moveToAdjacentCell(cell, event.shiftKey);
          if (target) this.placeCaret(target, true);
          this.emitChange();
        });
      }
      if (this.currentList()) return this.handled(event, () => this.exec(event.shiftKey ? 'outdent' : 'indent'));
    }
  }

  @HostListener('document:selectionchange')
  onSelectionChange(): void {
    const selection = document.getSelection();
    if (!selection?.rangeCount) return;
    const range = selection.getRangeAt(0);
    if (!this.editor.contains(range.commonAncestorContainer)) return;
    this.savedRange = range.cloneRange();
    this.refreshState();
  }

  @HostListener('document:mousedown', ['$event'])
  onDocumentMouseDown(event: MouseEvent): void {
    if (this.openMenu && !(event.target as HTMLElement).closest('.cky-dropdown')) this.openMenu = null;
    if (!this.host.nativeElement.contains(event.target as Node)) this.dialog = null;
  }

  // Keeps the editor selection alive while toolbar buttons are clicked.
  keepSelection(event: MouseEvent): void {
    this.flushSnapshot();
    const target = event.target as HTMLElement;
    if (!target.closest('input, select, textarea')) event.preventDefault();
  }

  toggleMenu(menu: MenuId): void {
    this.openMenu = this.openMenu === menu ? null : menu;
    this.tableHover = { rows: 0, cols: 0 };
  }

  // History

  undo(): void {
    this.flushSnapshot();
    if (this.historyIndex > 0) this.restoreSnapshot(this.history[--this.historyIndex]);
  }

  redo(): void {
    if (this.canRedo) this.restoreSnapshot(this.history[++this.historyIndex]);
  }

  private resetHistory(): void {
    clearTimeout(this.historyTimer);
    this.historyTimer = undefined;
    this.history = [this.editor.innerHTML];
    this.historyIndex = 0;
  }

  private scheduleSnapshot(): void {
    clearTimeout(this.historyTimer);
    this.historyTimer = setTimeout(() => this.flushSnapshot(), 300);
  }

  private flushSnapshot(): void {
    if (this.historyTimer !== undefined) this.commitSnapshot();
  }

  private commitSnapshot(): void {
    clearTimeout(this.historyTimer);
    this.historyTimer = undefined;
    const current = this.editor.innerHTML;
    if (this.history[this.historyIndex] === current) return;
    this.history = [...this.history.slice(0, this.historyIndex + 1), current].slice(-HISTORY_LIMIT);
    this.historyIndex = this.history.length - 1;
    this.cdr.markForCheck();
  }

  private restoreSnapshot(html: string): void {
    this.editor.innerHTML = html;
    this.placeCaret(this.editor, false);
    this.publish();
  }

  // Formatting commands

  exec(command: string, value?: string): void {
    this.restoreSelection();
    document.execCommand(command, false, value);
    this.afterEdit();
  }

  setHeading(tag: string): void {
    this.exec('formatBlock', `<${tag}>`);
  }

  toggleBlockquote(): void {
    this.exec('formatBlock', this.state.blockquote ? '<p>' : '<blockquote>');
  }

  setAlign(align: 'left' | 'center' | 'right' | 'justify'): void {
    this.exec(`justify${align === 'justify' ? 'Full' : align[0].toUpperCase() + align.slice(1)}`);
  }

  setColor(kind: 'fore' | 'back', color: string): void {
    this.restoreSelection();
    document.execCommand('styleWithCSS', false, 'true');
    document.execCommand(kind === 'fore' ? 'foreColor' : 'hiliteColor', false, color);
    document.execCommand('styleWithCSS', false, 'false');
    this.afterEdit();
  }

  setFontSize(size: string): void {
    this.restoreSelection();
    this.applyInlineStyle('fontSize', size);
    this.afterEdit();
  }

  setFontFamily(family: string): void {
    this.restoreSelection();
    this.applyInlineStyle('fontFamily', family);
    this.afterEdit();
  }

  setLineHeight(value: string): void {
    this.restoreSelection();
    this.selectedBlocks().forEach((block) => (block.style.lineHeight = value));
    this.afterEdit();
  }

  applyStyle(style: StyleOption): void {
    this.restoreSelection();
    if (style.kind === 'block') {
      this.selectedBlocks().forEach((block) => block.classList.toggle(style.value));
    } else {
      const existing = this.closestInEditor(`span.${style.value}`);
      if (existing) existing.replaceWith(...Array.from(existing.childNodes));
      else this.wrapSelection(style.value);
    }
    this.afterEdit();
  }

  removeFormat(): void {
    this.restoreSelection();
    document.execCommand('removeFormat');
    this.selectedBlocks().forEach((block) => {
      block.removeAttribute('style');
      block.removeAttribute('class');
    });
    this.afterEdit();
  }

  setTextCase(mode: 'upper' | 'lower' | 'title'): void {
    this.restoreSelection();
    const text = document.getSelection()?.toString() ?? '';
    if (!text) return this.flash('Select some text first');
    const next = mode === 'upper' ? text.toUpperCase() : mode === 'lower' ? text.toLowerCase() : toTitleCase(text);
    this.insertText(next);
  }

  // Lists

  toggleList(kind: 'ul' | 'ol'): void {
    this.exec(kind === 'ul' ? 'insertUnorderedList' : 'insertOrderedList');
  }

  setListStyle(kind: 'ul' | 'ol', listStyle: string, className?: string): void {
    this.restoreSelection();
    const list = this.ensureList(kind);
    if (list) {
      list.classList.remove('cky-todo', 'cky-multilevel');
      list.style.listStyleType = listStyle;
      if (className) list.classList.add(className);
    }
    this.afterEdit();
  }

  toggleTodoList(): void {
    this.restoreSelection();
    const current = this.currentList();
    if (current?.classList.contains('cky-todo')) {
      document.execCommand('insertUnorderedList');
    } else {
      const list = this.ensureList('ul');
      if (list) {
        list.classList.remove('cky-multilevel');
        list.style.listStyleType = '';
        list.classList.add('cky-todo');
      }
    }
    this.afterEdit();
  }

  // Inserts

  insertTable(rows: number, cols: number): void {
    this.insertHtml(buildTableHtml(rows, cols));
  }

  tableAction(action: TableAction): void {
    this.restoreSelection();
    const cell = closestCell(this.selectionNode(), this.editor);
    if (!cell) return;
    const target = applyTableAction(cell, action);
    if (target) this.placeCaret(target, true);
    this.afterEdit();
  }

  insertText(text: string): void {
    this.restoreSelection();
    document.execCommand('insertText', false, text);
    this.afterEdit();
  }

  insertHtml(html: string): void {
    this.restoreSelection();
    document.execCommand('insertHTML', false, html);
    this.afterEdit();
  }

  insertCodeBlock(): void {
    this.restoreSelection();
    const text = document.getSelection()?.toString() ?? '';
    this.insertHtml(`<pre class="cky-code"><code>${escapeHtml(text) || '<br>'}</code></pre><p><br></p>`);
  }

  insertPageBreak(): void {
    this.insertHtml('<div class="cky-page-break" contenteditable="false"></div><p><br></p>');
  }

  insertLayout(className: string): void {
    const columns = className === 'cky-cols-3' ? 3 : 2;
    this.insertHtml(`<div class="cky-layout ${className}">${'<div class="cky-col"><p><br></p></div>'.repeat(columns)}</div><p><br></p>`);
  }

  async onImageFile(input: HTMLInputElement): Promise<void> {
    const file = input.files?.[0];
    input.value = '';
    if (file) await this.insertImageFile(file);
  }

  async onAttachFile(input: HTMLInputElement): Promise<void> {
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;
    if (file.size > MAX_ATTACHMENT_BYTES) return this.flash('File is larger than 10 MB');
    const dataUrl = await readFileAsDataUrl(file);
    const name = escapeHtml(file.name);
    this.insertHtml(`<a class="cky-file" href="${dataUrl}" download="${name}">${name}</a>&nbsp;`);
  }

  async onImportFile(input: HTMLInputElement): Promise<void> {
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;
    const text = await file.text();
    const html = /\.txt$/i.test(file.name)
      ? text.split(/\r?\n/).map((line) => `<p>${escapeHtml(line) || '<br>'}</p>`).join('')
      : cleanPastedHtml(new DOMParser().parseFromString(text, 'text/html').body.innerHTML);
    this.editor.innerHTML = html;
    this.afterEdit();
    this.flash(`Imported ${file.name}`);
  }

  private async insertImageFile(file: File): Promise<void> {
    const dataUrl = await readFileAsDataUrl(file);
    this.insertHtml(`<img src="${dataUrl}" alt="${escapeHtml(file.name)}">`);
  }

  // Dialogs

  openDialog(kind: DialogKind): void {
    this.flushSnapshot();
    this.openMenu = null;
    this.dialogError = '';
    this.findStatus = '';
    const selected = document.getSelection()?.toString() ?? '';

    if (kind === 'link') {
      const anchor = this.closestInEditor('a[href]') as HTMLAnchorElement | null;
      this.form.linkUrl = anchor?.getAttribute('href') ?? '';
      this.form.linkText = anchor?.textContent ?? selected;
      this.form.linkNewTab = anchor ? anchor.target === '_blank' : true;
    }
    if (kind === 'find') {
      if (selected) this.form.find = selected;
      this.matchIndex = -1;
    }
    this.dialog = kind;
    afterNextRender(() => this.host.nativeElement.querySelector<HTMLInputElement>('.cky-panel input')?.select(), {
      injector: this.injector,
    });
  }

  closeDialog(): void {
    this.dialog = null;
    this.clearHighlights();
    this.restoreSelection();
  }

  inputValue(event: Event): string {
    return (event.target as HTMLInputElement).value;
  }

  checked(event: Event): boolean {
    return (event.target as HTMLInputElement).checked;
  }

  applyLink(): void {
    const raw = this.form.linkUrl.trim();
    if (!raw) return;
    const url = /^(https?:|mailto:|tel:|#|\/)/i.test(raw) ? raw : `https://${raw}`;
    const target = this.form.linkNewTab ? ' target="_blank" rel="noopener noreferrer"' : '';

    this.restoreSelection();
    const anchor = this.closestInEditor('a[href]') as HTMLAnchorElement | null;
    if (anchor) {
      anchor.href = url;
      if (this.form.linkText.trim()) anchor.textContent = this.form.linkText.trim();
      anchor.toggleAttribute('target', this.form.linkNewTab);
      if (this.form.linkNewTab) anchor.target = '_blank';
    } else {
      const text = escapeHtml(this.form.linkText.trim() || document.getSelection()?.toString() || raw);
      document.execCommand('insertHTML', false, `<a href="${escapeHtml(url)}"${target}>${text}</a>`);
    }
    this.dialog = null;
    this.afterEdit();
  }

  unlink(): void {
    this.restoreSelection();
    const anchor = this.closestInEditor('a[href]');
    if (anchor) anchor.replaceWith(...Array.from(anchor.childNodes));
    this.afterEdit();
  }

  applyImageUrl(): void {
    const url = this.form.imageUrl.trim();
    if (!/^(https?:\/\/|data:image\/(?!svg))/i.test(url)) {
      this.dialogError = 'Enter a valid http(s) image URL';
      return;
    }
    this.dialog = null;
    this.insertHtml(`<img src="${escapeHtml(url)}" alt="${escapeHtml(this.form.imageAlt)}">`);
    this.form.imageUrl = this.form.imageAlt = '';
  }

  applyMedia(): void {
    const html = toEmbedHtml(this.form.mediaUrl);
    if (!html) {
      this.dialogError = 'Use a YouTube or Vimeo link, or a direct .mp4 / .webm URL';
      return;
    }
    this.dialog = null;
    this.insertHtml(html);
    this.form.mediaUrl = '';
  }

  applyBookmark(): void {
    const id = this.form.bookmark.trim().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
    if (!id) {
      this.dialogError = 'Use letters, numbers, dashes or underscores';
      return;
    }
    this.dialog = null;
    this.insertHtml(`<a id="${id}" class="cky-bookmark" title="#${id}">&#8203;</a>`);
    this.form.bookmark = '';
  }

  // Find & replace

  onFindInput(event: Event): void {
    this.form.find = this.inputValue(event);
    this.matchIndex = -1;
    this.clearHighlights();
    this.findStatus = '';
  }

  findNext(): void {
    const matches = this.findMatches();
    if (!matches.length) {
      this.matchIndex = -1;
      this.clearHighlights();
      this.findStatus = this.form.find ? 'No results' : '';
      return;
    }
    this.matchIndex = (this.matchIndex + 1) % matches.length;
    this.findStatus = `${this.matchIndex + 1} of ${matches.length}`;
    this.highlight(matches, this.matchIndex);
  }

  replaceOne(): void {
    const current = this.findMatches()[this.matchIndex];
    if (current) {
      current.deleteContents();
      current.insertNode(document.createTextNode(this.form.replace));
      this.editor.normalize();
      this.matchIndex--;
      this.emitChange();
    }
    this.findNext();
  }

  private findMatches(): Range[] {
    const needle = this.normalize(this.form.find);
    if (!needle) return [];
    const text = this.normalize(this.editor.textContent ?? '');
    const ranges: Range[] = [];
    for (let at = text.indexOf(needle); at >= 0; at = text.indexOf(needle, at + needle.length)) {
      ranges.push(this.rangeFromOffsets(at, at + needle.length));
    }
    return ranges;
  }

  private highlight(matches: Range[], index: number): void {
    const current = matches[index];
    if (typeof Highlight !== 'undefined' && CSS.highlights) {
      CSS.highlights.set('cky-find', new Highlight(...matches));
      CSS.highlights.set('cky-find-current', new Highlight(current));
    } else {
      this.selectRange(current);
    }
    current.startContainer.parentElement?.scrollIntoView({ block: 'nearest' });
  }

  private clearHighlights(): void {
    if (typeof Highlight === 'undefined' || !CSS.highlights) return;
    CSS.highlights.delete('cky-find');
    CSS.highlights.delete('cky-find-current');
  }

  replaceAll(): void {
    if (!this.form.find) return;
    const pattern = new RegExp(this.form.find.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), this.form.matchCase ? 'g' : 'gi');
    let count = 0;
    const walker = document.createTreeWalker(this.editor, NodeFilter.SHOW_TEXT);
    for (let node = walker.nextNode() as Text | null; node; node = walker.nextNode() as Text | null) {
      const replaced = node.data.replace(pattern, () => (count++, this.form.replace));
      if (replaced !== node.data) node.data = replaced;
    }
    this.findStatus = `Replaced ${count} occurrence${count === 1 ? '' : 's'}`;
    if (count) this.afterEdit();
  }

  private normalize(text: string): string {
    return this.form.matchCase ? text : text.toLowerCase();
  }

  private rangeFromOffsets(start: number, end: number): Range {
    const range = document.createRange();
    const walker = document.createTreeWalker(this.editor, NodeFilter.SHOW_TEXT);
    let seen = 0;
    for (let node = walker.nextNode() as Text | null; node; node = walker.nextNode() as Text | null) {
      const next = seen + node.length;
      if (start >= seen && start <= next) range.setStart(node, start - seen);
      if (end >= seen && end <= next) {
        range.setEnd(node, end - seen);
        break;
      }
      seen = next;
    }
    return range;
  }

  // Format painter

  togglePainter(): void {
    if (this.painter) {
      this.painter = null;
      return;
    }
    this.restoreSelection();
    const el = this.selectionElement();
    if (!el) return;
    const q = (command: string) => document.queryCommandState(command);
    this.painter = {
      bold: q('bold'),
      italic: q('italic'),
      underline: q('underline'),
      strike: q('strikeThrough'),
      color: getComputedStyle(el).color,
      background: (el.closest('[style*="background"]') as HTMLElement | null)?.style.backgroundColor || null,
      fontSize: (el.closest('span[style*="font-size"]') as HTMLElement | null)?.style.fontSize ?? '',
      fontFamily: (el.closest('span[style*="font-family"]') as HTMLElement | null)?.style.fontFamily ?? '',
    };
    this.flash('Select text to apply the copied formatting');
  }

  private applyPainter(): void {
    const format = this.painter!;
    const selection = document.getSelection();
    if (!selection || selection.isCollapsed) return;
    this.painter = null;

    document.execCommand('removeFormat');
    if (format.bold) document.execCommand('bold');
    if (format.italic) document.execCommand('italic');
    if (format.underline) document.execCommand('underline');
    if (format.strike) document.execCommand('strikeThrough');
    document.execCommand('styleWithCSS', false, 'true');
    document.execCommand('foreColor', false, format.color);
    if (format.background) document.execCommand('hiliteColor', false, format.background);
    document.execCommand('styleWithCSS', false, 'false');
    if (format.fontSize) this.applyInlineStyle('fontSize', format.fontSize);
    if (format.fontFamily) this.applyInlineStyle('fontFamily', format.fontFamily);
    this.afterEdit();
  }

  // Modes, export, print

  setMode(mode: Mode): void {
    const next = this.mode === mode ? 'wysiwyg' : mode;
    if (this.mode === 'source') {
      this.editor.innerHTML = sanitizeHtml(this.sourceHtml);
      this.emitChange();
    }
    if (next === 'source') this.sourceHtml = this.editor.innerHTML;
    this.mode = next;
    this.openMenu = this.dialog = null;
  }

  onSourceInput(): void {
    this.html = sanitizeHtml(this.sourceHtml);
    this.onChange(this.html);
  }

  selectAll(): void {
    this.editor.focus();
    document.execCommand('selectAll');
  }

  toggleFullscreen(): void {
    this.fullscreen = !this.fullscreen;
    document.body.style.overflow = this.fullscreen ? 'hidden' : '';
  }

  exportToWord(): void {
    const doc = buildWordDocument(this.editor.innerHTML, this.documentTitle);
    downloadFile('\ufeff' + doc, `${this.documentTitle}.doc`, 'application/msword');
  }

  exportToPDF(): void {
    this.printContent();
  }

  printContent(): void {
    const frame = document.createElement('iframe');
    frame.style.cssText = 'position:fixed;width:0;height:0;border:0;visibility:hidden';
    document.body.appendChild(frame);
    const win = frame.contentWindow!;
    win.document.open();
    win.document.write(buildPrintDocument(this.editor.innerHTML, this.documentTitle));
    win.document.close();
    win.onafterprint = () => frame.remove();
    setTimeout(() => {
      win.focus();
      win.print();
    }, 100);
  }

  // Internals

  private handled(event: Event, action: () => void): void {
    event.preventDefault();
    action();
  }

  // Toolbar commands are discrete undo steps; typing is debounced in emitChange.
  private afterEdit(): void {
    this.openMenu = null;
    this.publish();
    this.commitSnapshot();
    this.refreshState();
  }

  private emitChange(): void {
    this.publish();
    this.scheduleSnapshot();
  }

  private publish(): void {
    this.updateCounts();
    this.html = this.isEmpty ? '' : this.editor.innerHTML;
    this.onChange(this.html);
  }

  private updateCounts(): void {
    const text = this.editor.innerText ?? '';
    this.wordCount = countWords(text);
    this.charCount = text.replace(/\n/g, '').length;
    this.isEmpty = !text.trim() && !this.editor.querySelector('img,iframe,video,table,hr,.cky-page-break');
    this.cdr.markForCheck();
  }

  private refreshState(): void {
    const q = (command: string) => document.queryCommandState(command);
    const el = this.selectionElement();
    const block = el?.closest('h1,h2,h3,h4,h5,h6,p,pre');
    this.state = {
      bold: q('bold'),
      italic: q('italic'),
      underline: q('underline'),
      strike: q('strikeThrough'),
      superscript: q('superscript'),
      subscript: q('subscript'),
      ul: q('insertUnorderedList'),
      ol: q('insertOrderedList'),
      blockquote: !!this.closestInEditor('blockquote'),
      link: !!this.closestInEditor('a[href]'),
      inTable: !!closestCell(this.selectionNode(), this.editor),
      block: block && this.editor.contains(block) ? block.tagName.toLowerCase() : 'p',
      align: el ? getComputedStyle(el).textAlign.replace('start', 'left') : 'left',
      font: this.fontLabel(el),
    };
    this.cdr.markForCheck();
  }

  private restoreSelection(): void {
    this.editor.focus({ preventScroll: true });
    const selection = document.getSelection();
    if (!selection) return;
    if (this.savedRange && this.editor.contains(this.savedRange.commonAncestorContainer)) {
      selection.removeAllRanges();
      selection.addRange(this.savedRange);
    } else if (!selection.rangeCount || !this.editor.contains(selection.anchorNode)) {
      this.placeCaret(this.editor, false);
    }
  }

  private selectRange(range: Range): void {
    this.editor.focus({ preventScroll: true });
    const selection = document.getSelection()!;
    selection.removeAllRanges();
    selection.addRange(range);
    this.savedRange = range.cloneRange();
  }

  private placeCaret(node: Node, atStart: boolean): void {
    const range = document.createRange();
    range.selectNodeContents(node);
    range.collapse(atStart);
    this.selectRange(range);
  }

  private selectionNode(): Node | null {
    return this.savedRange?.startContainer ?? null;
  }

  private selectionElement(): HTMLElement | null {
    const node = this.selectionNode();
    const el = node instanceof HTMLElement ? node : node?.parentElement ?? null;
    return el && this.editor.contains(el) ? el : null;
  }

  private closestInEditor(selector: string): HTMLElement | null {
    const found = this.selectionElement()?.closest(selector) as HTMLElement | null;
    return found && this.editor.contains(found) && found !== this.editor ? found : null;
  }

  private currentList(): HTMLOListElement | HTMLUListElement | null {
    return this.closestInEditor('ul, ol') as HTMLOListElement | HTMLUListElement | null;
  }

  private ensureList(kind: 'ul' | 'ol'): HTMLOListElement | HTMLUListElement | null {
    if (this.currentList()?.tagName.toLowerCase() !== kind) {
      document.execCommand(kind === 'ul' ? 'insertUnorderedList' : 'insertOrderedList');
      this.onSelectionChange();
    }
    return this.currentList();
  }

  private selectedBlocks(): HTMLElement[] {
    const range = this.savedRange;
    if (!range) return [];
    const blocks = Array.from(this.editor.querySelectorAll<HTMLElement>(BLOCK_SELECTOR)).filter((b) =>
      range.intersectsNode(b),
    );
    const own = this.closestInEditor(BLOCK_SELECTOR);
    return blocks.length ? blocks : own ? [own] : [];
  }

  private wrapSelection(className: string): void {
    const range = this.savedRange;
    if (!range || range.collapsed) return this.flash('Select some text first');
    const span = document.createElement('span');
    span.className = className;
    span.appendChild(range.extractContents());
    range.insertNode(span);
    const selected = document.createRange();
    selected.selectNodeContents(span);
    this.selectRange(selected);
  }

  // execCommand only emits legacy <font> tags; mark them, then swap for styled spans.
  private applyInlineStyle(property: 'fontSize' | 'fontFamily', value: string): void {
    const selection = document.getSelection();
    if (selection?.rangeCount && selection.isCollapsed) {
      this.insertStyledCaret(selection.getRangeAt(0), property, value);
      return;
    }
    const [command, marker, selector] =
      property === 'fontSize'
        ? ['fontSize', '7', 'font[size="7"]']
        : ['fontName', 'cky-font', 'font[face="cky-font"]'];
    document.execCommand(command, false, marker);
    this.editor.querySelectorAll(selector).forEach((font) => {
      font.querySelectorAll<HTMLElement>('[style]').forEach((el) => (el.style[property] = ''));
      if (!value) return font.replaceWith(...Array.from(font.childNodes));
      const span = document.createElement('span');
      span.style[property] = value;
      span.append(...Array.from(font.childNodes));
      font.replaceWith(span);
    });
  }

  // With no selection, execCommand would leave its marker font behind for the next typed text.
  // Instead, park the caret in a styled span (held open by a zero-width space) so typing inherits it.
  private insertStyledCaret(range: Range, property: 'fontSize' | 'fontFamily', value: string): void {
    const span = document.createElement('span');
    span.style[property] = value || getComputedStyle(this.editor)[property];
    span.textContent = '\u200b';
    range.insertNode(span);
    const caret = document.createRange();
    caret.setStart(span.firstChild!, 1);
    caret.collapse(true);
    this.selectRange(caret);
  }

  private fontLabel(el: HTMLElement | null): string {
    const primary = (stack: string) => stack.split(',')[0].replace(/["']/g, '').trim().toLowerCase();
    const current = el ? primary(getComputedStyle(el).fontFamily) : '';
    return this.fontFamilies.find((f) => f.value && primary(f.value) === current)?.label ?? 'Default';
  }

  private flash(message: string): void {
    this.notice = message;
    clearTimeout(this.noticeTimer);
    this.noticeTimer = setTimeout(() => {
      this.notice = '';
      this.cdr.markForCheck();
    }, 3000);
    this.cdr.markForCheck();
  }
}
