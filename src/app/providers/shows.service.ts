import { Injectable, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ShowModel, EpisodeModel, Settings } from '../models';

import { CommonService } from './common.service';
import { IDXDataManipulationService } from './indexed-db.service';
import { LoggerService } from './logger.service';
import { SettingsService } from './settings.service';
import { rendererTypeName } from '@angular/compiler';

const EndedRegex = /Pilot.?Rejected|Cancell?ed\/Ended|Cancell?ed|Ended/i;

@Injectable()
export class ShowsService {

    notifySvc: any;
    tvmazeSvc: any;
    thetvdbSvc: any;
    timer_id: any;
    constructor(
        private datePipe: DatePipe,
        private http: Http,
        private dmlSvc: IDXDataManipulationService,
        private loggerSvc: LoggerService,
        private settingSvc: SettingsService,
        private cmnSvc: CommonService) { }

    getDB():Observable<{}>{
        return this.http.get('../../assets/tv-watchlist-db.json').pipe(map(resp=> resp.json()));
    }

    getShowList(): Observable<ShowModel[]> {
        return this.getDB().pipe(map(data => data['show_list']));
    }

    nextShowTime(show: ShowModel) {
        return this.cmnSvc.DaysBetweenToEnglish(new Date(), !!show.next_episode ? new Date(show.next_episode.local_showtime) : null);
    }
    // -1 = Completed, 0 = Running, 1 = TBA
    GetShowStatus(show: ShowModel) {
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
        if (show.country && timezone_offset[show.country.name]) {
            if (!!offset_next_date) {
                offset_next_date.setMinutes(offset_next_date.getMinutes() + (60 * Number(timezone_offset[show.country.name])));
            }
            if (!!offset_prev_date) {
                offset_prev_date.setMinutes(offset_prev_date.getMinutes() + (60 * Number(timezone_offset[show.country.name])));
            }
            if (!!offset_last_date) {
                offset_last_date.setMinutes(offset_last_date.getMinutes() + (60 * Number(timezone_offset[show.country.name])));
            }
        }

        if (status === 0 && !!show.next_episode) {
            statusTxt = this.datePipe.transform(offset_next_date, 'EEE hh:mm a, MMM dd, y');
        }
        return statusTxt;
    }

    GetShow(show_id): Promise<ShowModel> {
        return <Promise<ShowModel>>this.dmlSvc.GetObj('subscribed_shows', show_id);
    }

    GetShowListObj(): Promise<{[show_id: string]: ShowModel}> {
        return <Promise<{[show_id: string]: ShowModel}>>this.dmlSvc.FetchAll('subscribed_shows', 'show_id');
    }

    GetShowListArray(): Promise<ShowModel[]> {
        return <Promise<ShowModel[]>>this.dmlSvc.FetchAll('subscribed_shows');
    }

    GetEpisode(episode_id: string): Promise<EpisodeModel> {
        return <Promise<EpisodeModel>>this.dmlSvc.GetObj('subscribed_episodes', episode_id);
    }

    GetEpisodeListObj(show_id: string): Promise<{[episode_id: string]: EpisodeModel}> {
        return <Promise<{[episode_id: string]: EpisodeModel}>>this.dmlSvc.FindAllFiltered('subscribed_episodes', '==', {'first' : show_id} ,
        {indexName: 'show_id_Index', resultMapKey: 'episode_id'});
    }

    GetEpisodeListArray(show_id: string): Promise<EpisodeModel[]> {
        return <Promise<EpisodeModel[]>>this.dmlSvc.FindAllFiltered('subscribed_episodes', '==', {'first' : show_id},
        {indexName: 'show_id_Index'});
    }

    SaveShow(show: ShowModel) {
        if (show) {
            //delete show.episode_list;
            return this.dmlSvc.SetObj('subscribed_shows', show);
        } else {
            return Promise.reject(false);
        }
    }

    SaveEpisode(episode: EpisodeModel) {
        if (!!episode && episode['episode_id']) {
            return this.dmlSvc.SetObj('subscribed_episodes', episode);
        } else {
            return Promise.reject(false);
        }
    }

