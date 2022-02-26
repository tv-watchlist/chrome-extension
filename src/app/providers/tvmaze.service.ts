import { Injectable } from '@angular/core';
import { Observable, combineLatest } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

import { CommonService } from './common.service';
import { TvMaze ,TvMazeShow} from '../lib';
import { ShowModel, UserShowModel, EpisodeModel, UserEpisodeModel, ShowEpisodeModel, SearchModel, Days } from '../models';
@Injectable()
export class TvMazeService {
    private tm: TvMaze;
    constructor(private cmnSvc: CommonService) {
        this.tm = new TvMaze();
    }

    Search(showName: string): Observable<SearchModel[]> {
        return this.tm.ShowSearch(showName).pipe(
            map(search_results => {
                var result = [];
                
                search_results.sort((a,b) => this.cmnSvc._comparison(a,b,'score'));
                search_results.forEach(search => {
                    var model = new SearchModel();
                    var show = search.show;
                    model.api_source = 'tvmaze';
                    model.api_id.tvmaze = show.id;
                    model.show_id = 'tvmaze' + show.id;
                    const channel = show.network || show.webChannel;
                    model.channel = {name: channel.name, image: null};
                    model.country = channel.country;

                    model.name = show.name;
                    model.url = show.url;
                    model.show_type = show.type;
                    model.language = show.language;
                    model.genres = show.genres;
                    model.status = show.status;
                    model.runtime = show.runtime;
                    model.premiered = show.premiered;
                    model.summary = show.summary;
                    model.schedule = {
                        time: show.schedule.time,
                        days: <Days[]>show.schedule.days
                    };
                    
                    model.image = {
                        poster: !!show.image? [show.image.original]:[],
                        banner:[]
                    };

                    result.push(model);
                });
                return result;
            })
        );
    }

    LookupByTheTvdb(thetvdbId: number): Observable<ShowModel> {
        return this.tm.LookupByTheTvdb(thetvdbId).pipe(
            map(show => {
                var _show = new ShowModel();
                _show.show_id = 'tvmaze' + show.id;
                _show.api_source = 'tvmaze';
                _show.api_id.tvmaze = show.id;
                _show.api_id  =  {
                    tvmaze: show.id,
                    thetvdb: show.externals.thetvdb,
                    imdb: show.externals.imdb
                }

                const channel = show.network || show.webChannel;
                const country: {name?: string, code?: string, timezone?: string} = channel.country || {};
                _show.channel = {
                    name: channel.name,
                    image: null,
                    
                };
                _show.country = {
                    name: country.name || '',
                    code: country.code || '',
                    timezone: country.timezone ||''
                };
                _show.name = show.name;
                _show.url = show.url;
                
                _show.genres = show.genres || [];
                _show.status = show.status;
                _show.runtime = show.runtime;
                _show.premiered = show.premiered;
                _show.summary = show.summary;
                _show.schedule = {
                    time: show.schedule.time,
                    days: <Days[]>show.schedule.days
                };
                
                _show.image = {
                    poster: [show.image.original],
                    banner: []
                };

                return _show;
            })
        );
    }

