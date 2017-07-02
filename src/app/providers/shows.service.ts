import { Injectable, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { ShowModel, Settings } from '../models';

import { CommonService } from './';

const mytvdb = require('../../assets/tv-watchlist-db.json');

@Injectable()
export class ShowsService {
    constructor(
        private cmnSvc: CommonService,
        private datePipe: DatePipe) { }

    getShowList(): Observable<ShowModel[]> {
        return Observable.create((observer) => {
            observer.next(mytvdb.show_list);
            observer.complete();
        });
    }

    nextShowTime(show: ShowModel) {
        return this.cmnSvc.DaysBetweenToEnglish(new Date(), !!show.next_episode ? new Date(show.next_episode.local_showtime) : null);
    }

    GetShowStatus(show: ShowModel) {
        const EndedRegex = /Pilot.?Rejected|Cancell?ed\/Ended|Cancell?ed|Ended/i;
        if ((show.status || '').match(EndedRegex)) {
            return -1; // Completed
        }
        const episode = show.next_episode || show.last_episode;
        // console.log(show, episode);
        const now = new Date().getTime();
        if (!!episode && !!episode.local_showtime && episode.local_showtime > now) {
            return 0; // Running
        } else {
            return 1; // TBA
        }
    }

    GetShowStatusText(show: ShowModel, settings: Settings) {
        const status = this.GetShowStatus(show);
        let statusTxt = (status === -1) ? 'Completed' : 'TBA';

        const offset_next_date = !!show.next_episode ? new Date(show.next_episode.local_showtime) : null;
        const offset_prev_date = !!show.previous_episode ? new Date(show.previous_episode.local_showtime) : null;
        const offset_last_date = !!show.last_episode ? new Date(show.last_episode.local_showtime) : null;

        const timezone_offset = settings.timezone_offset || {};
        if (show.channel && show.channel.country && timezone_offset[show.channel.country.name]) {
            if (!!offset_next_date) {
                offset_next_date.setMinutes(offset_next_date.getMinutes() + (60 * Number(timezone_offset[show.channel.country.name])));
            }
            if (!!offset_prev_date) {
                offset_prev_date.setMinutes(offset_prev_date.getMinutes() + (60 * Number(timezone_offset[show.channel.country.name])));
            }
            if (!!offset_last_date) {
                offset_last_date.setMinutes(offset_last_date.getMinutes() + (60 * Number(timezone_offset[show.channel.country.name])));
            }
        }

        if (status === 0 && !!show.next_episode) {
            statusTxt = this.datePipe.transform(offset_next_date, 'EEE hh:mm a, MMM dd, y');
        }
        return statusTxt;
    }
}
