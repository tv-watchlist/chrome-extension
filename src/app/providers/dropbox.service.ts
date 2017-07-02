import { Injectable } from '@angular/core';
import { Dropbox } from '../lib';

@Injectable()
export class DropboxService {

    private dbox: Dropbox;
    constructor() {
        const consumerKey = 'pp!(u:/640pu(!5';
        const redirectUrl = `${location.protocol}//${location.host}/index.html?page=dropbox`;
        this.dbox = new Dropbox(this.decode(consumerKey), redirectUrl);
    }

    get AccessToken(): string{
        return this.dbox.AccessToken;
    }

    isAuthenticated(): boolean {
      return !!this.AccessToken;
    }

    getAuthenticationUrl(): string {
        return this.dbox.getAuthenticationUrl();
    }

    getAccountInfo() {
        return this.dbox.getCurrentAccountInfo();
    }

    getMetadata(filePath: string = '/tv-watchlist-db.txt') {
        return this.dbox.getMetadata(filePath);
    }

    upload(content: string, filePath: string = '/tv-watchlist-db.txt') {
        return this.dbox.upload(content, filePath);
    }

    download(filePath: string = '/tv-watchlist-db.txt') {
        return this.dbox.download(filePath);
    }

    revokeToken() {
        return this.dbox.revokeToken();
    }

    private decode(a: string): string {
        let b = '';
        const c = 66;
        for (let i = 0; i < a.length; i++) {
            b += String.fromCharCode(c ^ a.charCodeAt(i)); // tslint:disable-line
        }
        return b;
    }
}
