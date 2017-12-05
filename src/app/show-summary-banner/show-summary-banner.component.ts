import { Component, OnChanges, Input, Output, EventEmitter, ViewEncapsulation, SimpleChanges } from '@angular/core';
import { Settings, ShowModel, EpisodeModel } from '../models';
import { DatePipe } from '@angular/common';
import {
  SettingsService,
  ShowsService
} from '../providers';
import { read } from 'fs';

let ssbCounter = 0;

@Component({
  selector: 'tvq-show-summary-banner',
  templateUrl: './show-summary-banner.component.html',
  styleUrls: ['./show-summary-banner.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ShowSummaryBannerComponent implements OnChanges {
  id: string;
  styleMap: any;

  @Input() bannerUrl: string;
  @Input() compact: boolean;
  @Input() selectedShow: ShowModel;
  @Input() containerStyle: any;
  @Input() containerUIStyle: any;
  @Output() action = new EventEmitter<ShowModel>();

  expand = false;
  display = false;
  constructor(private showSvc: ShowsService, private settingSvc: SettingsService, private datePipe: DatePipe) {
    this.id = `ssb${ssbCounter++}`;
    this.styleMap = {};
  }

  ngOnChanges(changes: SimpleChanges) {
    // const settings = await this.settingSvc.getSettings();
    const _containerStyle = changes['containerStyle'];
    if (!!_containerStyle) {
      this.styleMap = this.cssTextToMap(_containerStyle.currentValue);
      this.styleMap['min-height'] = '45px';
    }
    const _containerUIStyle = changes['containerUIStyle'];
    if (!!_containerUIStyle) {
      const showStatus = this.showSvc.GetShowStatus(this.selectedShow);
      let cssClass;
      switch (showStatus) {
        case -1: // completedUnseen, completedSeen
          cssClass = this.selectedShow.unseen_count === 0 ? 'completedSeen' : 'completedUnseen';
          break;
        case 0: // runningUnseen, runningSeen
          cssClass = this.selectedShow.unseen_count === 0 ? 'runningUnseen' : 'runningSeen';
          break;
        case 1: // tbaUnseen, tbaSeen
        default:
          cssClass = this.selectedShow.unseen_count === 0 ? 'tbaUnseen' : 'tbaSeen';
          break;
      }
      this.styleMap = this.cssTextToMap(_containerUIStyle.currentValue[cssClass].cssText);
      // this.styleMap['min-height'] = '45px';
    }

    const _bannerUrl = changes['bannerUrl'];
    if (!!_bannerUrl) {
      this.styleMap = this.bannerCss(_bannerUrl.currentValue);
      // this.styleMap['min-height'] = '45px';
    }
    const _compact = changes['compact'];
    if (!!_compact && _compact.currentValue) {
      this.styleMap['min-height'] = '25px';
    }
  }

  showTime() {
    const episode = this.selectedShow.next_episode || this.selectedShow.last_episode;
    const offset_next_date = new Date(episode.local_showtime);
    return this.datePipe.transform(offset_next_date, 'EEE hh:mm a, MMM dd, y');

    // if (show.channel && show.channel.country && timezone_offset[show.channel.country.name]) {
    //     offset_next_date.setMinutes(offset_next_date.getMinutes() +
    //         (60 * Number(timezone_offset[show.channel.country.name])));
    // }
  }

  NextShowInDays() {
    return this.showSvc.nextShowTime(this.selectedShow);
  }

  PreviousLastEpisode() {
    const word = !!this.selectedShow.previous_episode ? 'Prev' : 'Last';
    const episode = this.selectedShow.previous_episode || this.selectedShow.last_episode;
    const offset_next_date = new Date(episode.local_showtime);
    const date = this.datePipe.transform(offset_next_date, 'EEE hh:mm a, MMM dd, y');
    return `${word} Episode:(${date}) ${this.getEpisodeName(episode)}`;
  }

  NextEpisode() {
    const episode = this.selectedShow.next_episode;
    const offset_next_date = new Date(episode.local_showtime);
    return `${this.getEpisodeName(episode)}`;
  }
  channelGenre() {
    return `${this.selectedShow.channel.name} ${this.selectedShow.genres.join(' ')}`;
  }

  getEpisodeName(episode: EpisodeModel) {
    const tick = episode.seen ? '&#10004;' : '';
    if (episode.special) {
      return `[Special ${episode.counter}] ${episode.name} ${tick}`;
    }
    return `${episode.counter}.(${episode.season}x${episode.number}) ${episode.name} ${tick}`;
  }

  displayEpisodes() {
    this.action.emit(this.selectedShow);
  }

  cleanupCss(txt) {
    const map = this.cssTextToMap(txt);
    let str = '';
    for (const key in map) {
      if (map.hasOwnProperty(key)) {
        if (key.indexOf('background') !== -1 || key.indexOf('color') !== -1) {
          str = str + key + ':' + map[key] + ';';
        }
      }
    }
    return str;
  }

  cssTextToMap(txt) {
    // console.log('txt',txt);
    const map = {};
    if (txt) {
      const style = txt.split(';');
      for (let i = 0; i < style.length; i++) {
        const key_value = style[i].split(':');
        if (key_value[0] && key_value[0].trim() !== '') {
          map[key_value[0].trim()] = key_value[1].trim();
        }
      }
    }
    return map;
  }

  bannerCss(bannerUrl: string) {
    return {
      'background-image': `url(${bannerUrl})`,
      'background-size': '100% 100%',
      'background-repeat': 'no-repeat'
    };
  }

  menter() {
    // this.display = true;
  }

  mleave() {
    // this.display = false;
  }
}
