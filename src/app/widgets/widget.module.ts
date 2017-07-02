import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { TestComponent } from './test.component';
import { SwitchComponent } from './switch/switch.component';
import { DialogBoxComponent } from './dialog-box';

import { InputTextModule,
         ButtonModule,
         TabViewModule } from 'primeng/primeng';

const componenets = [
  TestComponent,
  SwitchComponent,
  DialogBoxComponent
];

@NgModule({
  imports: [
      CommonModule,
      FormsModule,
      InputTextModule,
      ButtonModule,
      TabViewModule
      ],
  declarations: componenets,
  exports:      componenets,
  providers:    [  ]
})
export class WidgetModule { }
