import { Component, Input, OnInit, OnChanges, SimpleChange } from '@angular/core';
import { DatePipe } from '@angular/common';

import {
    SettingsService,
    ShowsService } from '../../providers';

import { ShowModel, EpisodeModel } from '../../models';
import { DialogBoxComponent } from '../../widgets';

@Component({
    selector: 'tvq-episode-dropdown-list',
    templateUrl: 'episode-dropdown-list.component.html',
    styleUrls: ['episode-dropdown-list.component.scss'],
})
export class EpisodeDropdownListComponent implements OnChanges {
    @Input() show: ShowModel;
    episodeList: any;
    seasonNumList: any[];
    openSeason: number;
    highLightNextEpisode: string;
    totalEpisodes: number;

    private toggleViewState = {};
    constructor(private settingsService: SettingsService, private datePipe: DatePipe) {
        this.episodeList = {};
        this.seasonNumList = [];
        this.totalEpisodes = 0;
    }

    async ngOnChanges(changes: {[propKey: string]: SimpleChange}) {
        const today = new Date().getTime();
        this.seasonNumList.length = 0;
        this.clearObj(this.episodeList);
        const show: ShowModel = <ShowModel>changes['show']['currentValue'];
        if (!show) {
            return;
        }
        // let season: number;
        let isUnairedFlagSet = false;
        this.openSeason = null;
        this.highLightNextEpisode = null;
        this.totalEpisodes = 0;
        const globalSettings = await this.settingsService.getSettings();
        // console.log('globalSettings', globalSettings);
        const timezone_offset = globalSettings.timezone_offset || {};

        const episodelist = {};
        // for (const episode_id in show.episode_list) {
        //     if (show.episode_list.hasOwnProperty(episode_id)) {
        //         const episode = show.episode_list[episode_id];
        //         let tooltip = `${show.name} Season ${episode.season} \n`;
        //         if (episode.local_showtime) {
        //             const offset_next_date = new Date(episode.local_showtime);
        //             if (show.channel && show.channel.country && timezone_offset[show.channel.country.name]) {
        //                 offset_next_date.setMinutes(offset_next_date.getMinutes() +
        //                     (60 * Number(timezone_offset[show.channel.country.name])));
        //             }
        //             // Sat 1:25 PM, Jul 23rd, 2016
        //             tooltip += `<strong> ${this.datePipe.transform(offset_next_date, 'EEE hh:mm a, MMM dd, y')} </strong>`;
        //         } else {
        //             tooltip += 'TBA';
        //         }

        //         if (!!episode.summary) {
        //             tooltip += `\n ${episode.summary}`;
        //         }
        //         if (!isUnairedFlagSet && episode.local_showtime > today) {
        //             this.openSeason = episode.season;
        //             this.highLightNextEpisode = episode.episode_id;
        //         }
        //         if (episode.local_showtime > today) {
        //             // this.episodeList.push({'type':'label', 'text':`**UNAIRED**`});
        //             isUnairedFlagSet = true;
        //         }
        //         if (!episodelist[episode.season]) {
        //             episodelist[episode.season] = [];
        //             this.toggleViewState['buttonSeason' + episode.season] = false;
        //         }
        //         if (!isUnairedFlagSet) {
        //             this.totalEpisodes++;
        //         }
        //         this.toggleViewState['buttonEpisode' + episode.episode_id] = false;
        //         episodelist[episode.season].push({
        //             'id': episode.episode_id,
        //             'text': this.getEpisodeName(episode),
        //             'tooltip': tooltip,
        //             'isunaired': isUnairedFlagSet,
        //             'seen': episode.seen
        //         });
        //     }
        // }
        this.seasonNumList = Object.keys(episodelist);
        this.seasonNumList.reverse();
        this.episodeList = episodelist;
        show.total_episodes = this.totalEpisodes;
        // console.log('ngOnChanges', show, this.seasonNumList, this.episodeList);
    }

    getEpisodeName(episode: EpisodeModel) {
        const tick = episode.seen ? '&#10004;' : '';
        if (episode.special) {
            return `[Special ${episode.counter}] ${episode.name} ${tick}`;
        }
        return `${episode.counter}.(${episode.season}x${episode.number}) ${episode.name} ${tick}`;
    }

    clearObj(obj: any) {
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                delete obj[key];
            }
        }
    }

    getKeys(obj: any) {
        if (obj) {
            return Object.keys(obj);
        } else {
            return [];
        }
    }

    setToggleState(field: string, val: string, state: boolean) {
        // console.log(field,val,state);
        this.toggleViewState[field + val] = state;
    }

    getToggleState(field: string, val: string) {
        return this.toggleViewState[field + val];
    }

    setToggleSeen(season: number, episode: any) {
        // const ep = this.show.episode_list[episode.id];
        // ep.seen = !ep.seen;

        const arr = this.episodeList[season].filter((obj: any) => {
            return obj.id === episode.id;
        });
        arr[0].seen = !arr[0].seen;
        //arr[0].text = this.getEpisodeName(ep);
    }

    setSeasonSeen(season: number) {
        let block = false;
        this.episodeList[season].forEach((episode: any) => {
            if (this.highLightNextEpisode === episode.id) {
                block = true;
            }
            if (block) {
                return;
            }
            episode.seen = true;
            //const ep = this.show.episode_list[episode.id];
            // ep.seen = true;
            // episode.text = this.getEpisodeName(ep);
        });
    }

    getExternal(season: number, episode: any) {

    }
}
