import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { ActivatedRoute ,Router } from '@angular/router';
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
  selector: 'tvq-show-list',
  templateUrl: './show-list.component.html',
  styleUrls: ['./show-list.component.scss'],
  animations: [
    trigger('collapse-y-minus', [
      state('open-y', style({
        opacity: '1',
        display: 'block',
        transform: 'translate3d(0, 0, 0)'
      })),
      state('closed-y',   style({
        opacity: '0',
        display: 'none',
        transform: 'translate3d(0, -100%, 0)'
      })),
      transition('closed-y => open-y', animate('400ms ease-in')),
      transition('open-y => closed-y', animate('400ms ease-out'))
    ]),
    trigger('collapse-y-plus', [
      state('open-y', style({
        opacity: '1',
        display: 'block',
        transform: 'translate3d(0, 0, 0)'
      })),
      state('closed-y',   style({
        opacity: '0',
        display: 'none',
        transform: 'translate3d(0, 100%, 0)'
      })),
      transition('closed-y => open-y', animate('400ms ease-in')),
      transition('open-y => closed-y', animate('400ms ease-out'))
    ]),
    trigger('collapse-x-plus', [
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
    ])
  ],
  host: { '[@collapse-y-minus]': 'displayShows_y','[@collapse-x-minus]': 'displayShows_x' }
})
export class ShowListComponent implements OnInit {

  globalSettings: Settings;
  searchList: SearchModel[];
  showList: any[];
  selectedShow: any;
  constructor(private logger: LoggerService,
    private settingSvc: SettingsService,
    private dropboxSvc: DropboxService,
    private cmnSvc: CommonService,
    private showSvc: ShowsService,
    private datePipe: DatePipe,
    private router: Router
  ) {
    this.globalSettings = new Settings();
    this.showList = [

    ];
  }

  redirect() {
    this.router.navigate(['./popup/search-list']);
  }

  async ngOnInit() {
    this.globalSettings = await this.settingSvc.getSettings();
    this.logger.log('options', this.globalSettings);
    this.showSvc
        .getShowList()
        .subscribe(data => {
          const clone = data;
            // const clone: ShowModel[] = JSON.parse(JSON.stringify(data));
            const show_group = {};
            const show_group_order = ['Running', 'TBA', 'Completed'];
            const third_length = Math.ceil(clone.length / 3);
            // console.log(third_length,data.length);
            this.showList.push(...
              clone.filter(s => !!s.next_episode)
                .sort((a, b) => {
                    const x = a.next_episode.local_showtime;
                    const y = b.next_episode.local_showtime;
                    return ((x < y) ? -1 : ((x > y) ? 1 : 0));
                })
              );

              this.showList.push(...
                 clone.filter(s => !s.next_episode &&
                !(s.status || '').match(/Pilot.?Rejected|Cancell?ed\/Ended|Cancell?ed|Ended/i))
                .sort((a, b) => {
                    const x = (b.previous_episode || b.last_episode || { local_showtime: null }).local_showtime;
                    const y = (a.previous_episode || a.last_episode || { local_showtime: null }).local_showtime;
                    return ((x < y) ? -1 : ((x > y) ? 1 : 0));
                })
              );

              this.showList.push(...
                 clone.filter(s => !s.next_episode &&
                (s.status || '').match(/Pilot.?Rejected|Cancell?ed\/Ended|Cancell?ed|Ended/i))
                .sort((a, b) => {
                    const x = (b.last_episode || { local_showtime: null }).local_showtime;
                    const y = (a.last_episode || { local_showtime: null }).local_showtime;
                    return ((x < y) ? -1 : ((x > y) ? 1 : 0));
                })
              );
        },
        error => console.log(error)
        );

    
  }
}
