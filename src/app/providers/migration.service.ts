import { Injectable } from '@angular/core';

import {
  LoggerService,
  IDXDataDefinitionService,
  IDXDataManipulationService,
  SettingsService,
  ShowsService,
  CommonService
 } from './';

@Injectable()
export class MigrationService {
    constructor(private dmlSvc: IDXDataManipulationService,
                private loggerSvc: LoggerService,
                private settingSvc: SettingsService,
                private showsSvc: ShowsService,
                private cmnSvc: CommonService
                ) { }

    ExportBackup() {
        return new Promise((resolve, reject) => {
            this.settingSvc.getSettings().then(settings => {
                const backup = { 'data_structure_version': 5.0}; // tvmaze
                backup['settings'] = settings;
                this.showsSvc.getShowList().subscribe(show_list => {
                    backup['show_list'] = show_list;
                    resolve(JSON.stringify(backup));
                }, error => {
                    reject(error);
                });
            }).catch(err => {
                reject(err);
            });
        });
    }

    ConvertTvRage2TvMaze(settings, old_list) {
        return new Promise((resolve, reject) => {});
    }

    ImportBackup(backup) {
        return new Promise((resolve, reject) => {
            if (!backup || this.cmnSvc.isObjectEmpty(backup)) {
                reject(false);
                return;
            }
            const show_list = backup.show_list;
            const settings = backup.settings;
            const old_list = show_list.filter(oldshow => {
                return !oldshow['api_source'];
            });
            if (old_list.length > 0 || backup.data_structure_version <= 4) { // old version
                // need to convert first.
                this.dmlSvc.ClearAllStores().then( cleared => {
                    this.ConvertTvRage2TvMaze(settings, old_list).then(() => {

                    });
                });
            } else {
                // new version, just save as it is
            this.dmlSvc.ClearAllStores().then(cleared => {
                this.settingSvc.setSettings(settings).then(stgDone => {
                    let processed = 0;
                    show_list.forEach((show, sidx) => {
                        const episode_listObj = show['episode_list']; // obj
                        const episode_list = [];
                        let normal_counter = 0;
                        let special_counter = 0;
                        let last_number = 0;
                        for (const key in episode_listObj) {
                            if (episode_listObj.hasOwnProperty(key)) {
                                const episode = episode_listObj[key];
                                if (episode.number != null) {
                                    last_number = episode.number;
                                    episode.special = false;
                                    episode.counter = ++normal_counter;
                                    episode.episode_id = show.show_id + '_' + this.cmnSvc.ZeroPad(normal_counter, 4) + '_' +
                                        this.cmnSvc.ZeroPad(episode.season, 4) + '_' + this.cmnSvc.ZeroPad(last_number, 4);
                                } else {
                                    episode.special = true;
                                    episode.counter = ++special_counter;
                                    episode.episode_id = show.show_id + '_' + this.cmnSvc.ZeroPad(normal_counter, 4) + '_' +
                                        this.cmnSvc.ZeroPad(episode.season, 4) + '_' + this.cmnSvc.ZeroPad(last_number, 4) +
                                        'S' + this.cmnSvc.ZeroPad(special_counter, 2);
                                }
                                episode_list.push(episode);
                            }
                        }
                        this.showsSvc.SaveShow(show).then(show_status => {
                            this.showsSvc.SaveEpisodeList(episode_list).then(episode_status => {
                                processed++;
                                // if (processed == show_list.length && callback) {
                                //     nsr.myTvQ.subscribed.UpdateAllShowReference();
                                //     callback(processed);
                                // }
                                // nsr.myTvQ.notify.AddShowNotifications(show, episode_list, function(cnt){
                                //     console.log('AddNotifications Added', cnt);
                                // });
                            });
                        });
                    });
                });
            });
        }
        });

    }

    Migrate(callback) {
        console.log('Start Migration');
        return new Promise((resolve, reject) => {
            this.settingSvc.getSettings().then(settings => {
                this.showsSvc.getShowList().subscribe(show_list => {
                    const old_list = show_list.filter(oldshow => {
                        return !oldshow['api_source'];
                    });
                    if (!!old_list && old_list.length > 0) {
                        this.dmlSvc.ClearAllStores().then( cleared => {
                            this.ConvertTvRage2TvMaze(settings, old_list).then(() => {

                            });
                        });
                    }else {
                        reject(0);
                    }
                }, error => {
                    reject(error);
                });
            }).catch(err => {
                reject(err);
            });
        });
    }
}
