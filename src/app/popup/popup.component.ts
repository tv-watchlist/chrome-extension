import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'tvq-popup',
  templateUrl: './popup.component.html',
  styleUrls: ['./popup.component.scss']
})
export class PopupComponent implements OnInit {
  title = 'tvq popup works!';

  ngOnInit() {
    console.log(this.title);
  }
}
