import { Component, ElementRef, forwardRef, ViewChild, OnInit, AfterViewInit, Renderer2 } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'lib-cky-editor',
  standalone: false,
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
      <select [value]="fontFamily" (change)="changeFontFamily($event)">
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
      <div class="table-button-wrapper">
        <button (click)="toggleTableInsertDialog($event)" title="Insert Table">
          <i class="fas fa-table"></i>
        </button>
        <div class="table-insert-popup" id="table-insert-popup">
          <div class="table-grid-selector">
            <div class="table-size-inputs">
              <div class="table-input-group">
                <label>Rows:</label>
                <input type="number" id="table-rows-input" min="1" max="20" value="3" class="table-number-input">
              </div>
              <div class="table-input-group">
                <label>Columns:</label>
                <input type="number" id="table-cols-input" min="1" max="20" value="3" class="table-number-input">
              </div>
            </div>
            <div class="table-grid-preview" id="table-grid-preview"></div>
            <div class="table-size-display" id="table-size-display">3 x 3</div>
            <div class="table-popup-footer">
              <button class="table-popup-btn" id="table-cancel-btn">Cancel</button>
              <button class="table-popup-btn table-popup-btn-primary" id="table-insert-btn">Insert Table</button>
            </div>
          </div>
        </div>
      </div>
      
  
      <!-- Source code view -->
      <button (click)="toggleSourceView()" title="Source Code">
        <i class="fas fa-code"></i>
      </button>

      <div class="toolbar-separator"></div>

      <!-- New Features: Undo/Redo -->
      <button (click)="undo()" title="Undo (Ctrl+Z)" [disabled]="!canUndo">
        <i class="fas fa-undo"></i>
      </button>
      <button (click)="redo()" title="Redo (Ctrl+Y)" [disabled]="!canRedo">
        <i class="fas fa-redo"></i>
      </button>

      <div class="toolbar-separator"></div>

      <!-- New Features: Export & Print -->
      <button (click)="exportToWord()" title="Export to Word">
        <i class="fas fa-file-word"></i>
      </button>
      <button (click)="exportToPDF()" title="Export to PDF">
        <i class="fas fa-file-pdf"></i>
      </button>
      <button (click)="printContent()" title="Print">
        <i class="fas fa-print"></i>
      </button>

      <div class="toolbar-separator"></div>

      <!-- Word/Character Count -->
      <div class="word-count-display">
        <span class="count-text">Words: {{ wordCount }}</span>
        <span class="count-text">Chars: {{ characterCount }}</span>
      </div>
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
    border: 1px solid #d1d5db;
    border-radius: 4px;
    background: #ffffff;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    overflow: hidden;
  }
  
  .toolbar {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    padding: 8px;
    background: #f8f9fa;
    border-bottom: 1px solid #e5e7eb;
    gap: 4px;
    min-height: 40px;
  }
  
  .toolbar select {
    border: 1px solid #d1d5db;
    border-radius: 2px;
    background: #ffffff;
    padding: 4px 8px;
    font-size: 13px;
    font-family: inherit;
    cursor: pointer;
    transition: border-color 0.15s ease;
    color: #374151;
    height: 28px;
    line-height: 20px;
  }
  
  .toolbar select:hover {
    border-color: #9ca3af;
  }
  
  .toolbar select:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
  }
  
  .toolbar button {
    background: #ffffff;
    border: 1px solid #d1d5db;
    border-radius: 2px;
    padding: 4px 8px;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    color: #374151;
    transition: background-color 0.15s ease, border-color 0.15s ease;
    min-width: 28px;
    height: 28px;
  }
  
  .toolbar button:hover {
    background: #f3f4f6;
    border-color: #9ca3af;
  }
  
  .toolbar button:active {
    background: #e5e7eb;
  }
  
  .toolbar button.active {
    background: #e5e7eb;
    border-color: #6b7280;
  }
  
  .toolbar i {
    font-size: 14px;
    color: #374151;
  }
  
  .toolbar button:hover i {
    color: #111827;
  }

  .toolbar-separator {
    width: 1px;
    height: 20px;
    background: #d1d5db;
    margin: 0 4px;
  }

  .word-count-display {
    display: flex;
    gap: 12px;
    margin-left: auto;
    padding: 4px 12px;
    font-size: 12px;
    color: #6b7280;
    font-weight: 400;
  }

  .count-text {
    white-space: nowrap;
  }

  .toolbar button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    background: #f9fafb;
  }

  .toolbar button:disabled:hover {
    background: #f9fafb;
    border-color: #d1d5db;
  }
  
  .toolbar button:disabled i {
    color: #9ca3af;
  }
  
  .color-picker {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    position: relative;
    padding: 2px;
  }
  
  .color-picker input[type="color"] {
    border: 1px solid #d1d5db;
    padding: 0;
    width: 24px;
    height: 24px;
    cursor: pointer;
    background: transparent;
    border-radius: 2px;
    transition: border-color 0.15s ease;
  }
  
  .color-picker input[type="color"]:hover {
    border-color: #9ca3af;
  }
  
  .color-picker .color-indicator {
    font-size: 11px;
    font-weight: 600;
    padding: 2px 6px;
    background: #ffffff;
    border: 1px solid #d1d5db;
    border-radius: 2px;
    line-height: 1;
    color: #374151;
  }
  
  .editor-content {
    background: #ffffff;
    min-height: 300px;
    padding: 16px;
    font-size: 14px;
    line-height: 1.6;
    color: #111827;
    overflow-y: auto;
  }
  
  .editor-content:focus {
    outline: none;
  }
  
  .editor-content.source-view {
    font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
    white-space: pre;
    overflow-wrap: normal;
    background: #1f2937;
    color: #f9fafb;
    font-size: 13px;
    line-height: 1.5;
    padding: 16px;
  }
  
  .editor-content::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }
  
  .editor-content::-webkit-scrollbar-track {
    background: #f9fafb;
  }
  
  .editor-content::-webkit-scrollbar-thumb {
    background: #d1d5db;
    border-radius: 4px;
  }
  
  .editor-content::-webkit-scrollbar-thumb:hover {
    background: #9ca3af;
  }
  
  .toolbar button:focus,
  .toolbar select:focus {
    outline: none;
  }
  
  @media (max-width: 600px) {
    .toolbar {
      justify-content: flex-start;
      flex-wrap: wrap;
      padding: 6px;
    }
    .toolbar button,
    .toolbar select {
      margin-bottom: 4px;
    }
    .word-count-display {
      margin-left: 0;
      width: 100%;
      justify-content: center;
      padding: 8px;
      border-top: 1px solid #e5e7eb;
      margin-top: 4px;
    }
  }
  
  .editor-content table {
    width: 100%;
    border-collapse: collapse;
    margin: 12px 0;
    border: 1px solid #e5e7eb;
  }
  
  .editor-content table, 
  .editor-content td, 
  .editor-content th {
    border: 1px solid #e5e7eb;
    padding: 4px 2px;
  }
  
  .editor-content th {
    background: #f9fafb;
    color: #111827;
    font-weight: 600;
    text-align: left;
  }
  
  .editor-content td {
    min-width: 50px;
    text-align: left;
    vertical-align: top;
    background: #ffffff;
  }
  
  .editor-content tr:nth-child(even) td {
    background: #f9fafb;
  }
  
  .editor-content tr:hover td {
    background: #f3f4f6;
  }
  
  .editor-content img {
    max-width: 100%;
    height: auto;
    border-radius: 4px;
    margin: 12px 0;
    border: 1px solid #e5e7eb;
  }
  
  .editor-content a {
    color: #2563eb;
    text-decoration: underline;
    font-weight: 400;
  }
  
  .editor-content a:hover {
    color: #1d4ed8;
  }
  
  .editor-content h1, .editor-content h2, .editor-content h3,
  .editor-content h4, .editor-content h5, .editor-content h6 {
    color: #111827;
    margin-top: 16px;
    margin-bottom: 12px;
    font-weight: 600;
    line-height: 1.4;
  }
  
  .editor-content h1 {
    font-size: 2em;
    font-weight: 700;
  }
  
  .editor-content h2 {
    font-size: 1.5em;
  }
  
  .editor-content h3 {
    font-size: 1.25em;
  }
  
  .editor-content ul, .editor-content ol {
    padding-left: 24px;
    margin: 12px 0;
  }
  
  .editor-content li {
    margin: 4px 0;
    line-height: 1.6;
  }
  
  .editor-content blockquote {
    border-left: 4px solid #e5e7eb;
    padding-left: 16px;
    margin: 16px 0;
    color: #4b5563;
    font-style: italic;
    background: #f9fafb;
    padding: 12px 16px;
  }
  
  .editor-content code {
    background: #f3f4f6;
    padding: 2px 6px;
    border-radius: 3px;
    font-family: 'Consolas', 'Monaco', monospace;
    font-size: 0.9em;
    color: #dc2626;
    border: 1px solid #e5e7eb;
  }
  
  .editor-content pre {
    background: #f9fafb;
    border: 1px solid #e5e7eb;
    border-radius: 4px;
    padding: 12px;
    overflow-x: auto;
    margin: 12px 0;
  }
  
  .editor-content pre code {
    background: transparent;
    padding: 0;
    border: none;
    color: #111827;
  }
  
  .editor-content p {
    margin: 12px 0;
  }
  
  .editor-content hr {
    border: none;
    border-top: 1px solid #e5e7eb;
    margin: 16px 0;
  }
  
  /* Table Button Wrapper */
  .table-button-wrapper {
    position: relative;
    display: inline-block;
  }

  .table-insert-popup {
    position: absolute;
    top: 100%;
    right: 0;
    margin-top: 4px;
    background: #ffffff;
    border: 1px solid #e5e7eb;
    border-radius: 4px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    z-index: 1000;
    opacity: 0;
    visibility: hidden;
    transform: translateY(-10px);
    transition: all 0.2s ease;
    padding: 12px;
    pointer-events: none;
  }

  .table-insert-popup.show {
    opacity: 1;
    visibility: visible;
    transform: translateY(0);
    pointer-events: all;
  }

  .table-grid-selector {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .table-size-inputs {
    display: flex;
    gap: 12px;
    padding-bottom: 8px;
    border-bottom: 1px solid #e5e7eb;
  }

  .table-input-group {
    display: flex;
    flex-direction: column;
    gap: 4px;
    flex: 1;
  }

  .table-input-group label {
    font-size: 12px;
    font-weight: 500;
    color: #374151;
  }

  .table-number-input {
    width: 100%;
    padding: 6px 8px;
    border: 1px solid #d1d5db;
    border-radius: 4px;
    font-size: 13px;
    font-family: inherit;
    transition: border-color 0.15s ease;
  }

  .table-number-input:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }

  .table-grid-preview {
    display: flex;
    flex-direction: column;
    gap: 2px;
    background: #f9fafb;
    padding: 8px;
    border-radius: 4px;
    border: 1px solid #e5e7eb;
  }

  .table-preview-row {
    display: flex;
    gap: 2px;
  }

  .table-preview-cell {
    width: 18px;
    height: 18px;
    background: #ffffff;
    border: 1px solid #e5e7eb;
    border-radius: 2px;
    cursor: pointer;
    transition: all 0.05s ease;
    position: relative;
  }

  .table-preview-cell.highlight {
    background: #3b82f6;
    border-color: #2563eb;
  }

  .table-preview-cell:hover {
    border-color: #3b82f6;
  }
  
  .table-preview-cell.highlight:hover {
    background: #2563eb;
  }

  .table-size-display {
    text-align: center;
    font-size: 12px;
    font-weight: 600;
    color: #374151;
    padding: 4px 0;
  }

  .table-popup-footer {
    display: flex;
    gap: 8px;
    justify-content: flex-end;
  }

  .table-popup-btn {
    padding: 6px 12px;
    border: 1px solid #d1d5db;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.15s ease;
    background: #ffffff;
    color: #374151;
  }

  .table-popup-btn:hover {
    background: #f9fafb;
    border-color: #9ca3af;
  }

  .table-popup-btn-primary {
    background: #3b82f6;
    color: #ffffff;
    border-color: #3b82f6;
  }

  .table-popup-btn-primary:hover {
    background: #2563eb;
    border-color: #2563eb;
  }

  /* Professional Dialog Styles */
  .editor-dialog-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
    animation: fadeIn 0.2s ease;
  }
  
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  
  .editor-dialog {
    background: #ffffff;
    border-radius: 4px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
    min-width: 400px;
    max-width: 90vw;
    max-height: 90vh;
    display: flex;
    flex-direction: column;
    animation: slideDown 0.2s ease;
  }
  
  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  .editor-dialog-small {
    min-width: 350px;
  }

  .editor-dialog-inline {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    margin: 0;
  }

  .link-dialog-inline {
    position: absolute;
    background: #ffffff;
    border: 1px solid #e5e7eb;
    border-radius: 6px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    padding: 8px;
    display: flex;
    align-items: center;
    gap: 8px;
    z-index: 1000;
    min-width: 300px;
    animation: slideDown 0.2s ease;
  }

  .link-dialog-inline input {
    flex: 1;
    padding: 6px 10px;
    border: 1px solid #d1d5db;
    border-radius: 4px;
    font-size: 14px;
    font-family: inherit;
    outline: none;
  }

  .link-dialog-inline input:focus {
    border-color: #3b82f6;
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
  }

  .link-dialog-inline button {
    padding: 6px 12px;
    border: none;
    border-radius: 4px;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.15s ease;
  }

  .link-dialog-inline .link-insert-btn {
    background: #3b82f6;
    color: #ffffff;
  }

  .link-dialog-inline .link-insert-btn:hover {
    background: #2563eb;
  }

  .link-dialog-inline .link-cancel-btn {
    background: #f3f4f6;
    color: #374151;
  }

  .link-dialog-inline .link-cancel-btn:hover {
    background: #e5e7eb;
  }

  .rich-editor-container {
    position: relative;
  }
  
  .editor-dialog-header {
    padding: 16px 20px;
    border-bottom: 1px solid #e5e7eb;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .editor-dialog-header h3 {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
    color: #111827;
  }
  
  .editor-dialog-close {
    background: none;
    border: none;
    font-size: 24px;
    color: #6b7280;
    cursor: pointer;
    padding: 0;
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 2px;
    transition: background-color 0.15s ease;
  }
  
  .editor-dialog-close:hover {
    background: #f3f4f6;
    color: #111827;
  }
  
  .editor-dialog-body {
    padding: 20px;
    flex: 1;
    overflow-y: auto;
  }
  
  .editor-dialog-body label {
    display: block;
    margin-bottom: 16px;
  }
  
  .editor-dialog-body label span {
    display: block;
    margin-bottom: 6px;
    font-size: 13px;
    font-weight: 500;
    color: #374151;
  }
  
  .editor-dialog-input {
    width: 100%;
    padding: 8px 12px;
    border: 1px solid #d1d5db;
    border-radius: 4px;
    font-size: 14px;
    font-family: inherit;
    box-sizing: border-box;
    transition: border-color 0.15s ease;
  }
  
  .editor-dialog-input:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
  
  .editor-dialog-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
  }
  
  .table-preview {
    margin-top: 16px;
    padding: 16px;
    background: #f9fafb;
    border: 1px solid #e5e7eb;
    border-radius: 4px;
    display: flex;
    justify-content: center;
  }
  
  #table-preview-grid {
    display: grid;
    gap: 2px;
  }
  
  .table-preview-cell {
    width: 20px;
    height: 20px;
    background: #ffffff;
    border: 1px solid #d1d5db;
    border-radius: 2px;
  }
  
  .editor-dialog-footer {
    padding: 16px 20px;
    border-top: 1px solid #e5e7eb;
    display: flex;
    justify-content: flex-end;
    gap: 8px;
  }
  
  .editor-dialog-btn {
    padding: 8px 16px;
    border: 1px solid #d1d5db;
    border-radius: 4px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.15s ease;
    font-family: inherit;
  }
  
  .editor-dialog-btn-cancel {
    background: #ffffff;
    color: #374151;
  }
  
  .editor-dialog-btn-cancel:hover {
    background: #f9fafb;
    border-color: #9ca3af;
  }
  
  .editor-dialog-btn-primary {
    background: #3b82f6;
    color: #ffffff;
    border-color: #3b82f6;
  }
  
  .editor-dialog-btn-primary:hover {
    background: #2563eb;
    border-color: #2563eb;
  }
  
  .editor-dialog-btn-danger {
    background: #ef4444;
    color: #ffffff;
    border-color: #ef4444;
  }
  
  .editor-dialog-btn-danger:hover {
    background: #dc2626;
    border-color: #dc2626;
  }
  
  /* Professional Table Context Menu */
  .table-context-menu {
    position: fixed;
    background: #ffffff;
    border: 1px solid #e5e7eb;
    border-radius: 4px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    padding: 4px;
    z-index: 9999;
    min-width: 180px;
    animation: slideDown 0.15s ease;
  }
  
  .table-context-menu-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    font-size: 13px;
    color: #374151;
    cursor: pointer;
    border-radius: 2px;
    transition: background-color 0.15s ease;
  }
  
  .table-context-menu-item:hover {
    background: #f3f4f6;
  }
  
  .table-context-menu-item-danger {
    color: #dc2626;
  }
  
  .table-context-menu-item-danger:hover {
    background: #fef2f2;
  }
  
  .table-context-menu-icon {
    width: 16px;
    text-align: center;
    font-size: 14px;
  }
  
  .table-context-menu-separator {
    height: 1px;
    background: #e5e7eb;
    margin: 4px 0;
  }
  
  /* Professional Notifications */
  .editor-notification {
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 12px 16px;
    border-radius: 4px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    font-size: 14px;
    z-index: 10001;
    opacity: 0;
    transform: translateX(100%);
    transition: all 0.3s ease;
    max-width: 300px;
  }
  
  .editor-notification-show {
    opacity: 1;
    transform: translateX(0);
  }
  
  .editor-notification-info {
    background: #3b82f6;
    color: #ffffff;
  }
  
  .editor-notification-warning {
    background: #f59e0b;
    color: #ffffff;
  }
  
  .editor-notification-error {
    background: #ef4444;
    color: #ffffff;
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
export class CkyEditorComponent implements OnInit, AfterViewInit {

  @ViewChild('editableContent', { static: false }) editableContent!: ElementRef<HTMLDivElement>;
  @ViewChild('imageInput') imageInput!: ElementRef<HTMLInputElement>;

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

  // New Features: Undo/Redo
  private history: string[] = [];
  private historyIndex: number = -1;
  private maxHistorySize: number = 50;
  canUndo: boolean = false;
  canRedo: boolean = false;

  // Word/Character Count
  wordCount: number = 0;
  characterCount: number = 0;

  // Table insertion dialog
  showTableDialog: boolean = false;
  selectedRows: number = 1;
  selectedCols: number = 1;
  maxPreviewRows: number = 10;
  maxPreviewCols: number = 10;

  constructor(private renderer: Renderer2) {}

  ngOnInit(): void {
    // Setup that doesn't require DOM access
    this.setupSelectionSaver();
  }

  ngAfterViewInit(): void {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/6700a54a-5363-4384-9a5b-d588596cdb88',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'cky-editor.component.ts:429',message:'ngAfterViewInit called',data:{editableContentExists:!!this.editableContent,contentLength:this.content?.length||0},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    if (!this.editableContent) {
      console.error('editableContent not found');
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/6700a54a-5363-4384-9a5b-d588596cdb88',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'cky-editor.component.ts:432',message:'editableContent is null',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      return;
    }
    
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/6700a54a-5363-4384-9a5b-d588596cdb88',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'cky-editor.component.ts:438',message:'Starting editor setup',data:{nativeElementExists:!!this.editableContent.nativeElement},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    this.makeContentEditable();
    this.setupAdvancedPasteHandler();
    this.setupTableContextMenu();
    this.setupUndoRedo();
    
    // Setup blur handler
    this.editableContent.nativeElement.addEventListener('blur', () => {
      this.onTouch();
    });

    // Initial content setup
    if (this.content) {
      this.editableContent.nativeElement.innerHTML = this.content;
      this.saveToHistory();
    }
    
    this.updateCounts();
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/6700a54a-5363-4384-9a5b-d588596cdb88',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'cky-editor.component.ts:452',message:'ngAfterViewInit completed',data:{contentSet:!!this.content,wordCount:this.wordCount,charCount:this.characterCount},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
  }

  private setupSelectionSaver(): void {
    document.addEventListener('mouseup', () => {
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        this.selection = selection.getRangeAt(0).cloneRange();
      }
    });
  }

  private saveSelection(): void {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      this.selection = selection.getRangeAt(0).cloneRange();
    }
  }

  private restoreSelection(): void {
    if (this.selection) {
      const selection = window.getSelection();
      if (selection) {
        selection.removeAllRanges();
        selection.addRange(this.selection);
      }
    }
  }

  makeContentEditable(): void {
    if (!this.editableContent) return;
    this.renderer.setAttribute(this.editableContent.nativeElement, 'contenteditable', 'true');
    this.renderer.setStyle(this.editableContent.nativeElement, 'min-height', '200px');
  }

  // Setup Undo/Redo functionality
  private setupUndoRedo(): void {
    if (!this.editableContent) return;
    
    // Save initial state
    this.saveToHistory();

    // Listen for keyboard shortcuts
    this.editableContent.nativeElement.addEventListener('keydown', (e: KeyboardEvent) => {
      // Ctrl+Z for undo
      if (e.ctrlKey && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        this.undo();
      }
      // Ctrl+Y or Ctrl+Shift+Z for redo
      if ((e.ctrlKey && e.key === 'y') || (e.ctrlKey && e.shiftKey && e.key === 'z')) {
        e.preventDefault();
        this.redo();
      }
    });

    // Save to history on input (with debounce)
    let timeout: any;
    this.editableContent.nativeElement.addEventListener('input', () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        this.saveToHistory();
      }, 300);
    });
  }

  private saveToHistory(): void {
    if (!this.editableContent) return;
    
    const currentContent = this.editableContent.nativeElement.innerHTML;
    
    // Don't save if content hasn't changed
    if (this.history[this.historyIndex] === currentContent) {
      return;
    }

    // Remove future history if we're in the middle
    if (this.historyIndex < this.history.length - 1) {
      this.history = this.history.slice(0, this.historyIndex + 1);
    }

    // Add to history
    this.history.push(currentContent);
    this.historyIndex++;

    // Limit history size
    if (this.history.length > this.maxHistorySize) {
      this.history.shift();
      this.historyIndex--;
    }

    this.updateUndoRedoState();
  }

  undo(): void {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/6700a54a-5363-4384-9a5b-d588596cdb88',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'cky-editor.component.ts:540',message:'undo called',data:{canUndo:this.canUndo,historyIndex:this.historyIndex,historyLength:this.history.length,editableContentExists:!!this.editableContent},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
    // #endregion
    if (!this.canUndo || !this.editableContent) {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/6700a54a-5363-4384-9a5b-d588596cdb88',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'cky-editor.component.ts:544',message:'undo: early return',data:{canUndo:this.canUndo,editableContentExists:!!this.editableContent},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      return;
    }

    this.historyIndex--;
    this.content = this.history[this.historyIndex];
    this.editableContent.nativeElement.innerHTML = this.content;
    this.onChange(this.content);
    this.updateUndoRedoState();
    this.updateCounts();
  }

  redo(): void {
    if (!this.canRedo || !this.editableContent) return;

    this.historyIndex++;
    this.content = this.history[this.historyIndex];
    this.editableContent.nativeElement.innerHTML = this.content;
    this.onChange(this.content);
    this.updateUndoRedoState();
    this.updateCounts();
  }

  private updateUndoRedoState(): void {
    this.canUndo = this.historyIndex > 0;
    this.canRedo = this.historyIndex < this.history.length - 1;
  }

  // Advanced Paste Handler
  private setupAdvancedPasteHandler(): void {
    if (!this.editableContent) return;
    
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

  // Improved content insertion method
  private insertPastedContent(content: string): void {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/6700a54a-5363-4384-9a5b-d588596cdb88',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'cky-editor.component.ts:1227',message:'insertPastedContent called',data:{contentLength:content.length,isTable:content.includes('<table'),contentPreview:content.substring(0,300)},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'F'})}).catch(()=>{});
    // #endregion
    
    if (!this.editableContent) return;
    
    // Ensure editor is focused
    this.editableContent.nativeElement.focus();
    
    // Get current selection or create range at cursor
    const selection = window.getSelection();
    let range: Range;
    
    if (selection && selection.rangeCount > 0) {
      range = selection.getRangeAt(0);
    } else {
      // Create range at end of content
      range = document.createRange();
      const editorEl = this.editableContent.nativeElement;
      range.selectNodeContents(editorEl);
      range.collapse(false);
      
      // Update selection
      if (selection) {
        selection.removeAllRanges();
        selection.addRange(range);
      }
    }

    // For tables, use direct DOM insertion to avoid execCommand corruption
    if (content.includes('<table')) {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/6700a54a-5363-4384-9a5b-d588596cdb88',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'cky-editor.component.ts:1256',message:'using direct DOM insertion for table',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'F'})}).catch(()=>{});
      // #endregion
      
      try {
        // Delete any selected content
        range.deleteContents();
        
        // Create a temporary container
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = content;
        
        // Insert each node from the temp container
        const fragment = document.createDocumentFragment();
        while (tempDiv.firstChild) {
          fragment.appendChild(tempDiv.firstChild);
        }
        
        range.insertNode(fragment);
        
        // Move cursor after inserted content
        range.collapse(false);
        
        // Update selection
        if (selection) {
          selection.removeAllRanges();
          selection.addRange(range);
        }
        
        // #region agent log
        setTimeout(() => {
          if (this.editableContent) {
            const insertedTables = this.editableContent.nativeElement.querySelectorAll('table');
            if (insertedTables.length > 0) {
              const lastTable = insertedTables[insertedTables.length - 1] as HTMLTableElement;
              const insertedRows = lastTable.rows.length;
              const insertedCols = lastTable.rows[0] ? lastTable.rows[0].cells.length : 0;
              fetch('http://127.0.0.1:7242/ingest/6700a54a-5363-4384-9a5b-d588596cdb88',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'cky-editor.component.ts:1294',message:'table after direct DOM insertion',data:{insertedRows:insertedRows,insertedCols:insertedCols},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'F'})}).catch(()=>{});
            }
          }
        }, 100);
        // #endregion
      } catch (error) {
        console.error('Error inserting table:', error);
        // Fallback to execCommand
        document.execCommand('insertHTML', false, content);
      }
    } else {
      // For non-table content, use existing method
      if (document.queryCommandSupported('insertHTML')) {
        range.deleteContents();
        document.execCommand('insertHTML', false, content);
      } else {
        range.deleteContents();
        const fragment = range.createContextualFragment(content);
        range.insertNode(fragment);
        range.collapse(false);
        if (selection) {
          selection.removeAllRanges();
          selection.addRange(range);
        }
      }
    }

    this.onContentChange();
  }

  // Comprehensive formatting method
  formatText(command: string, event?: any): void {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/6700a54a-5363-4384-9a5b-d588596cdb88',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'cky-editor.component.ts:631',message:'formatText called',data:{command,editableContentExists:!!this.editableContent,hasSelection:!!this.selection},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
    // #endregion
    // Ensure the editable area has focus
    if (!this.editableContent) {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/6700a54a-5363-4384-9a5b-d588596cdb88',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'cky-editor.component.ts:634',message:'formatText: editableContent is null',data:{command},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      return;
    }
    this.editableContent.nativeElement.focus();
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/6700a54a-5363-4384-9a5b-d588596cdb88',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'cky-editor.component.ts:638',message:'formatText: focus set, executing command',data:{command,isFocused:document.activeElement===this.editableContent.nativeElement},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
    // #endregion
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
      const result = document.execCommand(command, false);
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/6700a54a-5363-4384-9a5b-d588596cdb88',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'cky-editor.component.ts:690',message:'execCommand executed',data:{command,result},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
      // #endregion
    }

    this.onContentChange();
  }

  // ControlValueAccessor methods
  writeValue(value: string): void {
    this.content = value || '';
    if (this.editableContent) {
      this.editableContent.nativeElement.innerHTML = this.content;
      // Reset history when value is set from outside
      this.history = [this.content];
      this.historyIndex = 0;
      this.updateUndoRedoState();
      this.updateCounts();
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

      // Update word and character counts
      this.updateCounts();
    }
  }

  // Update word and character counts
  private updateCounts(): void {
    if (!this.editableContent) return;

    const text = this.editableContent.nativeElement.innerText || '';
    const words = text.trim().split(/\s+/).filter(word => word.length > 0);
    this.wordCount = text.trim() === '' ? 0 : words.length;
    this.characterCount = text.length;
  }
  // Other existing methods
  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Tab') {
      event.preventDefault();
      if (this.editableContent) {
        this.editableContent.nativeElement.focus();
      }
      document.execCommand('insertHTML', false, '&nbsp;&nbsp;&nbsp;&nbsp;');
      this.onContentChange();
    }
  }

  // Image and other existing methods remain the same as in previous implementations
  insertImage(): void {
    if (!this.imageInput) return;
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
    if (!this.editableContent) return;
    this.editableContent.nativeElement.focus();
    document.execCommand('justifyLeft', false);
    if (alignment !== 'left') {
      const command = `justify${alignment.charAt(0).toUpperCase() + alignment.slice(1)}`;
      document.execCommand(command, false);
    }
    this.onContentChange();
  }

  // Link handling
  insertLink(): void {
    if (!this.editableContent) return;
    this.editableContent.nativeElement.focus();
    this.showLinkDialog();
  }

  private showLinkDialog(): void {
    if (!this.editableContent) return;
    
    // Ensure editor is focused and selection is preserved
    this.editableContent.nativeElement.focus();
    this.saveSelection();

    // Remove any existing link dialog
    const existingDialog = document.querySelector('.link-dialog-inline');
    if (existingDialog) {
      existingDialog.remove();
    }

    // Get selection position for inline positioning
    const selection = window.getSelection();
    let position = { top: 0, left: 0 };
    
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      const editorRect = this.editableContent.nativeElement.getBoundingClientRect();
      
      // Position dialog below selection, aligned to editor
      position = {
        top: rect.bottom - editorRect.top + 8, // 8px below selection
        left: rect.left - editorRect.left
      };
      
      // If dialog would go off-screen, position above
      if (rect.bottom + 100 > window.innerHeight) {
        position.top = rect.top - editorRect.top - 50; // 50px above selection
      }
    }

    const container = this.editableContent.nativeElement.closest('.rich-editor-container') as HTMLElement;
    if (!container) return;

    const dialog = document.createElement('div');
    dialog.className = 'link-dialog-inline';
    dialog.style.top = position.top + 'px';
    dialog.style.left = position.left + 'px';
    dialog.innerHTML = `
      <input type="url" class="link-url-input" placeholder="https://example.com" autofocus>
      <button class="link-insert-btn">Insert</button>
      <button class="link-cancel-btn">Cancel</button>
    `;
    
    container.appendChild(dialog);
    const input = dialog.querySelector('.link-url-input') as HTMLInputElement;
    const insertBtn = dialog.querySelector('.link-insert-btn') as HTMLButtonElement;
    const cancelBtn = dialog.querySelector('.link-cancel-btn') as HTMLButtonElement;
    
    const close = () => {
      dialog.remove();
      // Restore focus to editor
      if (this.editableContent) {
        this.editableContent.nativeElement.focus();
      }
    };
    
    // Close on outside click
    const handleOutsideClick = (e: MouseEvent) => {
      if (!dialog.contains(e.target as Node)) {
        close();
        document.removeEventListener('click', handleOutsideClick, true);
      }
    };
    
    setTimeout(() => {
      document.addEventListener('click', handleOutsideClick, true);
    }, 10);
    
    insertBtn.onclick = (e: MouseEvent) => {
      e.stopPropagation();
      const url = input.value.trim();
      if (url) {
        // Restore selection before inserting link
        this.restoreSelection();
        if (this.editableContent) {
          this.editableContent.nativeElement.focus();
        }
        
        const finalUrl = (!url.startsWith('http://') && !url.startsWith('https://')) 
          ? 'https://' + url 
          : url;
        
        // Get current selection
        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0) {
          const range = selection.getRangeAt(0);
          const selectedText = range.toString().trim();
          
          if (selectedText) {
            // If text is selected, wrap it in a link using direct DOM manipulation
            try {
              // Extract the selected content
              const contents = range.extractContents();
              
              // Create link element
              const link = document.createElement('a');
              link.href = finalUrl;
              link.target = '_blank';
              link.rel = 'noopener noreferrer';
              link.style.color = '#2563eb';
              link.style.textDecoration = 'underline';
              link.style.cursor = 'pointer';
              
              // Move all nodes from contents into the link
              while (contents.firstChild) {
                link.appendChild(contents.firstChild);
              }
              
              // If link is empty, add the selected text
              if (!link.textContent || link.textContent.trim() === '') {
                link.textContent = selectedText;
              }
              
              // Insert the link
              range.insertNode(link);
              
              // Move cursor after the link
              range.setStartAfter(link);
              range.collapse(true);
              
              // Update selection
              selection.removeAllRanges();
              selection.addRange(range);
            } catch (error) {
              // Fallback to execCommand if direct manipulation fails
              document.execCommand('createLink', false, finalUrl);
            }
          } else {
            // If no text selected, insert link with URL as text
            const link = document.createElement('a');
            link.href = finalUrl;
            link.textContent = finalUrl;
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
            link.style.color = '#2563eb';
            link.style.textDecoration = 'underline';
            link.style.cursor = 'pointer';
            
            range.deleteContents();
            range.insertNode(link);
            range.collapse(false);
            
            if (selection) {
              selection.removeAllRanges();
              selection.addRange(range);
            }
          }
        } else {
          // Fallback: use execCommand
          document.execCommand('createLink', false, finalUrl);
        }
        
        this.onContentChange();
      }
      close();
    };
    
    cancelBtn.onclick = (e: MouseEvent) => {
      e.stopPropagation();
      document.removeEventListener('click', handleOutsideClick, true);
      close();
    };
    
    input.onkeydown = (e: KeyboardEvent) => {
      e.stopPropagation();
      if (e.key === 'Enter') {
        e.preventDefault();
        insertBtn.click();
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        document.removeEventListener('click', handleOutsideClick, true);
        close();
      }
    };
    
    // Prevent dialog clicks from closing
    dialog.onclick = (e: MouseEvent) => {
      e.stopPropagation();
    };
    
    // Focus input
    setTimeout(() => {
      input?.focus();
      input?.select();
    }, 10);
    
    // Focus input after a short delay
    setTimeout(() => {
      input?.focus();
      input?.select();
    }, 10);
  }

  // Advanced Table Editing Methods
  private setupTableContextMenu(): void {
    if (!this.editableContent) return;
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

  private showTableContextMenu(e: MouseEvent, cell: HTMLTableCellElement): void {
    this.hideTableContextMenu();

    const menu = document.createElement('div');
    menu.id = 'table-context-menu';
    menu.className = 'table-context-menu';

    const options = [
      { text: 'Add Row Above', icon: '⬆', action: () => this.addTableRow(cell, 'above') },
      { text: 'Add Row Below', icon: '⬇', action: () => this.addTableRow(cell, 'below') },
      { separator: true },
      { text: 'Add Column Left', icon: '⬅', action: () => this.addTableColumn(cell, 'left') },
      { text: 'Add Column Right', icon: '➡', action: () => this.addTableColumn(cell, 'right') },
      { separator: true },
      { text: 'Delete Row', icon: '🗑', action: () => this.deleteTableRow(cell), danger: true },
      { text: 'Delete Column', icon: '🗑', action: () => this.deleteTableColumn(cell), danger: true },
      { separator: true },
      { text: 'Delete Table', icon: '🗑', action: () => this.deleteTable(), danger: true }
    ];

    options.forEach(option => {
      if (option.separator) {
        const separator = document.createElement('div');
        separator.className = 'table-context-menu-separator';
        menu.appendChild(separator);
      } else {
        const menuItem = document.createElement('div');
        menuItem.className = `table-context-menu-item ${option.danger ? 'table-context-menu-item-danger' : ''}`;
        menuItem.innerHTML = `<span class="table-context-menu-icon">${option.icon}</span><span>${option.text}</span>`;
        menuItem.addEventListener('click', () => {
          option.action!();
        });
        menu.appendChild(menuItem);
      }
    });

    document.body.appendChild(menu);

    // Position menu
    const rect = menu.getBoundingClientRect();
    let left = e.clientX;
    let top = e.clientY;

    if (left + rect.width > window.innerWidth) {
      left = window.innerWidth - rect.width - 10;
    }
    if (top + rect.height > window.innerHeight) {
      top = window.innerHeight - rect.height - 10;
    }

    menu.style.left = `${left}px`;
    menu.style.top = `${top}px`;

    // Close menu when clicking outside
    const closeMenu = (event: MouseEvent) => {
      if (menu && !menu.contains(event.target as Node)) {
        this.hideTableContextMenu();
        document.removeEventListener('click', closeMenu);
      }
    };

    setTimeout(() => document.addEventListener('click', closeMenu), 100);
  }

  private addTableRow(cell: HTMLTableCellElement, position: 'above' | 'below'): void {
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
    this.hideTableContextMenu();
  }

  private deleteTableRow(cell: HTMLTableCellElement): void {
    const row = cell.closest('tr') as HTMLTableRowElement;
    
    // Prevent deleting the last row
    if (row.parentNode?.children.length === 1) {
      this.showNotification('Cannot delete the last row.', 'warning');
      return;
    }

    row.remove();
    this.onContentChange();
    this.hideTableContextMenu();
  }

  private addTableColumn(cell: HTMLTableCellElement, position: 'left' | 'right'): void {
    if (!this.currentTable) return;

    const cellIndex = cell.cellIndex;
    const rows = this.currentTable.rows;

    for (let i = 0; i < rows.length; i++) {
      const newCell = rows[i].insertCell(position === 'left' ? cellIndex : cellIndex + 1);
      newCell.innerHTML = '&nbsp;';
      newCell.style.border = '1px solid #e5e7eb';
      newCell.style.padding = '8px 12px';
      newCell.style.minWidth = '50px';
    }

    this.onContentChange();
    this.hideTableContextMenu();
  }

  private deleteTableColumn(cell: HTMLTableCellElement): void {
    if (!this.currentTable) return;

    const cellIndex = cell.cellIndex;
    const rows = this.currentTable.rows;

    // Prevent deleting the last column
    if (rows[0].cells.length === 1) {
      this.showNotification('Cannot delete the last column.', 'warning');
      return;
    }

    for (let i = 0; i < rows.length; i++) {
      rows[i].deleteCell(cellIndex);
    }

    this.onContentChange();
    this.hideTableContextMenu();
  }

  private deleteTable(): void {
    if (!this.currentTable) return;
    this.showDeleteTableConfirm();
  }

  private showDeleteTableConfirm(): void {
    const dialog = document.createElement('div');
    dialog.className = 'editor-dialog-overlay';
    dialog.innerHTML = `
      <div class="editor-dialog editor-dialog-small">
        <div class="editor-dialog-header">
          <h3>Delete Table</h3>
          <button class="editor-dialog-close">&times;</button>
        </div>
        <div class="editor-dialog-body">
          <p>Are you sure you want to delete this entire table? This action cannot be undone.</p>
        </div>
        <div class="editor-dialog-footer">
          <button class="editor-dialog-btn editor-dialog-btn-cancel">Cancel</button>
          <button class="editor-dialog-btn editor-dialog-btn-danger">Delete Table</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(dialog);
    const deleteBtn = dialog.querySelector('.editor-dialog-btn-danger') as HTMLButtonElement;
    const cancelBtn = dialog.querySelector('.editor-dialog-btn-cancel') as HTMLButtonElement;
    const closeBtn = dialog.querySelector('.editor-dialog-close') as HTMLButtonElement;
    
    const close = () => {
      dialog.remove();
      this.hideTableContextMenu();
    };
    
    deleteBtn.onclick = () => {
      if (this.currentTable) {
        this.currentTable.remove();
        this.currentTable = null;
        this.onContentChange();
      }
      close();
    };
    
    cancelBtn.onclick = close;
    closeBtn.onclick = close;
    
    dialog.onclick = (e: MouseEvent) => {
      if (e.target === dialog) close();
    };
  }

  private hideTableContextMenu(): void {
    const existingMenu = document.getElementById('table-context-menu');
    if (existingMenu) {
      existingMenu.remove();
    }
  }

  private showNotification(message: string, type: 'info' | 'warning' | 'error' = 'info'): void {
    const notification = document.createElement('div');
    notification.className = `editor-notification editor-notification-${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => notification.classList.add('editor-notification-show'), 10);
    setTimeout(() => {
      notification.classList.remove('editor-notification-show');
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }

  toggleTableInsertDialog(event: MouseEvent): void {
    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }
    
    const popup = document.getElementById('table-insert-popup');
    if (!popup) {
      console.error('Table popup element not found in DOM');
      return;
    }

    const isShowing = popup.classList.contains('show');
    
    if (isShowing) {
      this.cancelTableInsert();
    } else {
      this.showTableDialog = true;
      this.selectedRows = 3;
      this.selectedCols = 3;
      popup.classList.add('show');
      
      // Use requestAnimationFrame to ensure DOM is ready
      requestAnimationFrame(() => {
        this.renderTablePreview();
        this.setupTableInputs();
        setTimeout(() => {
          document.addEventListener('click', this.closeTableDialogOnOutsideClick, true);
        }, 50);
      });
    }
  }

  private renderTablePreview(): void {
    const previewGrid = document.getElementById('table-grid-preview');
    const sizeDisplay = document.getElementById('table-size-display');
    if (!previewGrid) {
      console.error('Table preview grid not found');
      return;
    }
    if (!sizeDisplay) {
      console.error('Table size display not found');
      return;
    }

    previewGrid.innerHTML = '';
    
    for (let row = 0; row < this.maxPreviewRows; row++) {
      const rowEl = document.createElement('div');
      rowEl.className = 'table-preview-row';
      
      for (let col = 0; col < this.maxPreviewCols; col++) {
        const cell = document.createElement('div');
        cell.className = 'table-preview-cell';
        const rowNum = row + 1;
        const colNum = col + 1;
        
        // Highlight cells based on current selection
        if (this.selectedRows > 0 && this.selectedCols > 0 && 
            rowNum <= this.selectedRows && colNum <= this.selectedCols) {
          cell.classList.add('highlight');
        }
        
        // Mouse enter - highlight up to this cell
        cell.addEventListener('mouseenter', (e) => {
          e.stopPropagation();
          this.selectedRows = rowNum;
          this.selectedCols = colNum;
          this.updateTablePreview();
        });
        
        // Click - insert table at selected size
        cell.addEventListener('click', (e) => {
          e.stopPropagation();
          e.preventDefault();
          // Update inputs before inserting
          const rowsInput = document.getElementById('table-rows-input') as HTMLInputElement;
          const colsInput = document.getElementById('table-cols-input') as HTMLInputElement;
          
          if (rowsInput) rowsInput.value = String(this.selectedRows);
          if (colsInput) colsInput.value = String(this.selectedCols);
          
          if (this.selectedRows > 0 && this.selectedCols > 0) {
            this.insertTableAtSize(this.selectedRows, this.selectedCols);
          }
        });
        
        rowEl.appendChild(cell);
      }
      
      previewGrid.appendChild(rowEl);
    }

    this.updateTableSizeDisplay();
    
    // Setup insert and cancel buttons - remove old listeners first
    const insertBtn = document.getElementById('table-insert-btn');
    const cancelBtn = document.getElementById('table-cancel-btn');
    
    if (insertBtn) {
      // Clone to remove old event listeners
      const newInsertBtn = insertBtn.cloneNode(true) as HTMLButtonElement;
      insertBtn.parentNode?.replaceChild(newInsertBtn, insertBtn);
      
      newInsertBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        e.preventDefault();
        // Always get current values from inputs
        const rowsInput = document.getElementById('table-rows-input') as HTMLInputElement;
        const colsInput = document.getElementById('table-cols-input') as HTMLInputElement;
        
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/6700a54a-5363-4384-9a5b-d588596cdb88',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'cky-editor.component.ts:1846',message:'insert button clicked',data:{rowsInputExists:!!rowsInput,colsInputExists:!!colsInput,rowsInputValue:rowsInput?.value,colsInputValue:colsInput?.value,selectedRows:this.selectedRows,selectedCols:this.selectedCols},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
        // #endregion
        
        let rows = 3; // default
        let cols = 3; // default
        
        if (rowsInput && rowsInput.value) {
          const inputRows = parseInt(rowsInput.value.trim());
          // #region agent log
          fetch('http://127.0.0.1:7242/ingest/6700a54a-5363-4384-9a5b-d588596cdb88',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'cky-editor.component.ts:1856',message:'reading rowsInput value',data:{rawValue:rowsInput.value.trim(),parsedRows:inputRows,isValid:!isNaN(inputRows) && inputRows > 0 && inputRows <= 20},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
          // #endregion
          if (!isNaN(inputRows) && inputRows > 0 && inputRows <= 20) {
            rows = inputRows;
          }
        } else if (this.selectedRows > 0) {
          rows = this.selectedRows;
        }
        
        if (colsInput && colsInput.value) {
          const inputCols = parseInt(colsInput.value.trim());
          // #region agent log
          fetch('http://127.0.0.1:7242/ingest/6700a54a-5363-4384-9a5b-d588596cdb88',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'cky-editor.component.ts:1865',message:'reading colsInput value',data:{rawValue:colsInput.value.trim(),parsedCols:inputCols,isValid:!isNaN(inputCols) && inputCols > 0 && inputCols <= 20},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
          // #endregion
          if (!isNaN(inputCols) && inputCols > 0 && inputCols <= 20) {
            cols = inputCols;
          }
        } else if (this.selectedCols > 0) {
          cols = this.selectedCols;
        }
        
        // Update component state
        this.selectedRows = rows;
        this.selectedCols = cols;
        
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/6700a54a-5363-4384-9a5b-d588596cdb88',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'cky-editor.component.ts:1878',message:'calling insertTableAtSize',data:{rows:rows,cols:cols,selectedRows:this.selectedRows,selectedCols:this.selectedCols},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
        // #endregion
        
        if (rows > 0 && cols > 0) {
          this.insertTableAtSize(rows, cols);
        } else {
          console.warn('Invalid table size:', rows, cols);
        }
      });
    }
    
    if (cancelBtn) {
      // Clone to remove old event listeners
      const newCancelBtn = cancelBtn.cloneNode(true) as HTMLButtonElement;
      cancelBtn.parentNode?.replaceChild(newCancelBtn, cancelBtn);
      
      newCancelBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        e.preventDefault();
        this.cancelTableInsert();
      });
    }
  }

  private setupTableInputs(): void {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/6700a54a-5363-4384-9a5b-d588596cdb88',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'cky-editor.component.ts:1899',message:'setupTableInputs called',data:{selectedRows:this.selectedRows,selectedCols:this.selectedCols},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    const rowsInput = document.getElementById('table-rows-input') as HTMLInputElement;
    const colsInput = document.getElementById('table-cols-input') as HTMLInputElement;
    
    if (rowsInput) {
      // Preserve user-typed value or use current selectedRows, or default to 3
      const currentValue = rowsInput.value.trim();
      let preservedValue: string;
      if (currentValue && !isNaN(parseInt(currentValue)) && parseInt(currentValue) > 0) {
        preservedValue = currentValue;
        // Sync component state with preserved value
        const parsedValue = parseInt(preservedValue);
        if (parsedValue > 0 && parsedValue <= 20) {
          this.selectedRows = parsedValue;
        }
      } else {
        preservedValue = String(this.selectedRows || 3);
      }
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/6700a54a-5363-4384-9a5b-d588596cdb88',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'cky-editor.component.ts:1920',message:'rowsInput before clone',data:{currentValue:currentValue,preservedValue:preservedValue,selectedRows:this.selectedRows},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      // Remove old listeners by cloning
      const newRowsInput = rowsInput.cloneNode(true) as HTMLInputElement;
      newRowsInput.value = preservedValue; // Use preserved value
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/6700a54a-5363-4384-9a5b-d588596cdb88',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'cky-editor.component.ts:1933',message:'rowsInput cloned',data:{preservedValue:preservedValue,newValue:newRowsInput.value},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      rowsInput.parentNode?.replaceChild(newRowsInput, rowsInput);
      
      newRowsInput.oninput = () => {
        const value = newRowsInput.value.trim();
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/6700a54a-5363-4384-9a5b-d588596cdb88',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'cky-editor.component.ts:1909',message:'rowsInput oninput fired',data:{value:value,selectedRows:this.selectedRows},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
        // #endregion
        if (value === '') return;
        
        const rows = parseInt(value);
        if (!isNaN(rows) && rows > 0 && rows <= 20) {
          this.selectedRows = rows;
          // #region agent log
          fetch('http://127.0.0.1:7242/ingest/6700a54a-5363-4384-9a5b-d588596cdb88',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'cky-editor.component.ts:1915',message:'rowsInput updated selectedRows',data:{rows:rows,selectedRows:this.selectedRows},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
          // #endregion
          this.updateTablePreview();
        }
      };
      
      newRowsInput.onchange = () => {
        const rows = parseInt(newRowsInput.value.trim());
        if (isNaN(rows) || rows < 1) {
          this.selectedRows = 1;
          newRowsInput.value = '1';
        } else if (rows > 20) {
          this.selectedRows = 20;
          newRowsInput.value = '20';
        } else {
          this.selectedRows = rows;
        }
        this.updateTablePreview();
      };
      
      newRowsInput.onkeydown = (e: KeyboardEvent) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          const insertBtn = document.getElementById('table-insert-btn');
          if (insertBtn) {
            insertBtn.click();
          }
        }
      };
    }
    
    if (colsInput) {
      // Preserve user-typed value or use current selectedCols, or default to 3
      const currentValue = colsInput.value.trim();
      let preservedValue: string;
      if (currentValue && !isNaN(parseInt(currentValue)) && parseInt(currentValue) > 0) {
        preservedValue = currentValue;
        // Sync component state with preserved value
        const parsedValue = parseInt(preservedValue);
        if (parsedValue > 0 && parsedValue <= 20) {
          this.selectedCols = parsedValue;
        }
      } else {
        preservedValue = String(this.selectedCols || 3);
      }
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/6700a54a-5363-4384-9a5b-d588596cdb88',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'cky-editor.component.ts:1985',message:'colsInput before clone',data:{currentValue:currentValue,preservedValue:preservedValue,selectedCols:this.selectedCols},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      // Remove old listeners by cloning
      const newColsInput = colsInput.cloneNode(true) as HTMLInputElement;
      newColsInput.value = preservedValue; // Use preserved value
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/6700a54a-5363-4384-9a5b-d588596cdb88',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'cky-editor.component.ts:1998',message:'colsInput cloned',data:{preservedValue:preservedValue,newValue:newColsInput.value},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      colsInput.parentNode?.replaceChild(newColsInput, colsInput);
      
      newColsInput.oninput = () => {
        const value = newColsInput.value.trim();
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/6700a54a-5363-4384-9a5b-d588596cdb88',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'cky-editor.component.ts:1951',message:'colsInput oninput fired',data:{value:value,selectedCols:this.selectedCols},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
        // #endregion
        if (value === '') return;
        
        const cols = parseInt(value);
        if (!isNaN(cols) && cols > 0 && cols <= 20) {
          this.selectedCols = cols;
          // #region agent log
          fetch('http://127.0.0.1:7242/ingest/6700a54a-5363-4384-9a5b-d588596cdb88',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'cky-editor.component.ts:1957',message:'colsInput updated selectedCols',data:{cols:cols,selectedCols:this.selectedCols},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
          // #endregion
          this.updateTablePreview();
        }
      };
      
      newColsInput.onchange = () => {
        const cols = parseInt(newColsInput.value.trim());
        if (isNaN(cols) || cols < 1) {
          this.selectedCols = 1;
          newColsInput.value = '1';
        } else if (cols > 20) {
          this.selectedCols = 20;
          newColsInput.value = '20';
        } else {
          this.selectedCols = cols;
        }
        this.updateTablePreview();
      };
      
      newColsInput.onkeydown = (e: KeyboardEvent) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          const insertBtn = document.getElementById('table-insert-btn');
          if (insertBtn) {
            insertBtn.click();
          }
        }
      };
    }
  }

  private updateTablePreview(): void {
    const previewGrid = document.getElementById('table-grid-preview');
    if (!previewGrid) return;

    const cells = previewGrid.querySelectorAll('.table-preview-cell');
    cells.forEach((cell, index) => {
      const row = Math.floor(index / this.maxPreviewCols) + 1;
      const col = (index % this.maxPreviewCols) + 1;
      
      if (this.selectedRows > 0 && this.selectedCols > 0 && 
          row <= this.selectedRows && col <= this.selectedCols) {
        cell.classList.add('highlight');
      } else {
        cell.classList.remove('highlight');
      }
    });

    this.updateTableSizeDisplay();
  }

  private updateTableSizeDisplay(): void {
    const sizeDisplay = document.getElementById('table-size-display');
    const rowsInput = document.getElementById('table-rows-input') as HTMLInputElement;
    const colsInput = document.getElementById('table-cols-input') as HTMLInputElement;
    
    if (sizeDisplay) {
      if (this.selectedRows > 0 && this.selectedCols > 0) {
        sizeDisplay.textContent = `${this.selectedRows} x ${this.selectedCols}`;
      } else {
        sizeDisplay.textContent = '0 x 0';
      }
    }
    
    // Update input fields if they exist
    if (rowsInput && parseInt(rowsInput.value) !== this.selectedRows) {
      rowsInput.value = String(this.selectedRows);
    }
    if (colsInput && parseInt(colsInput.value) !== this.selectedCols) {
      colsInput.value = String(this.selectedCols);
    }
  }

  private closeTableDialogOnOutsideClick = (event: MouseEvent): void => {
    const target = event.target as HTMLElement;
    const popup = document.getElementById('table-insert-popup');
    const buttonWrapper = target.closest('.table-button-wrapper');
    
    if (popup && !popup.contains(target) && !buttonWrapper) {
      this.cancelTableInsert();
    }
  }

  cancelTableInsert(): void {
    const popup = document.getElementById('table-insert-popup');
    if (popup) {
      popup.classList.remove('show');
    }
    this.showTableDialog = false;
    this.selectedRows = 0;
    this.selectedCols = 0;
    try {
      document.removeEventListener('click', this.closeTableDialogOnOutsideClick, true);
    } catch (e) {
      // Ignore if listener doesn't exist
    }
  }


  insertTableAtSize(rows: number, cols: number): void {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/6700a54a-5363-4384-9a5b-d588596cdb88',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'cky-editor.component.ts:2056',message:'insertTableAtSize called',data:{rowsParam:rows,colsParam:cols,selectedRows:this.selectedRows,selectedCols:this.selectedCols},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
    // #endregion
    // Always read from input fields to get the actual user-entered values
    const rowsInput = document.getElementById('table-rows-input') as HTMLInputElement;
    const colsInput = document.getElementById('table-cols-input') as HTMLInputElement;
    
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/6700a54a-5363-4384-9a5b-d588596cdb88',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'cky-editor.component.ts:2059',message:'insertTableAtSize reading inputs',data:{rowsInputExists:!!rowsInput,colsInputExists:!!colsInput,rowsInputValue:rowsInput?.value,colsInputValue:colsInput?.value},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
    // #endregion
    
    let finalRows = Math.floor(rows) || 3;
    let finalCols = Math.floor(cols) || 3;
    
    // Prefer input values over passed parameters
    if (rowsInput && rowsInput.value) {
      const inputRows = parseInt(rowsInput.value.trim());
      if (!isNaN(inputRows) && inputRows > 0 && inputRows <= 20) {
        finalRows = inputRows;
      }
    }
    
    if (colsInput && colsInput.value) {
      const inputCols = parseInt(colsInput.value.trim());
      if (!isNaN(inputCols) && inputCols > 0 && inputCols <= 20) {
        finalCols = inputCols;
      }
    }
    
    // Final validation
    finalRows = Math.max(1, Math.min(20, finalRows));
    finalCols = Math.max(1, Math.min(20, finalCols));
    
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/6700a54a-5363-4384-9a5b-d588596cdb88',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'cky-editor.component.ts:2080',message:'insertTableAtSize creating table',data:{finalRows:finalRows,finalCols:finalCols},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
    // #endregion
    
    // Focus editor before inserting
    if (this.editableContent) {
      this.editableContent.nativeElement.focus();
    }
    
    const table = document.createElement('table');
    table.style.width = '100%';
    table.style.borderCollapse = 'collapse';
    table.style.border = '1px solid #e5e7eb';

    for (let i = 0; i < finalRows; i++) {
      const row = table.insertRow();
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/6700a54a-5363-4384-9a5b-d588596cdb88',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'cky-editor.component.ts:2171',message:'creating table row',data:{rowIndex:i,finalRows:finalRows,finalCols:finalCols},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'E'})}).catch(()=>{});
      // #endregion
      for (let j = 0; j < finalCols; j++) {
        const cell = row.insertCell();
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/6700a54a-5363-4384-9a5b-d588596cdb88',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'cky-editor.component.ts:2173',message:'creating table cell',data:{rowIndex:i,colIndex:j,finalRows:finalRows,finalCols:finalCols},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'E'})}).catch(()=>{});
        // #endregion
        cell.style.border = '1px solid #e5e7eb';
        cell.style.padding = '8px 12px';
        cell.style.minWidth = '50px';
        cell.innerHTML = '&nbsp;';
      }
    }

    // Verify table structure before insertion
    const actualRows = table.rows.length;
    const actualCols = table.rows[0] ? table.rows[0].cells.length : 0;
    const tableHTML = table.outerHTML;
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/6700a54a-5363-4384-9a5b-d588596cdb88',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'cky-editor.component.ts:2186',message:'table created, verifying structure',data:{finalRows:finalRows,finalCols:finalCols,actualRows:actualRows,actualCols:actualCols,tableHTMLLength:tableHTML.length,tableHTMLPreview:tableHTML.substring(0,300)},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'E'})}).catch(()=>{});
    // #endregion

    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/6700a54a-5363-4384-9a5b-d588596cdb88',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'cky-editor.component.ts:2193',message:'calling insertPastedContent with table',data:{tableHTMLLength:tableHTML.length},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'F'})}).catch(()=>{});
    // #endregion
    this.insertPastedContent(tableHTML);
    
    // Verify table after insertion
    setTimeout(() => {
      if (this.editableContent) {
        const insertedTables = this.editableContent.nativeElement.querySelectorAll('table');
        if (insertedTables.length > 0) {
          const lastTable = insertedTables[insertedTables.length - 1] as HTMLTableElement;
          const insertedRows = lastTable.rows.length;
          const insertedCols = lastTable.rows[0] ? lastTable.rows[0].cells.length : 0;
          // #region agent log
          fetch('http://127.0.0.1:7242/ingest/6700a54a-5363-4384-9a5b-d588596cdb88',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'cky-editor.component.ts:2202',message:'table after insertion verification',data:{insertedRows:insertedRows,insertedCols:insertedCols,expectedRows:finalRows,expectedCols:finalCols},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'F'})}).catch(()=>{});
          // #endregion
        }
      }
    }, 100);
    
    this.cancelTableInsert();
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
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/6700a54a-5363-4384-9a5b-d588596cdb88',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'cky-editor.component.ts:1016',message:'applyFormat called',data:{format,editableContentExists:!!this.editableContent},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
    // #endregion
    if (!this.editableContent) {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/6700a54a-5363-4384-9a5b-d588596cdb88',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'cky-editor.component.ts:1018',message:'applyFormat: editableContent is null',data:{format},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      return;
    }
    this.editableContent.nativeElement.focus();
    this.formatText(format);
  }

  // Source code view toggle
  toggleSourceView(): void {
    if (!this.editableContent) return;
    this.isSourceView = !this.isSourceView;
    if (this.isSourceView) {
      const content = this.editableContent.nativeElement.innerHTML;
      this.editableContent.nativeElement.textContent = content;
      this.renderer.setAttribute(this.editableContent.nativeElement, 'contenteditable', 'false');
    } else {
      const content = this.editableContent.nativeElement.textContent || '';
      this.editableContent.nativeElement.innerHTML = content;
      this.renderer.setAttribute(this.editableContent.nativeElement, 'contenteditable', 'true');
      this.onContentChange();
    }
  }

  // Export to Word Document
  exportToWord(): void {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/6700a54a-5363-4384-9a5b-d588596cdb88',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'cky-editor.component.ts:1039',message:'exportToWord called',data:{hasContent:!!this.content,contentLength:this.content?.length||0,editableContentExists:!!this.editableContent},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
    // #endregion
    if (!this.content) {
      alert('No content to export!');
      return;
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Document</title>
        </head>
        <body>
          ${this.content || ''}
        </body>
      </html>
    `;

    const blob = new Blob(['\ufeff', htmlContent], {
      type: 'application/msword'
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'document.doc';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  // Export to PDF (using browser print to PDF)
  exportToPDF(): void {
    if (!this.content) {
      alert('No content to export!');
      return;
    }

    const pdfWindow = window.open('', '_blank');
    if (!pdfWindow) {
      alert('Please allow popups to export PDF');
      return;
    }

    pdfWindow.document?.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Export PDF</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 20px;
              max-width: 800px;
              margin: 0 auto;
            }
            @media print {
              body { margin: 0; padding: 15px; }
            }
          </style>
        </head>
        <body>
          ${this.content || ''}
        </body>
      </html>
    `);

    pdfWindow.document?.close();
    setTimeout(() => {
      if (pdfWindow && !pdfWindow.closed) {
        pdfWindow.print();
      }
    }, 250);
  }

  // Print content
  printContent(): void {
    if (!this.content) {
      alert('No content to print!');
      return;
    }

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow popups to print');
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Print Document</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 20px;
              max-width: 800px;
              margin: 0 auto;
            }
            @media print {
              body { margin: 0; padding: 15px; }
              @page { margin: 1cm; }
            }
          </style>
        </head>
        <body>
          ${this.content || ''}
        </body>
      </html>
    `);

    printWindow.document.close();
    setTimeout(() => {
      if (printWindow) {
        printWindow.print();
      }
    }, 250);
  }
}