    SaveEpisodeList(episode_list: EpisodeModel[]) {
       return this.dmlSvc.AddList('subscribed_episodes', episode_list);
    }

    DeleteEpisodeList(show_id: string) {
        return this.dmlSvc.DeleteRange('subscribed_episodes', 'show_id_Index', '==', {first: show_id});
    }

    DeleteShow(show_id: string) {
        this.notifySvc.DeleteShowNotifications(show_id).then(() => {
            console.log('deleted notification');
        });
        return this.DeleteEpisodeList(show_id).then(() => {
            console.log('deleted episodes', show_id);
            return this.dmlSvc.Delete('subscribed_shows', show_id);
        });
    }

    // callback(show, episode_list);
    GetShowAndEpisodes(show_id: string) {
        const now = new Date().getTime();
        console.log('GetShowAndEpisodes', show_id);
        return this.GetShow(show_id).then((show: ShowModel) => {
            if (!!show) {
                return this.GetEpisodeListObj(show.show_id).then(episode_list => {
                    // show.episode_list = episode_list;
                    return Promise.resolve([show,episode_list]);
                });
            } else {
                return Promise.reject(false);
            }
        });
    }

    GetAllShowsAndEpisodes() {
        // console.log('GetAllShowsAndEpisodes called');
        return this.GetShowListArray().then(show_list => {
            let result = [];
            // console.log('GetAllShowsAndEpisodes called',show_list);
            let show_counter = 0;
            show_list = show_list || [];
            show_list.forEach((showItem, showIndex) => {
                console.log('GetAllShowsAndEpisodes', showIndex, showItem);
                this.GetEpisodeListObj(showItem.show_id).then(episode_list => {
                    show_counter++;
                    result.push([showItem, episode_list]);
                    if (show_counter === result.length) {
                        return Promise.resolve(result);
                    }
                });
            });
            if (result.length === 0) {
               return Promise.resolve(result);
            }
        });
    }

