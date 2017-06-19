import { Component, OnInit } from '@angular/core';
import { AbstractValueAccessor, MakeProvider } from '../abstract-value-accessor';

let switchCounter: number = 0;

@Component({
  selector: 'tvq-switch',
  templateUrl: './switch.component.html',
  styleUrls: ['./switch.component.scss'],
  providers: [MakeProvider(SwitchComponent)]
})
export class SwitchComponent extends AbstractValueAccessor<boolean> implements OnInit {
  title = 'tvq switch works!';
  id: string;
  constructor() {
    super();
    this.id = `switch${switchCounter++}`;
  }
  // https://proto.io/freebies/onoff/
  ngOnInit() {
    // console.log(this.title);
  }

  getDefault() {
    return false;
  }

}
