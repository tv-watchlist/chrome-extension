import { Injectable } from '@angular/core';

import { CountryIso2, Settings } from '../models';

import {
  LoggerService,
  IDXDataDefinitionService,
  IDXDataManipulationService } from './';

@Injectable()
export class SettingsService {
  _settings: Settings;
  constructor(private dml: IDXDataManipulationService, private logger: LoggerService) {

  }

  async getSettings(): Promise<Settings> {
    try {
        if (!!this._settings) {
          return this._settings;
        }
        const fetchResult = await this.dml.FetchAll('settings');
        const settings = new Settings();
        for (let index = 0; index < fetchResult[0].length; index++) {
          const element = fetchResult[0][index];
          settings[element.Name] = element.Value;
        }
        this._settings = settings;
        // this.logger.log('FetchAll', settings);
        return settings;
      } catch (error) {
        this.logger.error(error);
      }
  }

  setEmptyUIModel(setting: Settings) {
    setting.ui = {
        'runningUnseen': { 'cssText': '' },
        'runningSeen': { 'cssText': '' },
        'tbaUnseen': { 'cssText': '' },
        'tbaSeen': { 'cssText': '' },
        'completedUnseen': { 'cssText': '' },
        'completedSeen': { 'cssText': '' }
    };
  }

  setSettings(setting: Settings) {
    try {
      const list = [];
      for (const key in setting) {
        if (setting.hasOwnProperty(key)) {
          list.push({ 'Name': key, 'Value': setting[key] });
        }
      }
      this._settings = null;
      if (list.length > 0) {
        return this.dml.AddList('settings', list);
      }
    } catch (error) {
        return Promise.reject(error);
    }
  }

  getTimezoneCountries() {
    const countries = ['US', 'AU', 'UK', 'CA', 'JP', 'NL', 'RU', 'DE', 'NZ', 'BE', 'SG', 'KR', 'ES', 'UA', 'NO'];
    const result = [];
    countries.forEach(element => {
      result.push({'key': element, 'value': CountryIso2[element]});
    });
    return result;
  }
}