    GetAllSortedShows() {
       return this.GetShowListArray().then(show_list => {
            show_list = show_list || [];
            // console.log('GetAllSortedShows',show_list);
            return this.settingSvc.getSettings().then(settings => {
                // console.log('GetAllSortedShows',show_list,settings);
                const shows_order = settings.shows_order;
                const now = new Date().getTime();
                if (shows_order === 'custom') {
                    // array of show_ids
                    const custom_shows_order = settings.custom_shows_order || [];
                    const new_show_list = [];
                    const showid_array_map = {};
                    let update_custom_shows_order = false;
                    // if array and also if greater than 0
                    if (custom_shows_order.length && show_list.length) {
                        // create map between showid and show_list array indexes
                        show_list.filter((show, index) => {
                            showid_array_map[show.show_id] = index;
                        });
                        custom_shows_order.filter((showid, index) => {
                            const cshow = show_list[showid_array_map[showid]];
                            delete showid_array_map[showid];
                            if (!!cshow) {
                                new_show_list.push(cshow);
                            } else {
                                update_custom_shows_order = true;
                            }
                        });
                        for (const showid in showid_array_map) {
                            if (showid_array_map.hasOwnProperty(showid)) {
                                const cshow = show_list[showid_array_map[showid]];
                                if (!!cshow) {
                                    new_show_list.push(cshow);
                                }
                            }
                        }
                        if (update_custom_shows_order) {
                            this.settingSvc.setSettings({'custom_shows_order': new_show_list.map(show => show.show_id)});
                        }
                       return Promise.resolve(new_show_list);
                    } else { // if custom_shows_order not defined return original showlists
                        console.log('GetAllSortedShows initial custom', show_list);
                        return Promise.resolve(show_list);
                    }
                } else if (shows_order === 'showname') {
                    // http://www.javascriptkit.com/javatutors/arraysort2.shtml
                    if (show_list.length) {
                        show_list.sort((a, b) => {
                            const x = a.name.toLowerCase();
                            const y = b.name.toLowerCase();
                            return ((x < y) ? -1 : ((x > y) ? 1 : 0));
                        });
                    }
                    return Promise.resolve(show_list);
                } else { // unseen or default airdate
                    // get future shows
                    const future_show_list: ShowModel[] = show_list.filter(item => !!item.next_episode);
                    // sort by asc
                    future_show_list.sort((a, b) => {
                        const x = a.next_episode.local_showtime;
                        const y = b.next_episode.local_showtime;
                        return ((x < y) ? -1 : ((x > y) ? 1 : 0));
                    });

                    // tba
                    const tba_show_list = show_list.filter(item => !item.next_episode && !(item.status || '').match(EndedRegex));
                    // sort by desc
                    tba_show_list.sort((a, b) => {
                        const x = (b.previous_episode || b.last_episode || { local_showtime: null }).local_showtime;
                        const y = (a.previous_episode || a.last_episode || { local_showtime: null }).local_showtime;
                        return ((x < y) ? -1 : ((x > y) ? 1 : 0));
                    });

                    // completed
                    const ended_show_list = show_list.filter(item => (item.status || '').match(EndedRegex));
                    // sort by desc
                    ended_show_list.sort((a, b) => {
                        const x = (b.last_episode || { local_showtime: null }).local_showtime;
                        const y = (a.last_episode || { local_showtime: null }).local_showtime;
                        return ((x < y) ? -1 : ((x > y) ? 1 : 0));
                    });
                    const tba_ended: ShowModel[] = [].concat(tba_show_list, ended_show_list);
                    const new_show_list: ShowModel[] = [].concat(future_show_list, tba_ended);
                    if (shows_order === 'unseen') {
                        const show_listUnseen = new_show_list.filter(item => item.unseen_count > 0);
                        const show_listSeen = new_show_list.filter(item => item.unseen_count === 0);
                        show_listUnseen.sort((a, b) => {// desc
                            const x = b.unseen_count;
                            const y = a.unseen_count;
                            return ((x < y) ? -1 : ((x > y) ? 1 : 0));
                        });
                        return Promise.resolve(<ShowModel[]>[].concat(show_listUnseen, show_listSeen ));
                    }
                    return Promise.resolve(new_show_list);
                }
            });
        });
    }

    GetAllSortedShowsAndEpisodes() {
        const now = new Date().getTime();
        // console.log('GetAllShowsAndEpisodes called');

        return this.GetAllSortedShows().then(show_list => {
            // console.log('GetAllShowsAndEpisodes called',show_list);
            let show_counter = 0;
            show_list = show_list || [];
            show_list.forEach((showItem, showIndex) => {
                // console.log('GetAllSortedShowsAndEpisodes', showIndex, showItem);
                this.GetEpisodeListObj(showItem.show_id).then(episode_list => {
                    show_counter++;
                    showItem.episode_list = episode_list;
                    if (show_counter === show_list.length) {
                         return Promise.resolve(show_list);
                    }
                });
            });
            if (show_list.length === 0) {
                 return Promise.resolve(show_list);
            }
        });
    }

    UpdateShowReference(show: ShowModel) {
        const now = (new Date()).getTime();
        if (!!show) {
            this.GetEpisodeListArray(show.show_id).then(episode_list => {
                let unseen_count = 0;
                show.previous_episode = null;
                show.next_episode = null;
                show.first_episode = null;
                show.last_episode = null;

                if (episode_list.length > 0) {
                    show.first_episode = episode_list[0];
                    show.last_episode = episode_list[episode_list.length - 1];
                    // console.log('first,last',episode_list[0], episode_list[episode_list.length - 1]);
                }

                // console.log('episode_list',episode_list);
                for (let i = 0; i < episode_list.length; i++) {
                    if (!show.previous_episode &&
                        !!episode_list[i].local_showtime &&
                          episode_list[i].local_showtime >= now) {
                        if (i > 0) {
                            show.previous_episode = episode_list[i - 1];
                            // console.log('previous_episode',i, episode_list[i - 1]);
                        }

                        show.next_episode = episode_list[i];
                        // console.log('next_episode',i, episode_list[i - 1]);
                    }

                    if (!!episode_list[i].local_showtime &&
                          episode_list[i].local_showtime < now &&
                          !episode_list[i].seen) {
                        unseen_count++;
                    }
                }
                show.unseen_count = unseen_count;
                this.SaveShow(show).then(isSaved => { });
            });
        }
    }

