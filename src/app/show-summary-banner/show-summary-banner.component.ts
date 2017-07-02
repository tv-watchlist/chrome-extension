import { Component, OnChanges, Input, ViewEncapsulation, SimpleChanges } from '@angular/core';

let ssbCounter = 0;

@Component({
  selector: 'tvq-show-summary-banner',
  templateUrl: './show-summary-banner.component.html',
  styleUrls: ['./show-summary-banner.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ShowSummaryBannerComponent implements OnChanges {
  id: string;
  styleMap: any;

  @Input() bannerUrl: string;
  @Input() containerStyle: string;
  @Input() compact: boolean;

  constructor() {
    this.id = `ssb${ssbCounter++}`;
    this.styleMap = {};
  }

  ngOnChanges(changes: SimpleChanges) {
    const _containerStyle = changes['containerStyle'];
    if (!!_containerStyle) {
      this.styleMap = this.cssTextToMap(_containerStyle.currentValue);
      this.styleMap['min-height'] = '65px';
    }
    const _bannerUrl = changes['bannerUrl'];
    if (!!_bannerUrl) {
      this.styleMap = this.bannerCss(_bannerUrl.currentValue);
      this.styleMap['min-height'] = '65px';
    }
    const _compact = changes['compact'];
    if (!!_compact && _compact.currentValue) {
      this.styleMap['min-height'] = '25px';
    }
  }

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

  bannerCss(bannerUrl: string) {
    return {
      'background-image': `url(${bannerUrl})`,
      'background-size': '100% 100%',
      'background-repeat': 'no-repeat'
    };
  }

  menter() {

  }

  mleave() {

  }
}
