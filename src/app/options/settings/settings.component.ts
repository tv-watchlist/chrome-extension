import { Component, OnInit } from '@angular/core';

import { LoggerService } from '../../providers/logger.service';
import { SettingsService, Settings } from '../../providers/settings.service';


@Component({
  selector: 'tvq-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {

  settings: Settings;
  countries: any[];
  countryMap: {[abr: string]: string};
  constructor( private logger: LoggerService, private settingSvc: SettingsService) {
    this.settings = new Settings();
    this.countries = settingSvc.getTimezoneCountries();
    this.countryMap = {};
    this.countries.forEach(o => {
      this.countryMap[o.key] = o.value;
    });
  }

  async ngOnInit() {
    this.settings = await this.settingSvc.getSettings();
    if (!this.settings.ui) {
      this.settings.setUIModel();
    }
    this.logger.log('options', this.settings);
    // this.settingSvc.setSettings({update_time:(new Date()).getTime()});
  }

  Save(key: string) {
    this.logger.log('tvq-settings Save', key);
    this.settingSvc.setSettings(this.settings);
  }

  AddTimezone(country: HTMLInputElement, offset: HTMLInputElement) {
    this.logger.log('tvq-settings AddTimezone', country.value, offset.value);
    if (!!country.value && offset.value !== ''){
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

  SaveColor() {

  }
  // SaveColor(runningUnseen: string, runningSeen: string,
  //           tbaUnseen: string, tbaSeen: string,
  //           completedUnseen: string, completedSeen: string) {
  //   this.logger.log('tvq-settings SaveColor');
  //   // const ui = {
  //   //     'runningUnseen': { 'cssText': this.cleanupCss(runningUnseen) },
  //   //     'runningSeen': { 'cssText': this.cleanupCss(runningSeen) },
  //   //     'tbaUnseen': { 'cssText': this.cleanupCss(tbaUnseen) },
  //   //     'tbaSeen': { 'cssText': this.cleanupCss(tbaSeen) },
  //   //     'completedUnseen': { 'cssText': this.cleanupCss(completedUnseen) },
  //   //     'completedSeen': { 'cssText': this.cleanupCss(completedSeen) }
  //   // };

  //   // this.settings.ui = ui;
  //   this.settingSvc.setSettings(this.settings);
  // }

  cleanupCss(txt) {
      const map = this.cssTextToMap(txt);
      let str = '';
      for (const key in map) {
        if (map.hasOwnProperty(key)) {
          if (key.indexOf('background') !== -1 || key.indexOf('color') !== -1) {
            str = str + key + ':' + map[key] + ';';
          }
        }
      }
      return str;
  }

  cssTextToMap(txt) {
      const map = {};
      if (txt) {
          const style = txt.split(';');
          for (let i = 0; i < style.length; i++) {
              const key_value = style[i].split(':');
              if (key_value[0] && key_value[0].trim() !== '') {
                  map[key_value[0].trim()] = key_value[1].trim();
              }
          }
      }
      return map;
  }

}