    // calls api and tranforms to model
    // AddUpdateShow(id, api): Promise<ShowModel> {
    //     console.log('AddUpdateShow1', id, api);
    //     const show_id = api + id;
    //     const _newShow = new ShowModel();
    //     const today = (new Date()).getTime();

    //     if (api === 'tvmaze') {
    //         // console.log('AddUpdateShow1', show_id, id);
    //         return this.GetShowAndEpisodes(show_id).then((existing_show: ShowModel) => {
    //             // existing_show, existing_episode_list
    //             return <Promise<any>>this.tvmazeSvc.ShowAndEpisode(id).then((show: any, episode_list: any) => {
    //                 // TODO almost duplicate code, merge it with migration
    //                 return <Promise<any>> this.thetvdbSvc.GetSeries(show.externals.thetvdb).then(theTvDB => {
    //                     // console.log('AddUpdateShow2', existing_show,show, episode_list,theTvDB);
    //                     const newShow = !!existing_show ? existing_show : _newShow;
    //                     // console.log('theTvDB',show, newShow,theTvDB);
    //                     if (!!theTvDB) {
    //                         // if (theTvDB.banner_image && !nsr.inArray(theTvDB.banner_image, newShow.image.banner))
    //                         //     newShow.image.banner.unshift(theTvDB.banner_image);

    //                         // if (theTvDB.poster_image && !nsr.inArray(theTvDB.poster_image, newShow.image.poster))
    //                         //     newShow.image.poster.unshift(theTvDB.poster_image);

    //                         newShow.api_id.imdb = theTvDB.imdb;
    //                         newShow.api_id.zap2it = theTvDB.zap2it;
    //                         newShow.content_rating = theTvDB.ContentRating;
    //                     }

    //                     newShow.show_id = show_id;
    //                     newShow.api_source = api;
    //                     newShow.api_id.tvmaze = show.id;
    //                     newShow.api_id.thetvdb = show.externals.thetvdb;
    //                     newShow.api_id.tvrage = show.externals.tvrage;
    //                     newShow.next_update_time = show.updated;

    //                     const channel = show.network || show.webChannel;
    //                     if (!!channel) {
    //                         newShow.channel.name = channel.name || '';
    //                         if (!!channel.country) {
    //                             newShow.channel.country = channel.country;
    //                         }
    //                     }

    //                     newShow.name = show.name;
    //                     newShow.url = show.url;
    //                     newShow.show_type = show.type;
    //                     newShow.language = show.language;
    //                     newShow.genres = show.genres;
    //                     newShow.status = show.status; // (Running, Ended, To Be Determined, In Development)
    //                     newShow.runtime = show.runtime;
    //                     newShow.premiered = show.premiered;
    //                     newShow.summary = show.summary;
    //                     newShow.schedule = show.schedule;
    //                     newShow.user_rating.average = show.rating.average;
    //                     // if (!!show.image && !nsr.inArray(show.image.original, newShow.image.poster))
    //                     //     newShow.image.poster.push(show.image.original);
    //                     let unknown_episode_list = episode_list.filter((item, index) => !item.airstamp);
    //                     const known_episode_list = episode_list.filter((item, index) => !!item.airstamp)

    //                     known_episode_list.sort((x, y) => {
    //                         const x1 = `${this.cmnSvc.ZeroPad(x.airstamp, 13)}_${this.cmnSvc.ZeroPad(x.season,
    //                             4)}_${this.cmnSvc.ZeroPad(x.number || 0, 4)}`;
    //                         const y1 = `${this.cmnSvc.ZeroPad(y.airstamp, 13)}_${this.cmnSvc.ZeroPad(y.season,
    //                             4)}_${this.cmnSvc.ZeroPad(y.number || 0, 4)}`;
    //                         return ((x1 < y1) ? -1 : ((x1 > y1) ? 1 : 0));
    //                     });

