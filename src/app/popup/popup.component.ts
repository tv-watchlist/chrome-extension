import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { ActivatedRoute } from '@angular/router';

import { LoggerService, SettingsService, DropboxService } from '../providers';
import { Settings } from '../models';

@Component({
  selector: 'tvq-popup',
  templateUrl: './popup.component.html',
  styleUrls: ['./popup.component.scss']
})
export class PopupComponent implements OnInit {

  settings: Settings;
  constructor( private logger: LoggerService,
        private settingSvc: SettingsService,
        private dropboxSvc: DropboxService
        ) {
    this.settings = new Settings();
  }

  async ngOnInit() {
    this.settings = await this.settingSvc.getSettings();
    // if (!this.settings.ui) {
    //   this.settingSvc.setEmptyUIModel(this.settings);
    // }
    this.logger.log('options', this.settings);
  }
}
