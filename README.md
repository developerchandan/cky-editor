# **CKY-Editor**

CKY-Editor is a lightweight, flexible, and feature-rich **Rich Text Editor** built specifically for **Angular 16** applications. Designed with simplicity and flexibility in mind, CKY-Editor provides developers with a seamless, easy-to-integrate solution for adding rich text editing functionality to their projects. Whether you’re building a CMS, blog, or any other application requiring text formatting, CKY-Editor offers a robust and reliable toolset to meet your needs.

## **Features**
- 🌟 **Rich Formatting Options**:
  - Support for **bold**, **italic**, **underline**, **strikethrough**, and more.
  - Text alignment (left, center, right, justify).
  - Create ordered and unordered lists.
  - Hyperlink insertion for easy navigation.
  - Media embedding for images, videos, and rich content.

- ⚙️ **Customizable Toolbar**:
  - Modify the toolbar to include or exclude tools based on your application’s requirements.

- ⚡ **Angular 16 Compatible**:
  - Fully optimized for Ivy rendering and Angular's latest architecture.

- 🖼️ **Media Embedding**:
  - Add and manage images, videos, and other multimedia assets easily.

- 📱 **Responsive Design**:
  - Works flawlessly on mobile, tablet, and desktop devices.

- 🧩 **Plug-and-Play**:
  - Install, configure, and start using CKY-Editor with minimal effort.

- 🌐 **Cross-Browser Compatibility**:
  - Tested and compatible with modern browsers like Chrome, Firefox, Edge, and Safari.

## **Why Use CKY-Editor?**
- Simplifies content creation for end-users with an intuitive interface.
- Saves development time with pre-built, ready-to-use editing features.
- Provides an extensible API for custom use cases and advanced requirements.
- Lightweight and performant for smooth production-grade performance.

## **Installation**

To install CKY-Editor, use npm:

`npm install cky-editor`

# Usage

# Step 1: Import CKY-Editor Module
Import CKYEditorModule into your Angular application:

// app.module.ts
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { CKYEditorModule } from 'cky-editor';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    CKYEditorModule // Import the module here
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}

# Step 2: Add the CKY-Editor Component
Use the CKY-Editor in your HTML file:
<cky-editor [(ngModel)]="content"></cky-editor>


# Step 3: Bind the Editor to a Variable
Bind the editor to a variable in your component:
// app.component.ts
import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  content: string = ''; // Bind this to the editor
}

# Authors
Chandan Kumar & Anand Prakash : Project Lead & Primary Developer.

# Contributors

Thanks to the following people for contributing to this project:

Anand Prakash

# License
This project is licensed under the MIT License. See the LICENSE file for details.

# Support
For support or questions, feel free to:

Open an issue in the GitHub Issues section.
Email us at chandan.ydv498@gmail.com.com.

# Acknowledgments
Inspired by modern content editing tools.
Special thanks to the Angular community for their guidance.

```bash