    //                     let init_season = known_episode_list.length > 0 ? known_episode_list[0].season : 1;
    //                     let clean_episode_list = [];

    //                     known_episode_list.forEach((episode, index, episodeArray) => {
    //                         if (episode.season !== init_season) {
    //                             clean_episode_list = clean_episode_list.concat(episode_list.filter((item) => item.season === init_season));
    //                             unknown_episode_list = unknown_episode_list.filter((item) => item.season !== init_season);
    //                             init_season = episode.season;
    //                         }
    //                         clean_episode_list.push(episode);
    //                     });
    //                     clean_episode_list = clean_episode_list.concat(unknown_episode_list);

    //                     console.log('AddUpdateShow', clean_episode_list);
    //                     let normal_counter = 0;
    //                     let special_counter = 0;
    //                     let last_number = 0;
    //                     const newEpisodeList = [];

    //                     clean_episode_list.forEach((episode, index, episodeArray) => {
    //                         const newEpisode = new EpisodeModel();
    //                         newEpisode.show_id = newShow.show_id;
    //                         newEpisode.local_showtime = episode.airstamp ? Date.parse(episode.airstamp) : null;
    //                         newEpisode.name = episode.name;
    //                         newEpisode.url = episode.url;
    //                         newEpisode.iso8601 = episode.airstamp;
    //                         newEpisode.runtime = episode.runtime;
    //                         newEpisode.season = episode.season;
    //                         newEpisode.number = episode.number;
    //                         newEpisode.summary = episode.summary;

    //                         newEpisode.api_source = 'tvmaze';
    //                         newEpisode.api_id.tvmaze = episode.id;
    //                         newEpisode.image.poster = !!episode.image ? episode.image.original : [];
    //                         if (episode.number != null) {
    //                             last_number = episode.number;
    //                             newEpisode.special = false;
    //                             newEpisode.counter = ++normal_counter;

    //                             newEpisode.episode_id = `${newShow.show_id}_${this.cmnSvc.ZeroPad(normal_counter,
    //                                 4)}_${this.cmnSvc.ZeroPad(newEpisode.season, 4)}_${this.cmnSvc.ZeroPad(last_number, 4)}`;

    //                             // newEpisode.episode_id = newShow.show_id + '_' + nsr.ZeroPad(newEpisode.local_showtime,13) + '_' +
    //                             //     nsr.ZeroPad(newEpisode.season, 4) + '_' + nsr.ZeroPad(newEpisode.number, 4) + '_' + 'E' +
    //                             //     nsr.ZeroPad(newEpisode.counter,4);
    //                         } else {
    //                             newEpisode.special = true;
    //                             newEpisode.counter = ++special_counter;
    //                             newEpisode.episode_id = `${newShow.show_id}_${this.cmnSvc.ZeroPad(normal_counter,
    //                                  4)}_${this.cmnSvc.ZeroPad(newEpisode.season, 4)}_${this.cmnSvc.ZeroPad(last_number,
    //                                  4)}S${this.cmnSvc.ZeroPad(special_counter, 2)}`;

    //                             // newEpisode.episode_id = newShow.show_id + '_' + nsr.ZeroPad(newEpisode.local_showtime,13) + '_' +
    //                             //     nsr.ZeroPad(newEpisode.season, 4) + '_' + nsr.ZeroPad(last_number, 4) + '_' + 'S' +
    //                             //     nsr.ZeroPad(newEpisode.counter,4);
    //                         }

    //                         newEpisodeList.push(newEpisode);
    //                     });

    //                     // console.log(JSON.stringify(newEpisodeList));
    //                     if (newEpisodeList.length > 0) {
    //                         newShow.first_episode = newEpisodeList[0];
    //                         newShow.last_episode = newEpisodeList[newEpisodeList.length - 1];
    //                     }

