import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { ActivatedRoute } from '@angular/router';
import { DatePipe } from '@angular/common';
import { Headers, Http } from '@angular/http';
import {
  trigger,
  state,
  style,
  animate,
  transition
} from '@angular/animations';

import { LoggerService, SettingsService, DropboxService , ShowsService,  CommonService} from '../providers';
import { Settings , ShowModel, SearchModel } from '../models';

//http://jasonwatmore.com/post/2017/04/19/angular-2-4-router-animation-tutorial-example

@Component({
  selector: 'tvq-popup',
  templateUrl: './popup.component.html',
  styleUrls: ['./popup.component.scss']
})
export class PopupComponent implements OnInit {

  ngOnInit() {
  }
}
