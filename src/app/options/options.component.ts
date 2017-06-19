import { Component, OnInit, ViewEncapsulation, HostBinding } from '@angular/core';
import { MenuItem } from 'primeng/primeng';

import { LoggerService } from '../providers/logger.service';
import { SettingsService } from '../providers/settings.service';

@Component({
  selector: 'tvq-options',
  templateUrl: './options.component.html',
  styleUrls: ['./options.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class OptionsComponent implements OnInit {
  title = 'tvq option works!';
  public List: {[Name: string]: { Name: string, Value: any}};
  public menuItems: MenuItem[];

  constructor(private logger: LoggerService) {

  }

 // http://akveo.com/ng2-admin/#/pages/dashboard
  ngOnInit() {
    // document.body.style.backgroundColor = 'F5DEB3';
  }
}