    //                     let unseen_count = 0;
    //                     for (let i = 0; i < newEpisodeList.length; i++) {
    //                         if (!newShow.previous_episode &&
    //                             !!newEpisodeList[i].local_showtime &&
    //                             newEpisodeList[i].local_showtime >= today) {
    //                             if (i > 0) {
    //                                 newShow.previous_episode = newEpisodeList[i - 1];
    //                             }

    //                             newShow.next_episode = newEpisodeList[i];
    //                         }

    //                         if (i > 0) {
    //                             newEpisodeList[i].previous_id = newEpisodeList[i - 1].episode_id;
    //                         }

    //                         if (i <= newEpisodeList.length - 2) {
    //                             newEpisodeList[i].next_id = newEpisodeList[i + 1].episode_id;
    //                         }
    //                         if (!!existing_show.episode_list) {
    //                             if (!!existing_show.episode_list[newEpisodeList[i].episode_id]) {
    //                                 newEpisodeList[i].seen = existing_show.episode_list[newEpisodeList[i].episode_id].seen;
    //                             } else {
    //                                 for (const oldKey in existing_show.episode_list) {
    //                                     if (existing_show.episode_list.hasOwnProperty(oldKey)) {
    //                                         const oldEpisode = existing_show.episode_list[oldKey];
    //                                         if (oldEpisode.season === newEpisodeList[i].season &&
    //                                             oldEpisode.number === newEpisodeList[i].number &&
    //                                             oldEpisode.name.toLowerCase() === newEpisodeList[i].name.toLowerCase()) {
    //                                             newEpisodeList[i].seen = oldEpisode.seen;
    //                                             break;
    //                                         }
    //                                     }
    //                                 }
    //                             }
    //                         }
    //                         if (!!newEpisodeList[i].local_showtime && newEpisodeList[i].local_showtime < today && !newEpisodeList[i].seen) {
    //                             unseen_count++;
    //                         }
    //                     }
    //                     newShow.unseen_count = unseen_count;
    //                     // console.log('AddUpdateShow',newShow,newEpisodeList);
    //                     return this.DeleteEpisodeList(show_id).then(() => {
    //                         return this.SaveShow(newShow).then(show_status => {
    //                             return this.SaveEpisodeList(newEpisodeList).then( episode_status => {
    //                                 newShow.episode_list = newShow.episode_list || {};
    //                                 newEpisodeList.forEach(episode => {
    //                                     newShow.episode_list[episode.episode_id] = episode;
    //                                 });
    //                                 this.notifySvc.AddShowNotifications(newShow).then( (cnt) => {
    //                                     console.log('AddNotifications Added', cnt);
    //                                 });

    //                                 return Promise.resolve(newShow);
    //                             });
    //                         });
    //                     });
    //                 });
    //             });
    //         });
    //     }
    // }

    UpdateAllShowReference() {
        console.log('Updating All Show Reference');
        this.GetShowListArray().then(list => {
            list.forEach((show, idx) => {
                this.UpdateShowReference(show);
            });
        });
    }

    AutoUpdateOldShows = () => {
        console.log('Staring Auto Update from API');
        this.settingSvc.getSettings().then(settings => {
            const now = new Date().getTime();
            const update_time = settings.update_time || now;
            const auto_update = settings.auto_update !== undefined ? settings.auto_update : 1;
            this.AnimateBadgeStop();
            if (auto_update === 1) {
                if (update_time < now) {
                    console.log('Autoupdate eligible');
                    const animate_icon = settings.animate_icon !== undefined ? settings.animate_icon : 1;
                    if (animate_icon === 1) {
                        this.AnimateBadgeStart(0);
                    }
                    this.SmartUpdateAllShows().then(count => {
                        if (animate_icon === 1) {
                            this.AnimateBadgeStop();
                        }
                        console.log(count, 'shows updated from server');
                    });
                } else {
                    console.log('next auto update will be after.', new Date(update_time));
                }
            } else {
                console.log('Auto update is disabled.');
            }
        });
    }

    AnimateBadgeStart(frame) {
        if (!frame || frame > 3) { frame = 0; }

        let str = '.';
        for (let i = 0; i < frame; i++) {
            str += '.';
        }
        // console.log(frame, str);
        chrome.browserAction.setBadgeText({ text: str });
        this.timer_id = window.setTimeout(() => {
                this.AnimateBadgeStart(frame + 1);
            }, 1000);
    }

