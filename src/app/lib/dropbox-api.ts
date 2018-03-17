/**
 * Dropbox APIv2 which can be used outside of angular
 * Uses XMLHttpRequest to make requests
 */
export class Dropbox {
    private redirectUrl: string;
    private appKey: string;
    // https://www.dropbox.com/developers/documentation/http/documentation
    static captureResponse(location: Location) {
        // https://www.example.com/mycallback#access_token=<access token>&token_type=Bearer&uid=<user ID>&state=<CSRF token>

        if (location.hash) {
            const hash = window.location.hash.substring(1);
            const json = Dropbox.getJsonFromUrl(hash);
            if (localStorage['dropbox_csrf_token'] === json['state']) {
                for (const key in json) {
                    if (json.hasOwnProperty(key)) {
                        localStorage['dropbox_' + key] = json[key];
                    }
                }
                console.log('Dropbox access granted.');
            } else {
                console.log('CSRF check failed');
            }
        } else {
            console.log('Missing hash parameters');
        }
    }

    // https://stackoverflow.com/questions/8486099/how-do-i-parse-a-url-query-parameters-in-javascript
    private static getJsonFromUrl(query: string) {
        const result = {};
        query.split('&').forEach(function (part) {
            const item = part.split('=');
            result[item[0]] = decodeURIComponent(item[1]);
        });
        return result;
    }

    // https://blogs.dropbox.com/developers/2013/07/using-oauth-2-0-with-the-core-api/
    constructor(appKey: string, redirectUrl: string) {
        this.appKey = appKey;
        this.redirectUrl = redirectUrl;
    }

    get AccountId(): string {
        return localStorage['dropbox_account_id'];
    }

    get AccessToken(): string {
        return localStorage['dropbox_access_token'];
    }

    get CsrfToken(): string {
        return localStorage['dropbox_csrf_token'];
    }

    set CsrfToken(token: string) {
        localStorage['dropbox_csrf_token'] = token;
    }

    getAuthenticationUrl(): string {
        // https://www.dropbox.com/oauth2/authorize?
        // client_id=<app key>&response_type=token&redirect_uri=<redirect URI>&state=<CSRF token>

        this.CsrfToken = this.getGUID();
        return `https://www.dropbox.com/oauth2/authorize?client_id=` +
            `${this.appKey}&response_type=token&redirect_uri=${this.redirectUrl}&state=${this.CsrfToken}`;
    }

    clearDropboxToken(): void {
        localStorage.removeItem('dropbox_account_id');
        localStorage.removeItem('dropbox_access_token');
        localStorage.removeItem('dropbox_csrf_token');
        localStorage.removeItem('dropbox_uid');
        localStorage.removeItem('dropbox_token_type');
        localStorage.removeItem('dropbox_state');
        console.log('cleared dropbox tokens');
    }

    getCurrentAccountInfo() {
        return new Promise((resolve, reject) => {
            const request = new XMLHttpRequest();
            request.open('POST', 'https://api.dropboxapi.com/2/users/get_current_account', true);
            request.setRequestHeader('Authorization', 'Bearer ' + this.AccessToken);
            request.onreadystatechange = (ev: Event) => {
                this.onreadystatechange(ev, resolve, reject);
            };
            request.onerror = (ev: Event) => {
                console.log('onerror called');
                this.handleError(<XMLHttpRequest>ev.target, reject);
            };
            request.send(null);
        });
    }

    getMetadata(filePath: string) {
        return new Promise((resolve, reject) => {
            const request = new XMLHttpRequest();
            request.open('POST', 'https://api.dropboxapi.com/2/files/get_metadata', true);
            request.setRequestHeader('Authorization', 'Bearer ' + this.AccessToken);
            request.onreadystatechange = (ev: Event) => {
                this.onreadystatechange(ev, resolve, reject);
            };
            request.onerror = (ev: Event) => {
                console.log('onerror called');
                this.handleError(<XMLHttpRequest>ev.target, reject);
            };
            request.send({
                'path': filePath,
                'include_media_info': false,
                'include_deleted': false,
                'include_has_explicit_shared_members': false
            });
        });
    }

    upload(content: string, filePath: string) {
        return new Promise((resolve, reject) => {
            const request = new XMLHttpRequest();
            request.open('POST', 'https://content.dropboxapi.com/2/files/upload', true);
            request.setRequestHeader('Authorization', 'Bearer ' + this.AccessToken);
            request.setRequestHeader('Dropbox-API-Arg', JSON.stringify({
                'path': filePath,
                'mode': 'overwrite',
                'autorename': true,
                'mute': false
            }));
            request.setRequestHeader('Content-Type', 'application/octet-stream');
            request.onreadystatechange = (ev: Event) => {
                this.onreadystatechange(ev, resolve, reject);
            };
            request.onerror = (ev: Event) => {
                console.log('onerror called');
                this.handleError(<XMLHttpRequest>ev.target, reject);
            };
            request.send(content);
        });
    }

