import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';

import { CommonService } from './common.service';
import { TvMaze ,TvMazeShow} from '../lib';
import { ShowModel, EpisodeModel, ShowEpisodeModel, SearchModel, Days } from '../models';
@Injectable()
export class TvMazeService {
    private tm: TvMaze;
    constructor(private cmnSvc: CommonService) {
        this.tm = new TvMaze();
    }

    Search(showName: string): Observable<SearchModel[]> {
        return this.tm.ShowSearch(showName).map(search_results => {
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
        });
    }

    LookupByTheTvdb(thetvdbId: number): Observable<ShowModel> {
        return this.tm.LookupByTheTvdb(thetvdbId).map(show => {
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
        });
    }

    ShowAndEpisodes(tvmazeId: number): Observable<ShowEpisodeModel> {
        return Observable.combineLatest(this.tm.getShow(tvmazeId), this.tm.getEpisodes(tvmazeId))
        .map(show_episodelist => {
            const model = new ShowEpisodeModel();
            const _show = new ShowModel();
            const mazeShow = show_episodelist[0];
            const mazeEpList = show_episodelist[1];
            _show.show_id = 'tvmaze' + mazeShow.id;
            _show.api_source = 'tvmaze';
            _show.api_id.tvmaze = mazeShow.id;
            _show.api_id  =  {
                tvmaze: mazeShow.id,
                thetvdb: mazeShow.externals.thetvdb,
                imdb: mazeShow.externals.imdb
            }

            const channel = mazeShow.network || mazeShow.webChannel;
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
            _show.name = mazeShow.name;
            _show.url = mazeShow.url;
            
            _show.genres = mazeShow.genres || [];
            _show.status = mazeShow.status;
            _show.runtime = mazeShow.runtime;
            _show.premiered = mazeShow.premiered;
            _show.summary = mazeShow.summary;
            _show.schedule = {
                time: mazeShow.schedule.time,
                days: <Days[]>mazeShow.schedule.days
            };
            
            _show.image = {
                poster: [mazeShow.image.original],
                banner: []
            };
            
            let episode_list = mazeEpList.map(mazeEp => {
                const episode = new EpisodeModel();
                episode.show_id = _show.show_id;
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
            let clean_episode_list = [];

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
            clean_episode_list.forEach((episode, i) => {
                //set episode_id
                if(episode.number !== null){
                    episode.counter = ++normal_counter;
                    episode.episode_id = _show.show_id + "_" + this.cmnSvc.ZeroPad(episode.season, 4) + "_" +  
                        this.cmnSvc.ZeroPad(episode.number, 4) + "_" +  this.cmnSvc.ZeroPad(episode.counter,4);
                    last_number = episode.number;
                } else {
                    episode.counter = ++special_counter;
                    episode.episode_id = _show.show_id + "_" + this.cmnSvc.ZeroPad(episode.season, 4) + "_" + 
                    this.cmnSvc.ZeroPad(last_number, 4) + "_S" + this.cmnSvc.ZeroPad(episode.counter, 4);
                }

                //set previous_id
                if(i > 0) {
                    episode.previous_id = clean_episode_list[i - 1].episode_id;
                }
            });

            clean_episode_list.forEach((episode, i) => {
                //set next_id
                if(i <= clean_episode_list.length - 2) {
                    episode.next_id = clean_episode_list[i + 1].episode_id;
                }

                //set show previous_episode, next_episode
                if (!episode.previous_episode && !!episode.local_showtime && 
                    episode.local_showtime >= today) {
                    if (i > 0) {
                        _show.previous_episode = clean_episode_list[i - 1];
                    }

                    _show.next_episode = episode;
                }
            });

            if (clean_episode_list.length > 0) {
                _show.first_episode = clean_episode_list[0];
                _show.last_episode = clean_episode_list[clean_episode_list.length - 1];
            }
            _show.total_episodes = clean_episode_list.length;
            model.show = _show;
            model.episode_list = clean_episode_list;
            return model;
        });
    }

    Update() {
        return this.tm.Update();
    }
}
