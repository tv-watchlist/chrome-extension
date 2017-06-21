import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { MenuItem } from 'primeng/primeng';

import { LoggerService } from '../../providers/logger.service';
import { SettingsService } from '../../providers/settings.service';

@Component({
  selector: 'tvq-nav-bar',
  templateUrl: './nav-bar.component.html',
  styleUrls: ['./nav-bar.component.scss']
})
export class NavBarComponent implements OnInit {

  constructor(private logger: LoggerService) {

  }

  async ngOnInit() {

  }
}