    download(filePath: string) {
        return new Promise((resolve, reject) => {
            const request = new XMLHttpRequest();
            request.open('POST', 'https://content.dropboxapi.com/2/files/download', true);
            request.setRequestHeader('Authorization', 'Bearer ' + this.AccessToken);
            request.setRequestHeader('Dropbox-API-Arg', JSON.stringify({
                'path': filePath
            }));
            request.onreadystatechange = (ev: Event) => {
                this.onreadystatechange(ev, resolve, reject);
            };
            request.onerror = (ev: Event) => {
                console.log('onerror called');
                this.handleError(<XMLHttpRequest>ev.target, reject);
            };
            request.send(null);
        });
    }

    revokeToken() {
        return new Promise((resolve, reject) => {
            const request = new XMLHttpRequest();
            request.open('POST', 'https://api.dropboxapi.com/2/auth/token/revoke', true);
            request.setRequestHeader('Authorization', 'Bearer ' + this.AccessToken);
            request.onreadystatechange = (ev: Event) => {
                this.onreadystatechange(ev, resolve, reject);
                this.clearDropboxToken();
            };
            request.onerror = (ev: Event) => {
                console.log('onerror called');
                this.handleError(<XMLHttpRequest>ev.target, reject);
            };
            request.send(null);
        });
    }

    private onreadystatechange(ev: Event, resolve, reject) {
        const req = <XMLHttpRequest>ev.target;
        if (req.readyState === XMLHttpRequest.DONE) {
            if (req.status === 200) {
                // console.log('onreadystatechange 200', ev);
                resolve(req.response);
            } else {
                console.log('onreadystatechange !200', ev);
                this.handleError(req, reject);
            }
        }
    }

    private handleError(req: XMLHttpRequest, reject: any) {
        if (req.status === 400 || req.status === 401) {
            console.error(req.status === 400 ? 'Bad input parameter.'
                    : 'Bad or expired token.');
            this.clearDropboxToken();
            reject(req.response);
            return;
        }

        if (req.status === 409) {
            console.error(req.response);
            const endpoint = JSON.parse(req.response); // error, user_message, error_summary
            reject(endpoint['user_message'] || endpoint['error_summary']);
            return;
        }

        if (req.status === 429) {
            console.error(req.response);
            reject('Your account is making too many requests to dropbox, and its being rate limited. Please try after sometime.');
            return;
        }

        if (req.status >= 500) {
            console.error(req.response);
            reject('Something is wrong with dropbox servers (<a href="https://status.dropbox.com/">check status</a>).' +
                   'Please try after sometime.');
            return;
        }

        console.error('Uncought dropbox error ', req.response);
        reject(req.response);
    }

    private getGUID() {
        // https://stackoverflow.com/questions/105034/create-guid-uuid-in-javascript
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            let r = Math.random() * 16 | 0, // tslint:disable-line
                v = c === 'x' ? r : (r & 0x3 | 0x8); // tslint:disable-line
            return v.toString(16);
        });
    }
}

// private dropbox_status = {
//         400: () => {
//             console.log('Bad input parameter. Error message should indicate which one and why.');
//         },
//         401: () => {
//             console.log('Bad or expired token. This can happen if the user or Dropbox revoked or expired an access token. ' +
//                 'To fix, you should re-authenticate the user.');
//             alert('Dropbox session expired or revoked. Please login again.');
//             this.clearDropboxToken();
//         },
//         403: () => {
//             console.log('Bad OAuth request (wrong consumer key, bad nonce, expired timestamp...). ' +
//                 'Unfortunately, re-authenticating the user won\'t help here.');
//             this.clearDropboxToken();
//         },
//         404: () => {
//             alert('File or folder not found at the specified path.');
//         },
//         405: () => {
//             console.log('Request method not expected (generally should be GET or POST).');
//         },
//         503: () => {
//             console.log('Your app is making too many requests and is being rate limited. 503s can trigger on a per-app or per-user basis.');
//             alert('TV Watchlist is making too many requests to dropbox and is being rate limited');
//         },
//         507: () => {
//             alert('User is over Dropbox storage quota.');
//         }
//     };