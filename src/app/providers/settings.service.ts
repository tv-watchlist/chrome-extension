import { Injectable } from '@angular/core';

import { IDXDataDefinitionService, IDXDataManipulationService } from './indexed-db.service';
import { LoggerService } from './logger.service';
import { CountryIso2 } from '../models/country.model';

export class Settings {
  advanced_css_hack?: string;
  animate_icon?: boolean; // 1, 0
  auto_update?: boolean; // 1, 0
  badge_flag?: string; // shows, episode
  compact_flag?: boolean; // 1, 0
  custom_shows_order?: string[];
  data_structure_version? = 5; // tvmaze
  default_country?: string;  // US
  enable_banner?: boolean; // 1, 0
  enable_notification?: boolean; // 1, 0
  hide_seen?: boolean;
  hide_tba?: boolean;
  listings_next_update_date?: number;
  notify_before?: number;
  running_days_limit?: number;
  override_episode_summary_link?: string;
  // schedules_next_update_date_US?: number;
  shows_order?: string;
  shows_update_frequency?: number;
  timezone_offset?: {[country: string]: number};
  ui?: any;
  update_time?: number; // Date

  constructor() {
    this.ui = {};
    this.notify_before = 0;
    this.running_days_limit = 0;
    this.timezone_offset = {};
    this.custom_shows_order = [];
  }

  setUIModel() {
    this.ui = {
        'runningUnseen': { 'cssText': '' },
        'runningSeen': { 'cssText': '' },
        'tbaUnseen': { 'cssText': '' },
        'tbaSeen': { 'cssText': '' },
        'completedUnseen': { 'cssText': '' },
        'completedSeen': { 'cssText': '' }
    };
  }
}

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
      if(list.length > 0) {
        await this.dml.AddList('settings', list);
      }
    } catch (error) {
        this.logger.error(error);
    }
  }

  getTimezoneCountries(){
    const countries = ['US', 'AU', 'UK', 'CA', 'JP', 'NL', 'RU', 'DE', 'NZ', 'BE', 'SG', 'KR', 'ES', 'UA', 'NO'];
    const result = [];
    countries.forEach(element => {
      result.push({'key': element, 'value': CountryIso2[element]});
    });
    return result;
  }
}
