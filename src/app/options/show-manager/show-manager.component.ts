import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Headers, Http } from '@angular/http';
import { SettingsService, ShowsService,  CommonService } from '../../providers';

import { ShowModel, Settings } from '../../models';
import { DialogBoxComponent } from '../../widgets';

declare const $: any;

@Component({
    selector: 'tvq-show-manager',
    templateUrl: './show-manager.component.html',
    styleUrls: ['./show-manager.component.scss'],
})
export class ShowManagerComponent implements OnInit {
    show_group_order: string[];

    show_group: { [group_name: string]: ShowModel[] };

    selectedShow: ShowModel;
    carouselList: string[];
    globalSettings: Settings;
    @ViewChild('detailDialog') detailDialog: DialogBoxComponent;

    constructor(
        private cmnSvc: CommonService,
        private showSvc: ShowsService,
        private settingsSvc: SettingsService,
        private datePipe: DatePipe
    ) { }

    async ngOnInit() {
        // vignette - a small illustration or portrait photograph that fades into its background without a definite border.
        this.carouselList = ['https://www.thetvdb.com/banners/fanart/original/80379-62.jpg',
            'https://www.thetvdb.com/banners/fanart/original/281662-7.jpg',
            'https://www.thetvdb.com/banners/fanart/original/176941-54.jpg'];
        // this.carouselList = ['https://www.thetvdb.com/banners/graphical/281662-g17.jpg',
        // 'https://www.thetvdb.com/banners/graphical/176941-g7.jpg',
        // 'https://www.thetvdb.com/banners/graphical/80379-g15.jpg'];
        this.globalSettings = await this.settingsSvc.getSettings();
        this.showSvc
            .getShowList()
            .subscribe(data => {
                const clone: ShowModel[] = JSON.parse(JSON.stringify(data));
                this.show_group = {};
                this.show_group_order = ['Running', 'TBA', 'Completed'];
                const third_length = Math.ceil(clone.length / 3);
                // console.log(third_length,data.length);
                this.show_group['Running'] = clone
                    .filter(s => !!s.next_episode)
                    .sort((a, b) => {
                        const x = a.next_episode.local_showtime;
                        const y = b.next_episode.local_showtime;
                        return ((x < y) ? -1 : ((x > y) ? 1 : 0));
                    });

                this.show_group['TBA'] = clone.filter(s => !s.next_episode &&
                    !(s.status || '').match(/Pilot.?Rejected|Cancell?ed\/Ended|Cancell?ed|Ended/i))
                    .sort((a, b) => {
                        const x = (b.previous_episode || b.last_episode || { local_showtime: null }).local_showtime;
                        const y = (a.previous_episode || a.last_episode || { local_showtime: null }).local_showtime;
                        return ((x < y) ? -1 : ((x > y) ? 1 : 0));
                    });

                this.show_group['Completed'] = clone.filter(s => !s.next_episode &&
                    (s.status || '').match(/Pilot.?Rejected|Cancell?ed\/Ended|Cancell?ed|Ended/i))
                    .sort((a, b) => {
                        const x = (b.last_episode || { local_showtime: null }).local_showtime;
                        const y = (a.last_episode || { local_showtime: null }).local_showtime;
                        return ((x < y) ? -1 : ((x > y) ? 1 : 0));
                    });
            },
            error => console.log(error)
            );
    }

    displayDetails(show: ShowModel) {
        this.selectedShow = show;
        this.detailDialog.open();
        // console.log('displayDetails',this.showDetail);
    }
    nextShowTime(show: ShowModel) {
        return this.showSvc.nextShowTime(show);
    }
    getShowList(group_name: string) {
        return this.show_group[group_name];
    }
    GetShowStatusText(show: ShowModel) {
       return this.showSvc.GetShowStatusText(show, this.globalSettings);
    }

    imgError(event) {
        // console.log('imgError', event);
        event.target.src = '/assets/tv-watchlist-128.png';
    }
}
