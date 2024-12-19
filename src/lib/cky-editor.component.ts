import { Component, ElementRef, forwardRef, ViewChild, OnInit, AfterViewInit, Renderer2 } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'lib-cky-editor',
  template: `
   <!-- rich-editor.component.html -->
<div class="rich-editor-container">
    <div class="toolbar">
      <!-- Text formatting -->
      <select (change)="formatText('formatBlock', $event)">
        <option value="p">Normal</option>
        <option value="h1">Heading 1</option>
        <option value="h2">Heading 2</option>
        <option value="h3">Heading 3</option>
        <option value="h4">Heading 4</option>
        <option value="h5">Heading 5</option>
        <option value="h6">Heading 6</option>
        <option value="pre">Code</option>
      </select>
      <select formControlName="fontFamily" (change)="changeFontFamily($event)">
        <option value="Arial, sans-serif">Sans Serif</option>
        <option value="Times New Roman, serif">Serif</option>
        <option value="Courier New, monospace">Monospace</option>
        <option value="Arial">Arial</option>
        <option value="Helvetica">Helvetica</option>
        <option value="Times New Roman">Times New Roman</option>
        <option value="Courier">Courier</option>
      </select>
  
      <!-- Text style -->
      <button (click)="applyFormat('bold')" title="Bold">
        <i class="fas fa-bold"></i>
      </button>
      <button (click)="applyFormat('italic')" title="Italic">
        <i class="fas fa-italic"></i>
      </button>
      <button (click)="applyFormat('underline')" title="Underline">
        <i class="fas fa-underline"></i>
      </button>
      <button (click)="applyFormat('strikeThrough')" title="Strike Through">
        <i class="fas fa-strikethrough"></i>
      </button>
  
      <!-- Text color -->
      <div class="color-picker">
        <input type="color" [(ngModel)]="textColor" (change)="setTextColor($event)" title="Text Color">
        <span class="color-indicator">A</span>
      </div>
      <div class="color-picker">
        <input type="color" [(ngModel)]="backgroundColor" (change)="setBackgroundColor($event)" title="Background Color">
        <span class="color-indicator">BG</span>
      </div>
  
      <!-- Alignment -->
      <button (click)="setAlignment('left')" title="Align Left">
        <i class="fas fa-align-left"></i>
      </button>
      <button (click)="setAlignment('center')" title="Align Center">
        <i class="fas fa-align-center"></i>
      </button>
      <button (click)="setAlignment('right')" title="Align Right">
        <i class="fas fa-align-right"></i>
      </button>
      <button (click)="setAlignment('justify')" title="Justify">
        <i class="fas fa-align-justify"></i>
      </button>
  
      <!-- Lists -->
      <button (click)="formatText('insertOrderedList')" title="Numbered List">
        <i class="fas fa-list-ol"></i>
      </button>
      <button (click)="formatText('insertUnorderedList')" title="Bullet List">
        <i class="fas fa-list-ul"></i>
      </button>
  
      <!-- Indent/Outdent -->
      <button (click)="formatText('indent')" title="Increase Indent">
        <i class="fas fa-indent"></i>
      </button>
      <button (click)="formatText('outdent')" title="Decrease Indent">
        <i class="fas fa-outdent"></i>
      </button>
  
      <!-- Insert elements -->
      <button (click)="insertLink()" title="Insert Link">
        <i class="fas fa-link"></i>
      </button>
      <button (click)="insertImage()" title="Insert Image">
        <i class="fas fa-image"></i>
      </button>
      <button (click)="insertTable()" title="Insert Table">
        <i class="fas fa-table"></i>
      </button>
      
  
      <!-- Source code view -->
      <button (click)="toggleSourceView()" title="Source Code">
        <i class="fas fa-code"></i>
      </button>
    </div>
  
    <!-- Hidden file inputs -->
    <input
      #imageInput
      type="file"
      accept="image/*"
      style="display: none"
      (change)="onImageSelected($event)"
    >
    
    <!-- Editable content area -->
    <div
      #editableContent
      class="editor-content"
      [class.source-view]="isSourceView"
      (input)="onContentChange()"
      (keydown)="onKeyDown($event)"
    ></div>
  </div>
  `,
  styles: [
    
    `
    .rich-editor-container {
    display: flex;
    flex-direction: column;
    width: 100%;
    border: 1px solid #ccc;
    border-radius: 4px;
    background: #fafafa;
    font-family: Arial, sans-serif;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    overflow: hidden;
  }
  
  .toolbar {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    padding: 6px 8px;
    background: #f0f0f0;
    border-bottom: 1px solid #ccc;
    gap: 6px;
  }
  
  .toolbar select {
    border: 1px solid #ccc;
    border-radius: 3px;
    background: #fff;
    padding: 4px 6px;
    font-size: 14px;
    font-family: inherit;
    cursor: pointer;
  }
  
  .toolbar button {
    background: #fff;
    border: 1px solid #ccc;
    border-radius: 3px;
    padding: 4px 6px;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    color: #333;
    transition: background 0.2s, border-color 0.2s;
  }
  
  .toolbar button:hover {
    background: #e8e8e8;
    border-color: #bbb;
  }
  
  .toolbar i {
    font-size: 14px;
  }
  
  .color-picker {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    position: relative;
  }
  
  .color-picker input[type="color"] {
    border: none;
    padding: 0;
    width: 22px;
    height: 22px;
    cursor: pointer;
    background: transparent;
  }
  
  .color-picker .color-indicator {
    font-size: 12px;
    font-weight: bold;
    padding: 2px 4px;
    background: #fff;
    border: 1px solid #ccc;
    border-radius: 3px;
    line-height: 1;
  }
  
  .editor-content {
    background: #fff;
    min-height: 250px;
    padding: 10px;
    font-size: 14px;
    line-height: 1.5;
    color: #333;
    overflow-y: auto;
  }
  
  .editor-content:focus {
    outline: none;
  }
  
  .editor-content.source-view {
    font-family: Consolas, Monaco, 'Courier New', monospace;
    white-space: pre;
    overflow-wrap: normal;
  }
  
  /* Optional scrollbar styling for a cleaner look */
  .editor-content::-webkit-scrollbar {
    width: 8px;
  }
  
  .editor-content::-webkit-scrollbar-track {
    background: #f0f0f0;
  }
  
  .editor-content::-webkit-scrollbar-thumb {
    background: #ccc;
    border-radius: 4px;
  }
  
  .editor-content::-webkit-scrollbar-thumb:hover {
    background: #b3b3b3;
  }
  
  /* Add a subtle hover effect to toolbar elements */
  .toolbar button:focus,
  .toolbar select:focus,
  .color-picker input[type="color"]:focus {
    outline: 2px solid #aaa;
  }
  
  /* Responsive adjustments */
  @media (max-width: 600px) {
    .toolbar {
      justify-content: flex-start;
      flex-wrap: wrap;
    }
    .toolbar button,
    .toolbar select {
      margin-bottom: 4px;
    }
  }
  
  
  .table-button-container {
    position: relative;
    display: inline-block;
  }
  
  .table-button-container .tooltip-text {
    visibility: hidden;
    width: 200px;
    background-color: #333;
    color: #fff;
    text-align: center;
    border-radius: 6px;
    padding: 5px;
    position: absolute;
    z-index: 1;
    bottom: 125%;
    left: 50%;
    transform: translateX(-50%);
    opacity: 0;
    transition: opacity 0.3s;
  }
  
  .table-button-container:hover .tooltip-text {
    visibility: visible;
    opacity: 1;
  }
  
  .table-button-container .tooltip-text::after {
    content: "";
    position: absolute;
    top: 100%;
    left: 50%;
    margin-left: -5px;
    border-width: 5px;
    border-style: solid;
    border-color: #333 transparent transparent transparent;
  }
  /* In your component's CSS file or global styles */
  .editor-content table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 10px;
  }
  
  .editor-content table, 
  .editor-content td, 
  .editor-content th {
    border: 1px solid #000;
    padding: 8px;
  }
  
  .editor-content td {
    min-width: 50px;
    text-align: left;
    vertical-align: top;
  }
    `
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CkyEditorComponent),
      multi: true
    }
  ]
})
export class CkyEditorComponent {

@ViewChild('editableContent', { static: true }) editableContent!: ElementRef<HTMLDivElement>;
  @ViewChild('imageInput') imageInput!: ElementRef<HTMLInputElement>;
  @ViewChild('linkInput') linkInput!: ElementRef<HTMLInputElement>;

