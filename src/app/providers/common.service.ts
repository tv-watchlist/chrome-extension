import { Injectable } from '@angular/core';

@Injectable()
export class CommonService {

  constructor() { }

  ParseDate(yyyy_mm_dd, hh_mm) {
    let d = yyyy_mm_dd.match(/(\d+)/g);
    // new Date(year, month [, date [, hours[, minutes[, seconds[, ms]]]]])
    if(d[1] == "00")
    {
      d[1] ="12";
    }
    if(d[2] == "00")
    {
      d[2] ="30";
    }
    if (hh_mm) {
        let t = this.ParseTime(hh_mm);
        let hr = t[0]==='PM'? t[1]+12:t[1];
        return new Date(d[0], d[1] - 1, d[2], hr, t[2]); // months are 0-based
    } else {
        return new Date(d[0], d[1] - 1, d[2]); // months are 0-based
    }
  }
  //result as array[is12HrFormat,Hr,Min,Sec,Ms] "3:00 AM"
  /**
   * "3:00 AM" = ['AM', 3, 0];
   * @param hh_mm 
   */
  ParseTime(hh_mm) {
      if (hh_mm) {
          let ampm = hh_mm.toLowerCase().match(/am|pm/gi);
          let t = hh_mm.match(/(\d+)/g);
          return [ampm ? ampm[0].toUpperCase() : null, t[0], t[1], t[2], t[3]];
      }
  }

  DaysBetween(first: Date, second: Date) {
    const millisecondsPerDay = 1000 * 60 * 60 * 24;
    const millisBetween = second.getTime() - first.getTime();
    const days = Math.abs(millisBetween / millisecondsPerDay);
    return Number(days.toFixed(4));
  };

  DaysBetweenToEnglish(first: Date, second: Date) {
    if (!first || !second) {
      return 'TBA';
    }

    const days = this.DaysBetween(new Date(first.getFullYear(), first.getMonth(), first.getDate()),
      new Date(second.getFullYear(), second.getMonth(), second.getDate()));

    if (Number((days / 365).toFixed(2)) > 2) {
      return 'TBA';
    }
    if (days < 1) {
      return 'Today';
    } else if (days < 2) {
      return 'Tomorrow';
    } else if (days < 30) {
      return this.pluralize(days, ' Day');
    } else if (days < 90) {
      return this.pluralize(Number((days / 7).toFixed(0)), ' Week');
    } else if (days < 365) {
      return this.pluralize(Number((days / 30).toFixed(0)), ' Month');
    } else {
      return this.pluralize(Number((days / 365).toFixed(0)), ' Year');
    }
  };

  pluralize(count: number, noun: string,
    options?: { suffix?: string, zeroPlaceholder?: string, showCount?: boolean, replaceWithPlural?: string }) {
    const defaultOptions = {
      suffix: 's', // will add suffix when plural, default is 's', can change to 'es' etc
      zeroPlaceholder: '0', // if say want to replace 0 with 'No'
      showCount: true, // dont show number
      replaceWithPlural: '' // replace the whole noun when plural
    };
    if (!options) {
      options = defaultOptions;
    } else {
      for (const key in defaultOptions) {
        if (defaultOptions.hasOwnProperty(key)) {
          if (options[key] === void 0) {
            options[key] = defaultOptions[key];
          }
        }
      }
    }
    const counter = `${(count === 0 ? options.zeroPlaceholder : count)} `;
    if (!!options.replaceWithPlural) {
      return `${(options.showCount ? counter : '')}${(count !== 1 ? options.replaceWithPlural : noun)}`;
    } else {
      return `${(options.showCount ? counter : '')}${noun}${(count !== 1 ? options.suffix : '')}`;
    }
  }

  _comparison = (a, b, property): number => {
    property = property || '';
    const isDescending = property.substr(0, 1) === '-';
    if (isDescending || property.substr(0, 1) === '+') {
      property = property.substr(1);
    }
    const sortOrder = isDescending ? -1 : 1;

    if (!property) {
      // if no property is given then its a primitive type
      return ((a < b) ? -1 : (a > b) ? 1 : 0) * sortOrder;
    }

    let aValue = a[property];
    let bValue = b[property];

    const propertySplit = property.split('.');
    if (typeof aValue === 'undefined' && typeof bValue === 'undefined' && propertySplit.length > 1) {
      aValue = a;
      bValue = b;
      for (let j = 0; j < propertySplit.length; j++) {
        aValue = aValue[propertySplit[j]];
        bValue = bValue[propertySplit[j]];
      }
    }

    return ((aValue < bValue) ? -1 : (aValue > bValue) ? 1 : 0) * sortOrder;
  }

  /**
   * sorting can be for string[] or object[]
   * prefix '-' before property to reverse sort
   * @param property
   */
  dynamicSort(property: string) {
    return (a, b) => {
      return this._comparison(a, b, property);
    };
  }

  // https://github.com/FuelInteractive/fuel-ui/blob/b9e0fbbf583475e3c9dec5c1b704ef1917452f55/src/pipes/OrderBy/OrderBy.ts
  // https://stackoverflow.com/questions/2784230/javascript-how-do-you-sort-an-array-on-multiple-columns
  // https://github.com/fknop/angular-pipes/blob/master/docs/array.md
  /**
   * sorting is for object[]
   * prefix '-' before property to reverse sort
   * @param property
   */
  multipleDynamicSort(properties: string[]) {
    return (a, b) => {
      for (let i = 0; i < properties.length; i++) {
        const property = properties[i];

        const comparison = this._comparison(a, b, property);
        if (comparison !== 0) {
          return comparison;
        }
      }
      return 0;
    };
  }

  clone(obj: any) {
    // https://stackoverflow.com/questions/122102/what-is-the-most-efficient-way-to-deep-clone-an-object-in-javascript/5344074#5344074
    return JSON.parse(JSON.stringify(obj));
  }

  copyProperties(source: any, target: any): void {
    // console.log('copyProperties source', source, 'target', target);
    for (const key in source) {
      if (source.hasOwnProperty(key)) {
        target[key] = source[key];
      }
    }
  }

  objectSize(obj) {
      let size = 0, key;
      if (obj) {
          for (key in obj) {
              if (obj.hasOwnProperty(key)) {
                size++;
              }
          }
      }
      return size;
  }

  isObjectEmpty(obj) {
    for (const name in obj) {
      if (obj.hasOwnProperty(name)) {
        return false;
      }
    }
    return true;
  }

  ZeroPad(num, places) {
        if (!num) {
          num = 0;
        }
        return Array(Math.max(places - String(num).length + 1, 0)).join('0') + num;
  }

  AddDay(now: Date, counter: number) {
        const d1 = new Date(now);
        const d2 = new Date(d1);
        d2.setDate(d1.getDate() + counter);
        return d2;
  }

  AddMonth(now: Date, counter: number) {
        const d1 = new Date(now);
        const d2 = new Date(d1);
        d2.setMonth(d1.getMonth() + counter);
        return d2;
  }

  AddHour(now: Date, counter: number) {
        const d1 = new Date(now);
        const d2 = new Date(d1);
        d2.setHours(d1.getHours() + counter);
        return d2;
  }
}
