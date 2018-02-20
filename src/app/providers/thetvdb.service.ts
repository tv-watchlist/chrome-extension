import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/toArray';
import 'rxjs/add/operator/catch';
// import { X2J } from '../lib/xml2json';
 import { TheTvDbAPI } from '../lib/thetvdb-api';
 import { CommonService } from './common.service';

@Injectable()
export class TheTvDbService {
    private tvDb: TheTvDbAPI;
    constructor(private cmnSvc: CommonService) {
        this.tvDb = new TheTvDbAPI('18CBAC2B8DC75E6F');
    }

    getSeries(series_id: number) {
        return this.tvDb.getSeries(series_id);
    }

    getEpisodes(series_id: number) {
        return this.tvDb.getEpisodes(series_id)
        .toArray()
        .map(arr => arr.sort(this.cmnSvc.dynamicSort('firstAired')));
    }

    searchSeries(name: string) {
        return this.tvDb.searchSeries({name: name}); // slug(name, slug.defaults.modes['rfc3986'])
    }

    getFanarts(series_id: number) {
        return this.tvDb.getFanart(series_id).map(images => {
            images.sort(this.cmnSvc.multipleDynamicSort(['-ratingsInfo.average', '-ratingsInfo.count']));
            return images;
        });
    }

    getPosters(series_id: number) {
        return this.tvDb.getPoster(series_id).map(images => {
            images.sort(this.cmnSvc.multipleDynamicSort(['-ratingsInfo.average', '-ratingsInfo.count']));
            return images;
        });
    }

    getBanner(series_id: number) {
        return this.tvDb.getBanner(series_id);
    }

    getUpdates(fromTimestamp: Date) {
        return this.tvDb.getUpdates(fromTimestamp.getTime() / 1000).map(hash => {
            for (const key in hash) {
                if (hash.hasOwnProperty(key)) {
                     hash[key] = hash[key] * 1000;
                }
            }
            return hash;
        });
    }
}
