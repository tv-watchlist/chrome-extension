import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'tvq-test',
  templateUrl: './test.component.html'
})
export class TestComponent implements OnInit {
  ngOnInit() {
    console.log('Test Component');
  }
}
