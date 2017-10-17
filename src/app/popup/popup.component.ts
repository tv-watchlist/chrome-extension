import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs/Observable';

import { TheTvDbService } from '../providers';
import { TheTvDbEpisode } from 'app/lib/thetvdb-api';
import { CommonService } from 'app/providers/common.service';
import { TvMazeService } from 'app/providers/tvmaze.service';

@Component({
  selector: 'tvq-popup',
  templateUrl: './popup.component.html',
  styleUrls: ['./popup.component.scss']
})
export class PopupComponent implements OnInit {
  title = 'tvq popup works!';
  constructor(private tmSvc: TvMazeService, private cmnSvc: CommonService) { }

  ngOnInit() {
    console.log(this.title);
    this.tmSvc.Search('spider-man').subscribe(response => {
      console.log('tvmaze Search', response);
    });
  }
}
