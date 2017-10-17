import { EpisodeModel,
    CountryModel,
    ChannelModel,
    ApiIdModel,
    ImageModel,
    ScheduleModel,
    UserRatingModel } from './';

export class ShowModel {
    show_id: string;
    name: string;
    url: string;
    next_update_time: number;
    show_type: string;
    language: string;
    genres: string[];
    status: string;
    runtime: number;
    premiered: string;
    summary: string;
    cast: string[];
    schedule: ScheduleModel;
    user_rating: UserRatingModel;
    content_rating: string;
    channel: ChannelModel;
    api_source: string;
    api_id: ApiIdModel;
    image: ImageModel;
    total_episodes: number;
    unseen_count: number;
    first_episode: EpisodeModel;
    previous_episode: EpisodeModel;
    next_episode: EpisodeModel;
    last_episode: EpisodeModel;
    episode_list:  { [id:  string]:  EpisodeModel; };

    constructor() {
        this.show_id = '';  // key
        this.next_update_time = 0; // index
        this.name = '';
        this.url = '';
        this.show_type = '';
        this.language = null;
        this.genres = [];
        this.status = null; // (Running, Ended, To Be Determined, In Development)
        this.runtime = 0;
        this.premiered = null;
        this.summary = null;
        this.cast = [];
        this.schedule = new ScheduleModel();
        this.user_rating = new UserRatingModel();
        this.content_rating = null;
        this.channel = new ChannelModel();
        this.api_source = '';
        this.api_id =  new ApiIdModel();
        this.image = new ImageModel();

        this.unseen_count = 0,
        this.first_episode = null;
        this.previous_episode = null;
        this.next_episode = null;
        this.last_episode = null;
    }
}
    //  test = {"show_id": "tvmaze1264",
    //  "next_update_time": 1445949982,
    //  "name": "Ben 10:  Omniverse",
    //  "url": "http: //www.tvmaze.com/shows/1264/ben-10-omniverse",
    //  "show_type": "Animation",
    //  "language": "English",
    //  "genres": ["Action","Adventure","Children","Science-Fiction"],
    //  "status": "Ended",
    //  "runtime": 30,
    //  "premiered": "2012-08-01",
    //  "summary": "<p>Ben takes on new fiendish forms in BEN 10 OMNIVERSE, GALACTIC MONSTERS.
    //      Halloween is coming early to Bellwood, and to beat scary new villains like zombie clowns and evil vampires,
    //      Ben will have to take some monster alien forms of his own. Get to know two of them, Snare-oh and Blitzwolfer, 
    //      in the Ben 10 Game Creator, and check out the monstrously remixed show opening here! Monsters, 
    //      mummies and werewolves may be taking over, but Ben has defended the universe from the worst of the worst. 
    //      Now it's hero time on Monster Planet!The spooky fun begins with \"Something Zombozo This Way Comes,\" 
    //      when Ben and Rook must stop Zombozo and the Circus Freaks from turning everyone in Bellwood into zombie clowns. 
    //      Tune-in to Cartoon Network every Saturday morning to see who comes out of the shadows next!</p>",
    //  "cast": [],
    //  "schedule": {"time": "06: 00","days": ["Monday","Tuesday","Wednesday","Thursday","Friday"]},
    //  "user_rating": {"average": null,"count": 0},
    //  "content_rating": "TV-Y7",
    //  "channel": {"id": 11,"name": "Cartoon Network","country": {"name": "United States","code": "US","timezone": "America/New_York"}},
    //  "api_source": "tvmaze",
    //  "api_id": {"tvmaze": 1264,"tvrage": 31489,"thetvdb": 260995,"imdb": "tt2293002","zap2it": "EP01551613","trakt": 0,"tmdb": 0},
    //  "image": {"banner": ["http: //www.thetvdb.com/banners/graphical/260995-g2.jpg"],
    //           "poster": ["http: //www.thetvdb.com/banners/posters/260995-1.jpg",
    //            "http://tvmazecdn.com/uploads/images/original_untouched/7/18280.jpg"]},
    //  "unseen_count": 80,
    //  "first_episode": {"episode_id": "tvmaze1264_0001_0001_0001","show_id": "tvmaze1264","local_showtime": 1343815200000,
    //  "name": "The More Things Change (1)","url": "http: //www.tvmaze.com/episodes/109754/ben-10-omniverse-1x01-the-more-things-change-1",
    //  "iso8601": "2012-08-01T06: 00: 00-04: 00","production_code": "","runtime": 30,"season": 1,"number": 1,"counter": 1,
    //  "special": false,"guest_stars": "","director": "","writer": "","summary": "<p>Five years ago, Ben Tennyson faces off
    // with a new enemy,a red Galvanic Mechamorph, Malware. Five years later, Kevin and Gwen leave when Gwen takes early enrollment
    // in an Ivy League college, and Kevin moves to be near her. Ben is forced to fight crime alone, but Grandpa Max
    // (Magister Tennyson – the commander of the Earth-base's Plumbers) gives him a new partner, rookie Plumber Rook Blonko.
    // Ben and Rook end up in their first team-up when Mr. Baumann's store is targeted for destruction by three alien criminals  
    //  (Bubble Helmet, Fistina, and Liam) as part of their protection racket. An intergalactic hunter named Khyber watches Ben from
    //   the shadows.</p>","image": {"banner": [],"poster": []},"seen": false,"previous_id": null,"next_id": 
    //  "tvmaze1264_0002_0001_0002","api_source": "tvmaze","api_id": {"tvmaze": 109754,"tvrage": 0,"thetvdb": 0,"imdb": 0,
    //  "zap2it": 0,"trakt": 0,"tmdb": 0}},
    //  "previous_episode": null,
    //  "next_episode": null,
    //  "last_episode": {"episode_id": "tvmaze1264_0080_0008_0010","show_id": "tvmaze1264","local_showtime": 1415962800000,
    //  "name": "A New Dawn","url": "http: //www.tvmaze.com/episodes/109833/ben-10-omniverse-8x10-a-new-dawn","iso8601": 
    //  "2014-11-14T06: 00: 00-05: 00","production_code": "","runtime": 30,"season": 8,"number": 10,"counter": 80,"special": 
    //  false,"guest_stars": "","director": "","writer": "","summary": "<p>Ben and Rook follow Maltruant through the time stream. 
    //  Ben has an adventure with George Washington, in 1773, fighting Maltruant and Vilgax. After defeating Vilgax, Ben and Rook 
    //  chase Maltruant in the time stream to the beginning of time itself onto the starship of the Contemelia (the creators of 
    //  the Annihilaarg) where Maltruant attempts to create a universe of his own using his own Anihilaarg. In a climactic battle, 
    // at the beginning of time Ben nearly dies trying to stop Maltruant from building his own universe but then it is revealed that 
    // the Omnitrix has a fail-safe to prevent its keeper from dying.</p><p>Using the combined power of all of the Omnitrix aliens', 
    // Ben absorbs the Dwarf Star-powered Anihilaarg and uses its immensely strong, destructive power to defeat Maltruant, trapping 
    // him in a time loop that will result in him reliving the same events eternally. The Contemelia then reveal the origins of Skurd, 
    // declaring the Slimebiote to be the most vital extraterrestrial being in all of creation (to Skurd's shock). As Skurd departs with 
    // his ancestors to help develop the New World, Ben and Rook look on in awe. A new dawn rises as Ben creates a universe of his own. 
    // Back on Earth, feeling bored after the incredible sight they witnessed, Ben decides to go on a road trip across the recreated 
