import { Injectable } from '@angular/core';

import { CountryIso2, Settings } from '../models';

import {
  LoggerService,
  IDXDataDefinitionService,
  IDXDataManipulationService } from './';

@Injectable()
export class SettingsService {

  constructor(private dml: IDXDataManipulationService, private logger: LoggerService) {

  }

  async getSettings(): Promise<Settings> {
    try {
        const fetchResult = await this.dml.FetchAll('settings');
        const settings = new Settings();
        for (let index = 0; index < fetchResult[0].length; index++) {
          const element = fetchResult[0][index];
          settings[element.Name] = element.Value;
        }

        // this.logger.log('FetchAll', settings);
        return settings;
      } catch (error) {
        this.logger.error(error);
      }
  }

  async setSettings(setting: Settings) {
    try {
      const list = [];
      for (const key in setting) {
        if (setting.hasOwnProperty(key)) {
          list.push({ 'Name': key, 'Value': setting[key] });
        }
      }
      if (list.length > 0) {
        await this.dml.AddList('settings', list);
      }
    } catch (error) {
        this.logger.error(error);
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
