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

import { LoggerService, SettingsService, DropboxService , ShowsService,  CommonService} from '../../providers';
import { Settings , ShowModel, SearchModel } from '../../models';

@Component({
  selector: 'tvq-popupepisode-list',
  templateUrl: './episode-list.component.html',
  styleUrls: ['./episode-list.component.scss'],
  animations: [trigger('collapse-x-plus', [
    state('open-x', style({
      opacity: '1',
      display: 'block',
      transform: 'translate3d(0, 0, 0)'
    })),
    state('closed-x',   style({
      opacity: '0',
      display: 'none',
      transform: 'translate3d(100%, 0, 0)'
    })),
    transition('closed-x => open-x', animate('400ms ease-in')),
    transition('open-x => closed-x', animate('200ms ease-out'))
  ]),
  trigger('collapse-x-minus', [
    state('open-x', style({
      opacity: '1',
      display: 'block',
      transform: 'translate3d(0, 0, 0)'
    })),
    state('closed-x',   style({
      opacity: '0',
      display: 'none',
      transform: 'translate3d(-100%, 0, 0)'
    })),
    transition('closed-x => open-x', animate('400ms ease-in')),
    transition('open-x => closed-x', animate('200ms ease-out'))
  ])],
  host: { '[@collapse-x-plus]': 'displayEpisode' }
})
export class PopupEpisodeListComponent implements OnInit {
  selectedShow;
  displayEpisode;
  displayShows_x;
  constructor(private logger: LoggerService,
    private settingSvc: SettingsService,
    private dropboxSvc: DropboxService,
    private cmnSvc: CommonService,
    private showSvc: ShowsService,
    private datePipe: DatePipe
  ) {
    
  }

  ngOnInit() {
  }
}
