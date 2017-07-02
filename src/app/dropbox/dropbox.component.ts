import { Component, OnInit } from '@angular/core';
import { Dropbox } from '../lib';

@Component({
  selector: 'tvq-dropbox',
  templateUrl: './dropbox.component.html'
})
export class DropboxComponent implements OnInit {
  title = 'tvq dropbox works!';

  ngOnInit() {
    console.log('tvq-dropbox', this.title, window.location);
    Dropbox.captureResponse(window.location);
  }
}