  content: string = '';
  textColor: string = '#000000';
  backgroundColor: string = '#ffffff';
  fontSize: string = '3';
  fontFamily: string = 'Arial, sans-serif';
  textAlign: string = 'left';
  isSourceView: boolean = false;
  selection: Range | null = null;
  currentTable: HTMLTableElement | null = null;
  onChange: any = () => {};
  onTouch: any = () => {};

  constructor(private renderer: Renderer2) {}

  ngOnInit() {
    debugger
    this.setupAdvancedPasteHandler();
    this.setupSelectionSaver();
    this.setupTableContextMenu();
  }

  ngAfterViewInit() {
    this.makeContentEditable();
    this.editableContent.nativeElement.addEventListener('blur', () => {
      this.onTouch();
    });
  }

  private setupSelectionSaver() {
    document.addEventListener('mouseup', () => {
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        this.selection = selection.getRangeAt(0).cloneRange();
      }
    });
  }

  makeContentEditable() {
    this.renderer.setAttribute(this.editableContent.nativeElement, 'contenteditable', 'true');
    this.renderer.setStyle(this.editableContent.nativeElement, 'min-height', '200px');
  }

  // Advanced Paste Handler
  private setupAdvancedPasteHandler() {
    debugger
    if (this.editableContent) {
      this.editableContent.nativeElement.addEventListener('paste', (e: ClipboardEvent) => {
        e.preventDefault();
        const clipboardData = e.clipboardData;
        
        // Check for images first
        if (clipboardData?.items) {
          for (let i = 0; i < clipboardData.items.length; i++) {
            const item = clipboardData.items[i];
            if (item.type.indexOf('image') !== -1) {
              const file = item.getAsFile();
              if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                  const img = `<img src="${event.target?.result}" style="max-width: 100%;">`;
                  this.insertPastedContent(img);
                };
                reader.readAsDataURL(file);
                return;
              }
            }
          }
        }
        
        // Fallback to text content with HTML preservation
        let pasteContent = clipboardData?.getData('text/html') || 
                           clipboardData?.getData('text/plain') || '';
        
        // Sanitize and clean the pasted content
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = pasteContent;
        
        // Remove potentially harmful scripts or styles
        const scripts = tempDiv.getElementsByTagName('script');
        while (scripts.length > 0) {
          scripts[0].remove();
        }
        
        this.insertPastedContent(tempDiv.innerHTML);
      });
    }
  }

  // Improved content insertion method
  private insertPastedContent(content: string) {
    // Restore selection if exists
    if (this.selection) {
      const selection = window.getSelection();
      if (selection) {
        selection.removeAllRanges();
        selection.addRange(this.selection);
      }
    }

    // Insert content using execCommand or modern insertion methods
    if (document.queryCommandSupported('insertHTML')) {
      document.execCommand('insertHTML', false, content);
    } else {
      const selection = window.getSelection();
      if (selection) {
        const range = selection.getRangeAt(0);
        range.deleteContents();
        const fragment = range.createContextualFragment(content);
        range.insertNode(fragment);
        range.collapse(false);
        selection.removeAllRanges();
        selection.addRange(range);
      }
    }

    this.onContentChange();
  }

  // Comprehensive formatting method
  formatText(command: string, event?: any): void {
    // Ensure the editable area has focus
    this.editableContent.nativeElement.focus();
    let value = event;
    if (event?.target) {
      value = event.target.value;
    }
    if (command === 'formatBlock') {
      value = `<${value}>`; // Wrap the tag in <>
    }
 
   
    // Restore selection if it exists
    if (this.selection) {
      const selection = window.getSelection();
      if (selection) {
        selection.removeAllRanges();
        selection.addRange(this.selection);
      }
    }

    // Special handling for lists to ensure proper formatting
    if (command === 'insertUnorderedList' || command === 'insertOrderedList') {
      // Use document.execCommand for list insertion
      document.execCommand(command, false);

      // Additional list formatting
      const container = this.editableContent.nativeElement;
      const lists = container.querySelectorAll('ul, ol');
      
      lists.forEach(list => {
        const listElement = list as HTMLUListElement | HTMLOListElement;
        
        // Ensure consistent styling
        listElement.style.paddingLeft = '30px';
        
        // Set list style
        if (list.tagName === 'UL') {
          listElement.style.listStyleType = 'disc';
        } else {
          listElement.style.listStyleType = 'decimal';
        }

        // Ensure list items have proper margins
        const listItems = listElement.querySelectorAll('li');
        listItems.forEach(item => {
          (item as HTMLLIElement).style.marginBottom = '5px';
        });
      });
    } else if (command === 'formatBlock' && value) {
      // Block formatting
      document.execCommand(command, false, value);
    } else if (value) {
      // Other commands with values
      document.execCommand(command, false, value);
    } else {
      // Commands without values
      document.execCommand(command, false);
    }

    this.onContentChange();
  }

  // ControlValueAccessor methods
  writeValue(value: string): void {
    this.content = value || '';
    if (this.editableContent) {
      this.editableContent.nativeElement.innerHTML = this.content;
    }
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouch = fn;
  }

  // Existing methods (setTextColor, setBackgroundColor, etc.)
  setTextColor(event: Event): void {
    const color = (event.target as HTMLInputElement).value;
    this.textColor = color;
    this.restoreSelectionAndExecuteCommand('foreColor', color);
  }

  setBackgroundColor(event: Event): void {
    const color = (event.target as HTMLInputElement).value;
    this.backgroundColor = color;
    this.restoreSelectionAndExecuteCommand('hiliteColor', color);
  }

  private restoreSelectionAndExecuteCommand(command: string, value: string) {
    // Restore selection before applying color
    if (this.selection) {
      const selection = window.getSelection();
      if (selection) {
        selection.removeAllRanges();
        selection.addRange(this.selection);
      }
    }
    document.execCommand(command, false, value);
    this.onContentChange();
  }

  // Content change tracking
  onContentChange(): void {
    if (this.editableContent) {
      const value = this.editableContent.nativeElement.innerHTML;
      
      // Preserve background colors and other styles
      this.content = value;
      this.onChange(value);
  
      // Save current selection
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        this.selection = selection.getRangeAt(0).cloneRange();
      }
    }
  }
  // Other existing methods
  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Tab') {
      event.preventDefault();
      document.execCommand('insertHTML', false, '&nbsp;&nbsp;&nbsp;&nbsp;');
    }
  }

  // Image and other existing methods remain the same as in previous implementations
  insertImage(): void {
    this.imageInput.nativeElement.click();
  }

  onImageSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = `<img src="${e.target?.result}" style="max-width: 100%;">`;
        this.insertPastedContent(img);
      };
      reader.readAsDataURL(file);
    }
  }

  setAlignment(alignment: string): void {
    this.formatText('justifyLeft');
    if (alignment !== 'left') {
      this.formatText(`justify${alignment.charAt(0).toUpperCase() + alignment.slice(1)}`);
    }
  }
  // Link handling
  insertLink(): void {
    const url = prompt('Enter URL:');
    if (url) {
      this.formatText('createLink', url);
    }
  }

 // Advanced Table Editing Methods
 private setupTableContextMenu() {
  this.editableContent.nativeElement.addEventListener('contextmenu', (e: MouseEvent) => {
    const target = e.target as HTMLElement;
    const tableCell = target.closest('td');
    
    if (tableCell) {
      e.preventDefault();
      this.currentTable = tableCell.closest('table') as HTMLTableElement;
      this.showTableContextMenu(e, tableCell);
    }
  });
}

