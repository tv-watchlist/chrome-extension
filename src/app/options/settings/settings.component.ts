import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { LoggerService, SettingsService, DropboxService } from '../../providers';
import { Settings } from '../../models';

@Component({
  selector: 'tvq-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {

  settings: Settings;
  countries: any[];
  countryMap: {[abr: string]: string};
  selectedGroup: string;
  showAdvancedCssHack: boolean;
  isDropboxAuthenticated: boolean;
  reader: FileReader;
  constructor( private logger: LoggerService,
        private settingSvc: SettingsService,
        private route: ActivatedRoute,
        private dropboxSvc: DropboxService
        ) {
    this.settings = new Settings();
    this.countries = settingSvc.getTimezoneCountries();
    this.countryMap = {};
    this.countries.forEach(o => {
      this.countryMap[o.key] = o.value;
    });
    this.showAdvancedCssHack = false;
  }

  async ngOnInit() {
    this.settings = await this.settingSvc.getSettings();
    if (!this.settings.ui) {
      this.settingSvc.setEmptyUIModel(this.settings);
    }
    this.logger.log('options', this.settings);
    this.route.queryParams.subscribe((params) => {
        // console.log('route queryParams', params);
        this.selectedGroup = params['selectedGroup'] || 'preferences';
    });
    // this.route.fragment.subscribe(f => {
    //   const element = document.querySelector('#' + f)
    //   if (element) element.scrollIntoView(element)
    // })
    this.isDropboxAuthenticated = this.dropboxSvc.isAuthenticated();
  }

  Save(key: string) {
    this.logger.log('tvq-settings Save', key);
    this.settingSvc.setSettings(this.settings);
  }

  AddTimezone(country: HTMLInputElement, offset: HTMLInputElement) {
    this.logger.log('tvq-settings AddTimezone', country.value, offset.value);
    if (!!country.value && offset.value !== '') {
      this.settings.timezone_offset = this.settings.timezone_offset || {};
      this.settings.timezone_offset[country.value] = +offset.value;
      this.settingSvc.setSettings(this.settings);
    }
  }

  GetArray(object: any = {}) {
    return Object.keys(object);
  }

  SaveLink() {
    this.logger.log('tvq-settings SaveLink');
    this.settingSvc.setSettings(this.settings);
  }

  downloadBackup() {
    // $('#download_ajax').show();
    // nsr.myTvQ.migration.ExportBackup(function (backupStr) {
        const backupStr = 'testing 1 23 44';
        const URL = window.URL;
        // Create ObjectURL
        const fileUrl = URL.createObjectURL(new Blob([backupStr], { type: 'text/plain' }));
        const a = document.createElement('a');
        a.setAttribute('href', fileUrl);
        a.download = 'tv-watchlist.txt';
        a.click();
        URL.revokeObjectURL(fileUrl);
        // $('#download_ajax').hide();
    // });
  }

  restoreBackup(event) {
    this.reader = new FileReader();
    this.reader.onerror = (evt) => {
      const fr = <FileReader>evt.target;
      const err = <DOMException>fr.error;
      switch (err.name) {
        case 'NotFoundError':
            // The File or Blob could not be found at the time the read was processed.
            console.error('File Not Found!');
            break;
          case 'SecurityError':
            // An error not covered by other error codes occured including:
            // * Certain files are unsafe for access within a web application.
            // * Too many read calls are being made on File or Blob resources.
            // * The file has changed on disk since the user selected it.
            break;
          case 'AbortError':
            // The read operation was aborted, typically with a call to abort().
            break;
          case 'NotReadableError':
            // The File or Blob cannot be read, typically due due to permission problems
            // that occur after a reference to a File or Blob has been acquired (concurrent lock with another application).
            console.error('File is not readable!');
            break;
          case 'EncodingError':
            // The length of the data URL for a File or Blob is too long.
            break;
          default:
          console.error('File error code: ' + err.name) ;
      };
    };
    // If we use onloadend, we need to check the readyState.
    this.reader.onloadend = (evt) => {
        const fr = <FileReader>evt.target;
        if (fr.readyState === 2) { // DONE == 2
            const fileContent = fr.result;
            try {
                console.log('fileContent', fileContent);
                // localStorage['pause'] = 1;
                // let backup = JSON.parse(fileContent || '{}');
                // nsr.myTvQ.migration.ImportBackup(backup, function (count) {
                //     nsr.myTvQ.subscribed.SetBadgeStatus();
                //     console.log('Imported', count);
                //     displayStatus('#myTvQStatus', 'Saved...');
                //     localStorage['pause'] = 0;
                // });
            } catch (e) {
                console.log('Import Error', e);
                // displayStatus('#myTvQStatus', 'Error: Invalid json.', true);
            }
        }
    };

    const file = event.target.files[0]; // FileList object.
    // console.log(file);
    // Read in the file as a binary string.
    // will invoke onloadend with content
    this.reader.readAsText(file);
  }

  DropboxLogin() {
    if (!this.dropboxSvc.isAuthenticated()) {
      window.open(this.dropboxSvc.getAuthenticationUrl(), 'dropboxWindow');
    } else {
      // console.log(this.dropboxSvc.AccessToken);
      this.dropboxSvc.getAccountInfo().then(function (result) {
          console.log('Dropbox already authenticated', result);
      }).catch(function (err) {
          console.error('Dropbox Error:', err);
      });
    }
  }

  DropboxDownload() {
      this.dropboxSvc.download(this.settings.dropbox_file_path).then(function (data) {
        console.log('dropbox data', data);
        // try {
        //     localStorage['pause'] = '1';
        //     nsr.myTvQ.migration.ImportBackup(JSON.parse(data), function (count) {
        //         nsr.myTvQ.subscribed.SetBadgeStatus();
        //         localStorage['pause'] = '0';
        //         console.log('Imported', count);
        //         displayStatus('#myTvQStatus', 'Imported...');
        //     });
        // } catch (e) {
        //     console.log('Import Error', e);
        // }
    }).catch(function (err) {
        console.error('Dropbox Error:', err);
    });
  }

  DropboxUpload() {
    // nsr.myTvQ.migration.ExportBackup(function (backupStr) {
        this.dropboxSvc.upload('this is test 1 2 3 ' + Date.now() , this.settings.dropbox_file_path).then(function (data) {
            console.log('uploaded', data);
        }).catch(function (err) {
            console.error('Dropbox  Error:', err);
        });
    // });
  }

  DropboxLogout() {
   this.dropboxSvc.revokeToken().then((data) => {
    this.isDropboxAuthenticated = false;
   }).catch((err) => {
     this.isDropboxAuthenticated = false;
   });
  }

  SaveColor() {
    this.logger.log('tvq-settings SaveColor');
    this.settingSvc.setSettings(this.settings);
  }

  PreviewColor(scheme: string) {
    switch (scheme) {
      case 'saint-patrick-day':
        this.settings.ui = this.GetSaintPatrickColorScheme();
        break;
      case 'valentine':
        this.settings.ui = this.GetValentineColorScheme();
        break;
      case 'christmas':
        this.settings.ui = this.GetChristmasColorScheme();
        break;
      case 'halloween':
        this.settings.ui = this.GetHalloweenColorScheme();
        break;
      case 'easter':
        this.settings.ui = this.GetEasterColorScheme();
        break;
      case 'cool-patterns':
        this.settings.ui = this.GetCoolPatternsColorScheme();
        break;
      case 'default':
      default:
      this.settings.ui = this.GetDefaultColorScheme();
        break;
    }
  }

  GetDefaultColorScheme() {
    return {
        runningUnseen: { cssText: 'background-color:rgba(0, 100, 0, 0.60);color:black' },
        runningSeen: { cssText: 'background-color:rgba(0, 255, 0, 0.34);color:black' },
        tbaUnseen: { cssText: 'background-color:rgba(65, 105, 225, 1);color:black' },
        tbaSeen: { cssText: 'background-color:rgba(30, 144, 255, 0.34);color:black' },
        completedUnseen: { cssText: 'background-color:rgba(0, 0, 0, 0.60);color:black' },
        completedSeen: { cssText: 'background-color:rgba(192, 192, 192, 1);color:black' }
    };
  }

  GetCoolPatternsColorScheme() {
    return {
      'runningUnseen' : { 'cssText': `background:
-webkit-radial-gradient(50% 59%, circle , #D2CAAB 3%, #364E27 4%, #364E27 11%, rgba(54,78,39,0) 12%, rgba(54,78,39,0)) 50px 0,
-webkit-radial-gradient(50% 41%, circle , #364E27 3%, #D2CAAB 4%, #D2CAAB 11%, rgba(210,202,171,0) 12%, rgba(210,202,171,0)) 50px 0,
-webkit-radial-gradient(50% 59%, circle , #D2CAAB 3%, #364E27 4%, #364E27 11%, rgba(54,78,39,0) 12%, rgba(54,78,39,0)) 0 50px,
-webkit-radial-gradient(50% 41%, circle , #364E27 3%, #D2CAAB 4%, #D2CAAB 11%, rgba(210,202,171,0) 12%, rgba(210,202,171,0)) 0 50px,
-webkit-radial-gradient(100% 50%, circle , #D2CAAB 16%, rgba(210,202,171,0) 17%),
-webkit-radial-gradient(0% 50%, circle , #364E27 16%, rgba(54,78,39,0) 17%),
-webkit-radial-gradient(100% 50%, circle , #D2CAAB 16%, rgba(210,202,171,0) 17%) 50px 50px,
-webkit-radial-gradient(0% 50%, circle , #364E27 16%, rgba(54,78,39,0) 17%) 50px 50px;
background-color:#63773F;background-size:100px 100px;color:rgb(255, 255, 255);` },
      'runningSeen': { 'cssText': `background-color:rgb(99, 119, 55);color:rgb(255, 255, 255);` },
      'tbaUnseen': { 'cssText': `background:
-webkit-radial-gradient(hsl(0, 100%, 27%) 4%, hsl(0, 100%, 18%) 9%, hsla(0, 100%, 20%, 0) 9%) 0 0,
-webkit-radial-gradient(hsl(0, 100%, 27%) 4%, hsl(0, 100%, 18%) 8%, hsla(0, 100%, 20%, 0) 10%) 50px 50px,
-webkit-radial-gradient(hsla(0, 100%, 30%, 0.8) 20%, hsla(0, 100%, 20%, 0)) 50px 0,
-webkit-radial-gradient(hsla(0, 100%, 30%, 0.8) 20%, hsla(0, 100%, 20%, 0)) 0 50px,
-webkit-radial-gradient(hsla(0, 100%, 20%, 1) 35%, hsla(0, 100%, 20%, 0) 60%) 50px 0,
-webkit-radial-gradient(hsla(0, 100%, 20%, 1) 35%, hsla(0, 100%, 20%, 0) 60%) 100px 50px,
-webkit-radial-gradient(hsla(0, 100%, 15%, 0.7), hsla(0, 100%, 20%, 0)) 0 0,
-webkit-radial-gradient(hsla(0, 100%, 15%, 0.7), hsla(0, 100%, 20%, 0)) 50px 50px,
-webkit-linear-gradient(45deg, hsla(0, 100%, 20%, 0) 49%, hsla(0, 100%, 0%, 1) 50%, hsla(0, 100%, 20%, 0) 70%) 0 0,
-webkit-linear-gradient(-45deg, hsla(0, 100%, 20%, 0) 49%, hsla(0, 100%, 0%, 1) 50%, hsla(0, 100%, 20%, 0) 70%) 0 0;
background-color:#300;background-size:100px 100px;color:rgb(255, 255, 255);` },
      'tbaSeen': { 'cssText': `background-color:rgba(155, 3, 3, 0.8);color:rgb(255, 255, 255);` },
      'completedUnseen': { 'cssText': `background:-webkit-radial-gradient(black 15%, transparent 16%) 0 0,
-webkit-radial-gradient(black 15%, transparent 16%) 8px 8px,
-webkit-radial-gradient(rgba(255,255,255,.1) 15%, transparent 20%) 0 1px,
-webkit-radial-gradient(rgba(255,255,255,.1) 15%, transparent 20%) 8px 9px;
background-color:#282828;background-size:16px 16px;color:rgb(255, 255, 255);` },
      'completedSeen' : { 'cssText': `background-color:rgb(40, 40, 40);color:rgb(255, 255, 255);` }
        };
  }

  GetEasterColorScheme() {
    return {
              'runningUnseen': { 'cssText': `background-color:#ac0;background-image:
-webkit-linear-gradient(45deg, rgba(255, 255, 255, .2) 25%,
transparent 25%,transparent 50%,rgba(255, 255, 255, .2) 50%, rgba(255, 255, 255, .2) 75%,transparent 75%,
transparent);background-size:26px 26px;` },
              'runningSeen': { 'cssText': 'background-color:rgba(170, 204, 0, 0.8);color:rgb(0, 0, 0);' },
              'tbaUnseen': { 'cssText': `background-color:#0ae;background-image:
-webkit-linear-gradient(rgba(255, 255, 255, .2) 50%,
transparent 50%, transparent);background-size:20px 20px;` },
              'tbaSeen': { 'cssText': 'background-color:rgba(0, 170, 238, 0.8);color:rgb(0, 0, 0);' },
              'completedUnseen': { 'cssText': `background-color:#f90;background-image:
-webkit-linear-gradient(0deg, rgba(255, 255, 255, .2) 50%,
transparent 50%, transparent);background-size:20px 20px;`},
              'completedSeen': { 'cssText': 'background-color:rgba(255, 153, 0, 0.8);color:rgb(0, 0, 0);' }
          };
  }

  GetHalloweenColorScheme() {
    return {
            runningUnseen: { cssText: 'background-color:rgb(255, 140, 0);color:rgb(0, 0, 0)' },
            runningSeen: { cssText: 'background-color:rgb(255, 215, 0);color:rgb(0, 0, 0)' },
            tbaUnseen: { cssText: 'background-color:rgb(139, 69, 19);color:rgb(0, 0, 0)' },
            tbaSeen: { cssText: 'background-color:rgb(244, 164, 96);color:rgb(0, 0, 0)' },
            completedUnseen: { cssText: 'background-color:rgb(0, 0, 0);color:rgb(255, 255, 255)' },
            completedSeen: { cssText: 'background-color:rgb(105, 105, 105);color:rgb(0, 0, 0)' }
        };
  }

  GetChristmasColorScheme() {
      return {
          runningUnseen: { cssText: 'background-color:rgb(52, 202, 0);color:rgb(0, 0, 0)' },
          runningSeen: { cssText: 'background-color:rgb(173, 255, 47);color:rgb(0, 0, 0)' },
          tbaUnseen: { cssText: 'background-color:rgb(249, 32, 44);color:rgb(0, 0, 0)' },
          tbaSeen: { cssText: 'background-color:rgba(242, 47, 78, 0.8);color:rgb(0, 0, 0)' },
          completedUnseen: { cssText: `background-color: rgb(239, 1, 219);background-image: -webkit-gradient(linear, 0 0, 100% 100%,
 color-stop(.25, rgba(255, 255, 255, .2)),color-stop(.25,transparent),color-stop(.5, transparent),
 color-stop(.5, rgba(255, 255, 255, .2)),color-stop(.75, rgba(255, 255, 255, .2)),
 color-stop(.75, transparent),to(transparent));
 background-image: -webkit-linear-gradient(-45deg, rgba(255, 255, 255, .2) 25%, transparent 25%,transparent 50%,
 rgba(255, 255, 255, .2) 50%, rgba(255, 255, 255, .2) 75%,transparent 75%, transparent);
 background-size: 26px 26px;` },
          completedSeen: { cssText: 'background-color:rgb(238, 130, 238);color:rgb(0, 0, 0)' }
      };
    }

    GetValentineColorScheme() {
      return  {
            'runningUnseen': { 'cssText': `background:-webkit-radial-gradient(60% 43%, circle closest-side ,
rgb(255, 105, 180) 27%, rgba(187,0,51,0) 27%),-webkit-radial-gradient(40% 43%, circle closest-side , rgb(255, 105, 180) 27%,
rgba(187,0,51,0) 27%),-webkit-radial-gradient(40% 22%, circle closest-side , #f00 45%, rgba(221,51,85,0) 46%),
-webkit-radial-gradient(60% 22%, circle closest-side , #f00 45%, rgba(221,51,85,0) 46%),
-webkit-radial-gradient(50% 35%, circle closest-side , #f00 30%, rgba(221,51,85,0) 31%),
-webkit-radial-gradient(60% 43%, circle closest-side , rgb(255, 105, 180) 27%, rgba(187,0,51,0) 27%) 50px 50px,
-webkit-radial-gradient(40% 43%, circle closest-side , rgb(255, 105, 180) 27%, rgba(187,0,51,0) 27%) 50px 50px,
-webkit-radial-gradient(40% 22%, circle closest-side , #f00 45%, rgba(221,51,85,0) 46%) 50px 50px,
-webkit-radial-gradient(60% 22%, circle closest-side , #f00 45%, rgba(221,51,85,0) 46%) 50px 50px,
-webkit-radial-gradient(50% 35%, circle closest-side , #f00 30%, rgba(221,51,85,0) 31%) 50px 50px;
background-color:rgb(255, 105, 180);background-size:100px 100px;` },
            'runningSeen': { 'cssText': 'background-color:rgb(254, 158, 206);color:rgb(0, 0, 0);' },
            'tbaUnseen': { 'cssText': 'background-color:rgb(128, 0, 128);color:rgb(0, 0, 0);' },
            'tbaSeen': { 'cssText': 'background-color:rgb(238, 130, 238);color:rgb(0, 0, 0);' },
            'completedUnseen': { 'cssText': 'background-color:rgb(130, 0, 0);color:rgb(0, 0, 0);' },
            'completedSeen': { 'cssText': 'background-color:rgb(197, 28, 28);color:rgb(0, 0, 0);' }
        };
    }

    GetSaintPatrickColorScheme() {
        // {
        //         runningUnseen: { cssText:'background-color:#00C12B;color:rgb(0, 0, 0)' },
        //         runningSeen: { cssText:'background-color:#A5EF00;color:rgb(0, 0, 0)' },
        //         tbaUnseen: { cssText:'background-color:#4AA329;color:rgb(0, 0, 0)' },
        //         tbaSeen: { cssText:'background-color:#6ACA47;color:rgb(0, 0, 0)' },
        //         completedUnseen: { cssText:'background-color:#007D1C;color:rgb(0, 0, 0)' },
        //         completedSeen: { cssText:'background-color:#6B9B00;color:rgb(0, 0, 0)' }
        // };
        return {
            'runningUnseen': { 'cssText': 'background:-webkit-linear-gradient(top, #c9de96 0%,#4cb501 44%,#398235 100%);' },
            'runningSeen': { 'cssText': 'background:-webkit-linear-gradient(top, #d2ff52 0%,#91e842 100%);' },
            'tbaUnseen': { 'cssText': 'background:-webkit-linear-gradient(top, #006e2e 0%,#006e2e 100%);' },
            'tbaSeen': { 'cssText': 'background:-webkit-linear-gradient(top, #6bba70 0%,#6bba70 100%);' },
            'completedUnseen': { 'cssText': 'background:-webkit-linear-gradient(top, #627d4d 0%,#1f3b08 100%);' },
            'completedSeen': { 'cssText': 'background:-webkit-linear-gradient(top, #a4b357 0%,#75890c 100%);' }
        };
    }
}
