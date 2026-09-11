import { NgModule } from '@angular/core';
import { CkyEditorComponent } from './cky-editor.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';



@NgModule({
  declarations: [
    CkyEditorComponent
  ],
  imports: [
    FormsModule,
    CommonModule,
    ReactiveFormsModule
  ],
  exports: [
    CkyEditorComponent
  ]
})
export class CkyEditorModule { }
