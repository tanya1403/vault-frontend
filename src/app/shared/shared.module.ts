import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoaderComponent } from './components/loader/loader.component';
import { ToastComponent } from './components/toast/toast.component';

@NgModule({
  declarations: [
    LoaderComponent,
    ToastComponent
  ],
  imports: [
    CommonModule
  ],
  exports: [
    LoaderComponent,
    ToastComponent
  ]
})
export class SharedModule { }

