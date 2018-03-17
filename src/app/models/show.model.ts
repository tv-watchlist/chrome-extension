
export type Days = 'Monday'|'Tuesday'|'Wednesday'|'Thursday'|'Friday'|'Saturday'|'Sunday';

export class EpisodeModel {
    episode_id = '';
    name = '';
    show_id = '';
    /** airdate manipulated javascript Date */
    local_showtime: number = 0;
    /**
     * 2013-06-24
     */
    airdate: string;

    url = '';
    /** 30 mins */
    runtime: number = 0;
    /** Season 1 */
    season: number = 0;
    /** Epside 1 */
    number: number = 0;
    /** total episode counter */
    counter: number = 0;
    special: boolean = false;
    summary = '';
    image: {
        banner?: string[];
        poster?: string[];
    } = {};
    content_rating = '';
    //language = '';
    api_source = '';
    api_id: {
        tvmaze?: string|number;
        tvrage?: string|number;
        thetvdb?: string|number;
        imdb?: string|number;
        zap2it?: string|number;
        trakt?: string|number;
        tmdb?: string|number;
    } = {};
    previous_id = '';
    next_id = '';
    seen: boolean = false;
}

export class ShowModel {
    show_id = '';
    name = '';
    url = '';
    airtime = '';
    genres: string[] = [];
    status = '';// (Running, Ended, To Be Determined, In Development)
    runtime: number = 0;
    premiered = '';
    summary = '';
    schedule: {
        time? : string;
        days? : Days[];
    } = {};
    channel: {
        name?: string,
        image?: string,
    } = {};
    country: {
        name?: string,
        code?: string,
        timezone?: string
    } = {};
    api_source = '';
    api_id: {
        tvmaze?: number;
        thetvdb?: number;
        imdb?: string;
        zap2it?: string;
        trakt?: string|number;
        tmdb?: string|number;
    } = {};
    image: {
        banner?: string[];
        poster?: string[];
    } = {};

    next_update_time: number = 0;
    total_episodes: number = 0;
    unseen_count: number = 0;
    first_episode: EpisodeModel;
    previous_episode: EpisodeModel;
    next_episode: EpisodeModel;
    last_episode: EpisodeModel;
}

export class ShowEpisodeModel {
    show: ShowModel;
    episode_list: EpisodeModel[];
}