import { Days } from "./show.model";

export class SearchModel {
    show_id = '';
    api_source = '';
    api_id: {
        tvmaze?: number;
        thetvdb?: number;
        imdb?: string;
    } = {};
    name = '';
    url = '';
    show_type = '';
    language = '';
    genres: string[] = [];
    status = ''; // (Running, Ended, To Be Determined, In Development)
    runtime: number = 0;
    premiered = '';
    summary = '';
    schedule: {
        time?: string;
        days?: Days[];
    } = {};
    channel: {
        name?: string,
        image?: string,
    } = {};
    country: {
        name: string,
        code: string,
        timezone: string
    };
    
    image: {
        banner?: string[];
        poster?: string[];
    } = {};
};