    ShowAndEpisodes(tvmazeId: number): Observable<ShowEpisodeModel> {
        return combineLatest(this.tm.getShow(tvmazeId), this.tm.getEpisodes(tvmazeId))
        .pipe(
            map(show_episodelist => {
                const model = new ShowEpisodeModel();

                const showModel = new ShowModel();
                const userShowModel = new UserShowModel();
                
                const mazeShow = show_episodelist[0];
                const mazeEpList = show_episodelist[1];
                showModel.show_id = 'tvmaze' + mazeShow.id;
                showModel.name = mazeShow.name;
                showModel.api_source = 'tvmaze';
                showModel.api_id  =  {
                    tvmaze: mazeShow.id,
                    thetvdb: mazeShow.externals.thetvdb,
                    imdb: mazeShow.externals.imdb
                };

                const channel = mazeShow.network || mazeShow.webChannel;
                const country: {name?: string, code?: string, timezone?: string} = channel.country || {};
                showModel.channel = {
                    name: channel.name,
                    image: null
                };
                showModel.country = {
                    name: country.name || '',
                    code: country.code || '',
                    timezone: country.timezone ||''
                };
                
                showModel.url = mazeShow.url;
                
                showModel.genres = mazeShow.genres || [];
                showModel.status = mazeShow.status;
                showModel.runtime = mazeShow.runtime;
                showModel.premiered = mazeShow.premiered;
                showModel.summary = mazeShow.summary;
                showModel.schedule = {
                    time: mazeShow.schedule.time,
                    days: <Days[]>mazeShow.schedule.days
                };
                
                showModel.image = {
                    poster: [mazeShow.image.original],
                    banner: []
                };
                
                userShowModel.show_id = showModel.show_id;
                userShowModel.name = showModel.name;
                userShowModel.api_source = showModel.api_source;
                userShowModel.api_id = showModel.api_id;

                let episode_list = mazeEpList.map(mazeEp => {
                    const episode = new EpisodeModel();
                    episode.show_id = showModel.show_id;
                    episode.api_source = 'tvmaze';
                    episode.api_id = {tvmaze: mazeEp.id};
                    episode.name = mazeEp.name;
                    episode.url = mazeEp.url;
                    episode.airdate = mazeEp.airdate;
    
                    episode.runtime = mazeEp.runtime;
                    episode.season = mazeEp.season;
                    episode.number = mazeEp.number || 0;
                    episode.summary = mazeEp.summary;
    
                    episode.local_showtime = !!mazeEp.airstamp ? Date.parse(mazeEp.airstamp) : 0;
                    episode.image = {
                        poster : (!!mazeEp.image ? [mazeEp.image.original] :[]),
                        banner : []
                    };
                    if(mazeEp.number !== null) {
                        episode.special = false;
                    }else{
                        episode.special = true;
                    }
                    return episode;
                });
    
                //Process Episodes
                let unknown_episode_list = episode_list.filter((item) => {
                    return item.local_showtime === 0;
                });
                let known_episode_list = episode_list.filter((item) => {
                    return item.local_showtime > 0;
                });
                known_episode_list.sort(this.cmnSvc.multipleDynamicSort(['local_showtime','season','number']));
                let init_season = known_episode_list.length > 0 ? known_episode_list[0].season : 1 ;
                let clean_episode_list: EpisodeModel[] = [];
    
                //move episode without datetime for same season on end.
                known_episode_list.forEach((ep, idx, episodeArray) => {
                    if(ep.season != init_season) {
                        clean_episode_list = clean_episode_list.concat(
                            unknown_episode_list.filter((item, index) => item.season === init_season)
                        );
                        unknown_episode_list = unknown_episode_list.filter((item, index) => item.season !== init_season);
                        
                        init_season = ep.season;
                    }
                    clean_episode_list.push(ep);
                });
                clean_episode_list = clean_episode_list.concat(unknown_episode_list);
                
                let last_number = 0;
                let normal_counter = 0;
                let special_counter = 0;
                let today = new Date();
                model.userEpisodeList = {};
                clean_episode_list.forEach((episode, i) => {
                    //set episode_id
                    if(episode.number !== null){
                        episode.counter = ++normal_counter;
                        episode.episode_id = showModel.show_id + "_" + this.cmnSvc.ZeroPad(episode.season, 4) + "_" +  
                            this.cmnSvc.ZeroPad(episode.number, 4) + "_" +  this.cmnSvc.ZeroPad(episode.counter,4);
                        last_number = episode.number;
                    } else {
                        episode.counter = ++special_counter;
                        episode.episode_id = showModel.show_id + "_" + this.cmnSvc.ZeroPad(episode.season, 4) + "_" + 
                        this.cmnSvc.ZeroPad(last_number, 4) + "_S" + this.cmnSvc.ZeroPad(episode.counter, 4);
                    }
                    model.userEpisodeList[episode.episode_id] = new UserEpisodeModel();
                    model.userEpisodeList[episode.episode_id].show_id = episode.show_id;                    
                    model.userEpisodeList[episode.episode_id].episode_id = episode.episode_id;
                    model.userEpisodeList[episode.episode_id].name = episode.name;
                    model.userEpisodeList[episode.episode_id].api_id = episode.api_id;
                    model.userEpisodeList[episode.episode_id].api_source = episode.api_source;

                    //set previous_id
                    if(i > 0) {
                        model.userEpisodeList[episode.episode_id].previous_id = clean_episode_list[i - 1].episode_id;
                    }
                });
    
                clean_episode_list.forEach((episode, i) => {
                    //set next_id
                    if(i <= clean_episode_list.length - 2) {
                        model.userEpisodeList[episode.episode_id].next_id = clean_episode_list[i + 1].episode_id;
                    }
    
                    //set show previous_episode, next_episode
                    if (!userShowModel.previous_episode && !!episode.local_showtime && 
                        episode.local_showtime >= today.getTime()) {
                        if (i > 0) {
                            userShowModel.previous_episode = clean_episode_list[i - 1];
                        }
    
                        userShowModel.next_episode = episode;
                    }
                });
    
                if (clean_episode_list.length > 0) {
                    userShowModel.first_episode = clean_episode_list[0];
                    userShowModel.last_episode = clean_episode_list[clean_episode_list.length - 1];
                }
                userShowModel.total_episodes = clean_episode_list.length;
                
                model.show = showModel;
                model.userShow = userShowModel;
                model.episodeList = clean_episode_list;

                return model;
            })
        );
    }

    getUpdate() {
        return this.tm.getUpdate();
    }
}