// universe with Rook, Gwen and Kevin.</p>","image": {"banner": [],"poster": []},"seen": false,"previous_id": "tvmaze1264_0079_0008_0009",
// "next_id": null,"api_source": "tvmaze","api_id": {"tvmaze": 109833,"tvrage": 0,"thetvdb": 0,"imdb": 0,"zap2it": 0,"trakt": 0,"tmdb": 0}},
//  "episode_list": {"tvmaze1264_0001_0001_0001": {"episode_id": "tvmaze1264_0001_0001_0001","show_id": "tvmaze1264","local_showtime": 
// 1343815200000, "name": "The More Things Change (1)","url": "http: //www.tvmaze.com/episodes/109754/ben-10-omniverse-1x01-the-more-
// things-change-1","iso8601": 
// "2012-08-01T06: 00: 00-04: 00","production_code": "","runtime": 30,"season": 1,"number": 1,"counter": 1,"special": false,
// "guest_stars": "",
// "director": "","writer": "","summary": "<p>Five years ago, Ben Tennyson faces off with a new enemy,a red Galvanic Mechamorph, Malware. 
// Five years later, Kevin and Gwen leave when Gwen takes early enrollment in an Ivy League college, and Kevin moves to be near her. Ben is
//  forced to fight crime alone, but Grandpa Max (Magister Tennyson – the commander of the Earth-base's Plumbers) gives him a new partner,
//   rookie Plumber Rook Blonko. Ben and Rook end up in their first team-up when Mr. Baumann's store is targeted for destruction by three 
//   alien criminals (Bubble Helmet, Fistina, and Liam) as part of their protection racket. An intergalactic hunter named Khyber watches 
//   Ben from the shadows.</p>","image": {"banner": [],"poster": []},"seen": false,"previous_id": null,"next_id": 
// "tvmaze1264_0002_0001_0002"
//   ,"api_source": "tvmaze","api_id": {"tvmaze": 109754,"tvrage": 0,"thetvdb": 0,"imdb": 0,"zap2it": 0,"trakt": 0,"tmdb": 0}},
//   "tvmaze1264_0002_0001_0002": {"episode_id": "tvmaze1264_0002_0001_0002","show_id": "tvmaze1264","local_showtime": 1348308000000,
//   "name": "The More Things Change (2)","url": "http: //www.tvmaze.com/episodes/109755/ben-10-omniverse-1x02-the-more-things-change-2"
// ,"iso8601": "2012-09-22T06: 00: 00-04: 00","production_code": "","runtime": 30,"season": 1,"number": 2,"counter": 2,"special": false,
// "guest_stars": "","director": "","writer": "","summary": "<p>After stopping Bubble Helmet, Fistina, and Liam from blowing up Mr. 
// Baumann's superstore, Ben and Rook discover an underground alien city named Undertown where they discover that Psyphon is behind 
// the protection racket. At the same time, Khyber sends his pet in the form of Buglizard to hunt Ben.</p>","image": 
// {"banner": [],"poster": []},"seen": false,"previous_id": "tvmaze1264_0001_0001_0001","next_id": "tvmaze1264_0003_0001_0003",
// "api_source": "tvmaze","api_id": {"tvmaze": 109755,"tvrage": 0,"thetvdb": 0,"imdb": 0,"zap2it": 0,"trakt": 0,"tmdb": 0}}
// }};