private showTableContextMenu(e: MouseEvent, cell: HTMLTableCellElement) {
  // Remove existing context menu if any
  const existingMenu = document.getElementById('table-context-menu');
  if (existingMenu) {
    existingMenu.remove();
  }

  // Create context menu
  const menu = document.createElement('div');
  menu.id = 'table-context-menu';
  menu.style.position = 'fixed';
  menu.style.left = `${e.clientX}px`;
  menu.style.top = `${e.clientY}px`;
  menu.style.backgroundColor = 'white';
  menu.style.border = '1px solid #ccc';
  menu.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
  menu.style.zIndex = '1000';
  menu.style.padding = '10px';

  // Add menu options
  const options = [
    { text: 'Add Row Above', action: () => this.addTableRow(cell, 'above') },
    { text: 'Add Row Below', action: () => this.addTableRow(cell, 'below') },
    { text: 'Delete Row', action: () => this.deleteTableRow(cell) },
    { text: 'Add Column Left', action: () => this.addTableColumn(cell, 'left') },
    { text: 'Add Column Right', action: () => this.addTableColumn(cell, 'right') },
    { text: 'Delete Column', action: () => this.deleteTableColumn(cell) },
    { text: 'Delete Table', action: () => this.deleteTable() }
  ];

  options.forEach(option => {
    const menuItem = document.createElement('div');
    menuItem.textContent = option.text;
    menuItem.style.padding = '5px';
    menuItem.style.cursor = 'pointer';
    menuItem.addEventListener('click', () => {
      option.action();
      menu.remove();
    });
    menuItem.addEventListener('mouseover', () => {
      menuItem.style.backgroundColor = '#f0f0f0';
    });
    menuItem.addEventListener('mouseout', () => {
      menuItem.style.backgroundColor = 'white';
    });
    menu.appendChild(menuItem);
  });

  // Close menu when clicking outside
  const closeMenu = (event: MouseEvent) => {
    if (menu && !menu.contains(event.target as Node)) {
      menu.remove();
      document.removeEventListener('click', closeMenu);
    }
  };

  document.body.appendChild(menu);
  document.addEventListener('click', closeMenu);
}

