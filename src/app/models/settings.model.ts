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
  dropbox_file_path?: string;

  constructor() {
    this.ui = {};
    this.notify_before = 0;
    this.running_days_limit = 0;
    this.timezone_offset = {};
    this.custom_shows_order = [];
    this.dropbox_file_path = '/tv-watchlist-db.txt';
  }
}
