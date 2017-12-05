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
import { Settings , ShowModel} from '../models';
import { SearchModel } from '../models/search.model';


@Component({
  selector: 'tvq-popup',
  templateUrl: './popup.component.html',
  styleUrls: ['./popup.component.scss'],
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
  ]
})
export class PopupComponent implements OnInit {

  globalSettings: Settings;
  searchList: SearchModel[];
  showList: any[];
  displaySearch: string;
  displayShows_x: string;
  displayShows_y: string;
  displayEpisode: string;
  selectedShow: any;
  constructor(private logger: LoggerService,
    private settingSvc: SettingsService,
    private dropboxSvc: DropboxService,
    private cmnSvc: CommonService,
    private showSvc: ShowsService,
    private datePipe: DatePipe
  ) {
    this.globalSettings = new Settings();
    this.displaySearch = 'closed-y';
    this.displayShows_y = 'open-y';

    this.displayShows_x = 'open-x';
    this.displayEpisode = 'closed-x';
    this.showList = [

    ];
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

    this.searchList = [
      {
        channel: 'MBS',
        poster: 'http://static.tvmaze.com/uploads/images/original_untouched/35/89240.jpg',
        showId: 10582,
        apiId: 'tvmaze',
        showName: 'Ben-To',
        showStatus: 'Ended',
        showTime: '2011-10-09, Sunday 03:28',
        showUrl: 'http://www.tvmaze.com/shows/10582/ben-to',
        summary: `<p> Sato Yo is a high school boy who likes SEGA games. One day, he enters a grocery store to buy
      some food for dinner. When he tries to take a bento box, he loses consciousness. He comes
      around to find all the bento sold out. He notices there is a war game going on at grocery
      stores and players called "Wolves" compete for the half-priced bento. Yarizui Sen, the leader
      of the Half-Pricer Club, forces Yo to join the club and he enters the bento war.
  </p>` },
      {
        channel: 'ABC',
        poster: 'http://static.tvmaze.com/uploads/images/original_untouched/57/144780.jpg',
        showId: 17183,
        apiId: 'tvmaze',
        showName: 'Ben Casey',
        showStatus: 'Ended',
        showTime: '1961-10-02',
        showUrl: 'http://www.tvmaze.com/shows/10582/ben-to',
        summary: `<p><b>Ben Casey</b> was a medical drama series that aired on ABC from 1961-1966.</p>`
      },

      {
        channel: 'Syndication',
        poster: 'http://static.tvmaze.com/uploads/images/original_untouched/127/317951.jpg',
        showId: 31712,
        apiId: 'tvmaze',
        showName: 'Pickler &amp; Ben',
        showStatus: 'In Development',
        showTime: '2017-09-18, Monday, Tuesday, Wednesday, Thursday, Friday 13:00',
        showUrl: 'http://www.tvmaze.com/shows/31712/pickler-ben',
        summary: `<p>
  <b>Pickler &amp; Ben</b> is daytime's newest "go-to" destination for the best in lifestyle
  and entertainment television. Hosted by country music star Kellie Pickler and Emmy-winning
  television personality Ben Aaron, "P&amp;B" tapes in Nashville, Tennessee on an expansive,
  modern farmhouse-styled set and features today's top celebrities and tastemakers on entertaining,
  cooking, decorating, gardening and beauty. "P&amp;B" also shares the inspiring stories
  of everyday people doing the extraordinary.</p>` },
      {
        channel: 'Comedy Central',
        poster: 'http://static.tvmaze.com/uploads/images/original_untouched/32/82443.jpg',
        showId: 9349,
        apiId: 'tvmaze',
        showName: 'The Ben Show with Ben Hoffman',
        showStatus: 'Ended',
        showTime: '2013-02-28, Thursday 22:00',
        showUrl: 'http://www.tvmaze.com/shows/9349/the-ben-show-with-ben-hoffman',
        summary: `<p>Life is a journey for Ben Hoffman, and he needs a lot of help navigating it. The comedian
                                    stars in a sketch show/man-on-the-street hybrid that sees him exploring the randomness
                                    of everyday existence. In each episode he sets a goal -- examples: Form a band. Buy a
                                    gun. Go on a blind date. -- and works toward it with the help of advice from family members,
                                    friends and complete strangers. The journeys interweave vignettes as well as sketches,
                                    and there are also original songs and animated pieces.
                                </p>` }
    ];
  }
}
