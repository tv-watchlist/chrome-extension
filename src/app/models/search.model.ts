export class SearchModel {
    showId: number;
    apiId: string;
    showName: string;
    poster: string;
    channel: string;
    showTime: string;
    showStatus: string;
    showUrl: string;
    summary: string;

    constructor() {
        this.showId = 0;
        this.apiId = '';
        this.showName = '';
        this.poster = '';
        this.channel = '';
        this.showTime = '';
        this.showStatus = '';
        this.summary = '';
        this.showUrl ='';
    }
}
