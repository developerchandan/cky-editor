# **CKY-Editor v2.1.0** 🚀

CKY-Editor is a lightweight, flexible, and feature-rich **Rich Text Editor** built specifically for **Angular 21** applications. Designed with simplicity and flexibility in mind, CKY-Editor provides developers with a seamless, easy-to-integrate solution for adding rich text editing functionality to their projects. Whether you're building a CMS, blog, or any other application requiring text formatting, CKY-Editor offers a robust and reliable toolset to meet your needs.

## 🎉 **What's New in v2.1.0**

### ✨ New Features
- 🔲 **Insert Table** - Interactive row/column grid picker to insert tables directly into content
- 🔄 **Undo/Redo Functionality** - Full history management with keyboard shortcuts (Ctrl+Z, Ctrl+Y)
- 📄 **Export to Word** - Export your content as a .doc file
- 📑 **Export to PDF** - Convert and download your content as PDF
- 🖨️ **Print Support** - Print your content directly from the editor
- 📊 **Word & Character Count** - Real-time word and character counting
- 🎨 **Enhanced UI** - Improved toolbar with better organization
- ⚡ **Better Performance** - Optimized for Angular 21 with improved rendering

### 🔧 Technical Updates
- ✅ Upgraded from Angular 16 to Angular 21
- ✅ Enhanced TypeScript support
- ✅ Improved component architecture
- ✅ Better error handling
- ✅ Optimized bundle size

## **Features**

### 🌟 **Rich Formatting Options**
- Support for **bold**, **italic**, **underline**, **strikethrough**, and more
- Text alignment (left, center, right, justify)
- Create ordered and unordered lists
- Hyperlink insertion for easy navigation
- Media embedding for images, videos, and rich content
- Font family and size selection
- Text and background color pickers

### 🆕 **Advanced Features (v2.0.0)**
- **Undo/Redo** - Full command history with 50-state undo/redo
- **Export Options** - Export to Word (.doc) and PDF formats
- **Print Functionality** - Print your content with formatting
- **Word/Character Counter** - Real-time count display
- **Source Code View** - Toggle between WYSIWYG and HTML view

### ⚙️ **Customizable Toolbar**
- Modify the toolbar to include or exclude tools based on your application's requirements
- Responsive design that adapts to different screen sizes
- Keyboard shortcuts support

### ⚡ **Angular 21 Compatible**
- Fully optimized for Angular 21's latest architecture
- Uses modern Angular features and best practices
- Ivy rendering engine optimized

### 🖼️ **Media Embedding**
- Add and manage images easily
- Support for multiple image formats
- Image upload and paste support
- Table creation and editing with context menu

### 📱 **Responsive Design**
- Works flawlessly on mobile, tablet, and desktop devices
- Touch-friendly interface
- Adaptive toolbar layout

### 🧩 **Plug-and-Play**
- Install, configure, and start using CKY-Editor with minimal effort
- Simple integration with Angular forms
- Full support for ngModel and reactive forms

### 🌐 **Cross-Browser Compatibility**
- Tested and compatible with modern browsers like Chrome, Firefox, Edge, and Safari
- Consistent behavior across all platforms

## **Why Use CKY-Editor?**

- ✨ Simplifies content creation for end-users with an intuitive interface
- ⏱️ Saves development time with pre-built, ready-to-use editing features
- 🔌 Provides an extensible API for custom use cases and advanced requirements
- 🚀 Lightweight and performant for smooth production-grade performance
- 📦 Zero external dependencies (except Font Awesome for icons)
- 🎯 Built specifically for Angular 21 with modern best practices

## **Installation**

To install CKY-Editor, use npm:

```bash
npm install cky-editor
```

Don't forget to install Font Awesome for icons:

```bash
npm install @fortawesome/fontawesome-free
```

## **Demo**

A runnable example app lives in [`demo/`](./demo). To try it locally:

```bash
cd demo
npm install
npm start
```

Then open `http://localhost:4200`.

## **Usage**

### Step 1: Import CKY-Editor Module

Import `CKYEditorModule` into your Angular application:

```typescript
// app.module.ts
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { CKYEditorModule } from 'cky-editor';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    FormsModule,
    CKYEditorModule // Import the module here
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
```

### Step 2: Add Font Awesome CSS

Add Font Awesome styles to your `index.html`:

```html
<link rel="stylesheet" href="node_modules/@fortawesome/fontawesome-free/css/all.min.css">
```

Or import in your `styles.css`:

```css
@import '@fortawesome/fontawesome-free/css/all.min.css';
```

### Step 3: Add the CKY-Editor Component

Use the CKY-Editor in your HTML file:

```html
<lib-cky-editor [(ngModel)]="content"></lib-cky-editor>
```

### Step 4: Bind the Editor to a Variable

Bind the editor to a variable in your component:

```typescript
// app.component.ts
import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  content: string = '<p>Welcome to CKY Editor!</p>'; // Bind this to the editor
}
```

## **Keyboard Shortcuts**

- `Ctrl + Z` - Undo last action
- `Ctrl + Y` or `Ctrl + Shift + Z` - Redo last action
- `Ctrl + B` - Bold text
- `Ctrl + I` - Italic text
- `Ctrl + U` - Underline text
- `Tab` - Insert indentation

## **API Reference**

### Component Selector
```html
<lib-cky-editor [(ngModel)]="content"></lib-cky-editor>
```

### Input Properties
- `[(ngModel)]` - Two-way binding for editor content (string)

### Methods (Access via ViewChild)
- `undo()` - Undo last action
- `redo()` - Redo last action
- `exportToWord()` - Export content to Word document
- `exportToPDF()` - Export content to PDF
- `printContent()` - Print the content

## **Examples**

### Basic Usage
```html
<lib-cky-editor [(ngModel)]="myContent"></lib-cky-editor>
```

### With Reactive Forms
```typescript
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';

export class MyComponent {
  myForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.myForm = this.fb.group({
      content: ['']
    });
  }
}
```

```html
<form [formGroup]="myForm">
  <lib-cky-editor formControlName="content"></lib-cky-editor>
</form>
```

## **Changelog**

### v2.1.0 (Latest)
- ✨ Added Insert Table feature with interactive row/column grid picker
- 📁 Added a runnable `demo/` Angular app showcasing the editor

### v2.0.0
- ✨ Added Undo/Redo functionality
- ✨ Added Export to Word feature
- ✨ Added Export to PDF feature
- ✨ Added Print functionality
- ✨ Added Word/Character counter
- 🔧 Upgraded to Angular 21
- 🐛 Fixed various bugs
- 📚 Updated documentation

### v1.0.0
- 🎉 Initial release
- Basic rich text editing features
- Angular 16 support

## **Authors**

**Chandan Kumar** - Project Lead & Primary Developer

## **Contributors**

Thanks to the following people for contributing to this project:
- Anand Prakash
- Sohrab ALI

## **License**

This project is licensed under the MIT License. See the LICENSE file for details.

## **Support**

For support or questions, feel free to:

- 📝 Open an issue in the [GitHub Issues](https://github.com/developerchandan/cky-editor/issues) section
- 📧 Email us at chandan.ydv498@gmail.com

## **Contributing**

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## **Acknowledgments**

- Inspired by modern content editing tools
- Special thanks to the Angular community for their guidance
- Built with ❤️ using Angular 21

---

**CKY-Editor** - Powerful Rich Text Editor for Angular 21 🚀