private addTableRow(cell: HTMLTableCellElement, position: 'above' | 'below') {
  if (!this.currentTable) return;

  const row = cell.closest('tr') as HTMLTableRowElement;
  const newRow = row.cloneNode(true) as HTMLTableRowElement;

  // Clear content of new row
  Array.from(newRow.cells).forEach(cell => {
    (cell as HTMLTableCellElement).innerHTML = '&nbsp;';
  });

  if (position === 'above') {
    row.parentNode?.insertBefore(newRow, row);
  } else {
    row.parentNode?.insertBefore(newRow, row.nextSibling);
  }

  this.onContentChange();
}

private deleteTableRow(cell: HTMLTableCellElement) {
  const row = cell.closest('tr') as HTMLTableRowElement;
  
  // Prevent deleting the last row
  if (row.parentNode?.children.length === 1) {
    alert('Cannot delete the last row.');
    return;
  }

  row.remove();
  this.onContentChange();
}

private addTableColumn(cell: HTMLTableCellElement, position: 'left' | 'right') {
  if (!this.currentTable) return;

  const cellIndex = cell.cellIndex;
  const rows = this.currentTable.rows;

  for (let i = 0; i < rows.length; i++) {
    const newCell = rows[i].insertCell(position === 'left' ? cellIndex : cellIndex + 1);
    newCell.innerHTML = '&nbsp;';
    newCell.style.border = '1px solid #000';
    newCell.style.padding = '8px';
    newCell.style.minWidth = '50px';
  }

  this.onContentChange();
}