    AnimateBadgeStop() {
        if (this.timer_id) {
            window.clearTimeout(this.timer_id);
        }
        this.SetBadgeStatus();
    }

    SetBadgeStatus() {
        // console.log('SetBadgeStatus');
       this.settingSvc.getSettings().then(settings => {
            // settings.badge_flag;
            this.GetAllShowsAndEpisodes().then(show_list => {
                let showcount = 0;
                let episodecount = 0;
                const list_length = show_list.length;
                const today = new Date().getTime();
                let display = null;
                show_list.forEach((show, idx) => {
                    let count = 0;
                    for (const indexEp in show.episode_list) {
                        if (show.episode_list.hasOwnProperty(indexEp)) {
                            const itemEp = show.episode_list[indexEp];
                            if (!!itemEp.local_showtime && itemEp.local_showtime < today && !itemEp.seen) {
                                count++
                            }
                        }
                    }
                    if (count > 0) {
                        showcount++;
                        episodecount += count;
                    }
                });

                if (settings.badge_flag === 'shows') {
                    display = showcount;
                } else if (settings.badge_flag === 'episodes') {
                    display = episodecount;
                } else {
                    display = null;
                }
                if (display !== null && display >= 9999) {
                    display = 9999;
                }

                console.log('SetBadgeStatus', settings.badge_flag, showcount, episodecount, display);
                chrome.browserAction.setIcon({ path: 'myTvQ1x32.png' });
                chrome.browserAction.setBadgeText({ text: '' });
                if (display === null) {
                    if (showcount === 0) {
                        chrome.browserAction.setIcon({ path: 'myTvQEmptyx32.png' });
                    }
                } else if (display > 0) {
                    chrome.browserAction.setBadgeText({ text: `${display}` });
                }
            });
        });
    }

    // for highlights from monday to sunday
    // so assumption is one episode form show
    GetShowsAndEpisodesByRange(startDate, endDate, callback) {
        const showlist = {};
        let index = 0;
        // get by desc
        const dates = [startDate, endDate];
        this.dmlSvc.FindAllFiltered('subscribed_episodes', '>= && <=',
            { first: startDate, second: endDate}, {indexName: 'local_showtime_Index'}).then((episode_list: EpisodeModel[]) => {
            for (let i = 0; i < episode_list.length; i++) {
                showlist[episode_list[i].show_id] = episode_list[i];
                this.GetShow(episode_list[i].show_id).then(show => {
                    index++;
                    if (show) {
                        const ep = showlist[show.show_id];
                        ep['show'] = show;
                        showlist[show.show_id] = ep;
                    }
                    if (index === episode_list.length) {
                        return Promise.resolve(showlist);
                    }
                });
            }
            if (episode_list.length === 0) {
                return Promise.resolve(showlist);
            }
        });
    }

    SmartUpdateAllShows(): Promise<number> {
        return this.GetShowListArray().then(show_list => {
            if (!!show_list) {
                return this.tvmazeSvc.Update().then(data => {
                    this.settingSvc.setSettings({'update_time': this.cmnSvc.AddDay(new Date(), 1).getTime()});
                    const to_update = [];
                    show_list.forEach((show, idx) => {
                        if (show.api_source === 'tvmaze' && data[`${show.api_id.tvmaze}`] > show.next_update_time) {
                            to_update.push(show.api_id.tvmaze);
                        }
                    });

                    let updated = 0;
                    to_update.forEach((showid, idx) => {
                        // this.AddUpdateShow(showid, 'tvmaze').then(show => {
                        //     updated++;
                        //     if (updated === to_update.length) {
                        //         this.SetBadgeStatus();
                        //         return Promise.resolve(updated);
                        //     }
                        // });
                    });
                    if (to_update.length === 0) {
                        return Promise.resolve(0);
                    }
                });
            } else {
                return Promise.resolve(0);
            }
        });
    }
}

