import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { DatePipe } from '@angular/common';

import {
    SettingsService,
    ShowsService } from '../providers';

import { ShowModel } from '../models';
import { DialogBoxComponent } from '../widgets';

declare const jQuery: any;

@Component({
  selector: 'tvq-show-detail',
  templateUrl: 'show-detail.component.html',
  styleUrls: ['show-detail.component.scss']
})
export class ShowDetailComponent implements OnInit {
    @Input() show: ShowModel;

    constructor(private showSvc: ShowsService) { }

    ngOnInit() {

    }

    NextShowInDays(show: ShowModel) {
       return this.showSvc.nextShowTime(show);
    }

    imgError(event) {
        // console.log('imgError', event);
        event.target.src = '/assets/banner.png';
    }
}
