import { ImageModel } from './image.model';
import { ApiIdModel } from './api-id.model';

export class EpisodeModel {
    episode_id: string;
    name: string;
    show_id: string;
    local_showtime: number;
    url: string;
    iso8601: string;
    production_code: string;
    runtime: number;
    season: number;
    number: number;
    counter: number;
    special: boolean;
    guest_stars: string|string[];
    director: string;
    writer: string;
    summary: string;
    image: ImageModel;
    previous_id: string;
    next_id: string;
    api_source: string;
    api_id: ApiIdModel;
    seen: boolean;
}
//  test:EpisodeModel =  {"episode_id":"tvmaze1264_0001_0001_0001",
//   "show_id":"tvmaze1264",
//   "local_showtime":1343815200000,
//   "name":"The More Things Change (1)",
//   "url":"http://www.tvmaze.com/episodes/109754/ben-10-omniverse-1x01-the-more-things-change-1",
//   "iso8601":"2012-08-01T06:00:00-04:00",
//   "production_code":"",
//   "runtime":30,
//   "season":1,
//   "number":1,
//   "counter":1,
//   "special":false,
//   "guest_stars":"",
//   "director":"",
//   "writer":"",
//   "summary":"<p>Five years ago, Ben Tennyson faces off with a new enemy,a red Galvanic Mechamorph, Malware. 
// Five years later, Kevin and Gwen leave when Gwen takes early enrollment in an Ivy League college, and Kevin 
// moves to be near her. Ben is forced to fight crime alone, but Grandpa Max (Magister Tennyson – the commander 
// of the Earth-base's Plumbers) gives him a new partner, rookie Plumber Rook Blonko. Ben and Rook end up in their
//  first team-up when Mr. Baumann's store is targeted for destruction by three alien criminals (Bubble Helmet, 
//  Fistina, and Liam) as part of their protection racket. An intergalactic hunter named Khyber watches Ben from the shadows.</p>",
//   "image":{"banner":[],"poster":[]},"seen":false,
//   "previous_id":null,
//   "next_id":"tvmaze1264_0002_0001_0002",
//   "api_source":"tvmaze",
//   "api_id":{"tvmaze":109754,"tvrage":0,"thetvdb":0,"imdb":0,"zap2it":0,"trakt":0,"tmdb":0}};