private deleteTableColumn(cell: HTMLTableCellElement) {
  if (!this.currentTable) return;

  const cellIndex = cell.cellIndex;
  const rows = this.currentTable.rows;

  // Prevent deleting the last column
  if (rows[0].cells.length === 1) {
    alert('Cannot delete the last column.');
    return;
  }

  for (let i = 0; i < rows.length; i++) {
    rows[i].deleteCell(cellIndex);
  }

  this.onContentChange();
}

private deleteTable() {
  if (!this.currentTable) return;

  const confirmDelete = confirm('Are you sure you want to delete this entire table?');
  if (confirmDelete) {
    this.currentTable.remove();
    this.currentTable = null;
    this.onContentChange();
  }
}

// Override insertTable method to add more advanced table creation
insertTable(): void {
  const rows = prompt('Enter number of rows:', '3');
  const cols = prompt('Enter number of columns:', '3');
  if (rows && cols) {
    const table = document.createElement('table');
    table.style.width = '100%';
    table.style.borderCollapse = 'collapse';
    table.style.border = '1px solid #000';

    for (let i = 0; i < parseInt(rows); i++) {
      const row = table.insertRow();
      for (let j = 0; j < parseInt(cols); j++) {
        const cell = row.insertCell();
        cell.style.border = '1px solid #000';
        cell.style.padding = '8px';
        cell.style.minWidth = '50px';
        cell.innerHTML = '&nbsp;';
      }
    }

    // Convert table to string and insert
    this.insertPastedContent(table.outerHTML);
  }
}
 // Font size and family
 changeFontSize(event: Event): void {
  const size = (event.target as HTMLSelectElement).value;
  this.formatText('fontSize', size);
}

changeFontFamily(event: Event): void {
  const font = (event.target as HTMLSelectElement).value;
  this.formatText('fontName', font);
}
 // Text formatting
 applyFormat(format: string): void {
  this.formatText(format);
}
  // Source code view toggle
  toggleSourceView(): void {
    this.isSourceView = !this.isSourceView;
    if (this.isSourceView) {
      const content = this.editableContent.nativeElement.innerHTML;
      this.editableContent.nativeElement.textContent = content;
    } else {
      const content = this.editableContent.nativeElement.textContent || '';
      this.editableContent.nativeElement.innerHTML = content;
    }
  }


}
