import { Component, OnInit, ViewEncapsulation, HostBinding } from '@angular/core';
import { MenuItem } from 'primeng/primeng';

import { SettingsService, LoggerService, TvMazeService, TheTvDbService } from '../../providers';

@Component({
  selector: 'tvq-help',
  templateUrl: './help.component.html',
  styleUrls: ['./help.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class HelpComponent implements OnInit {

  constructor(private logger: LoggerService, private tvmazeSvc: TvMazeService, private tvDbSvc: TheTvDbService) {

  }
  
  Result:any;
  QueryResult:any;
  ngOnInit() {
    
  }

  searchMaze(name:string){
    this.tvmazeSvc.Search(name).subscribe(result => {
      this.Result = result;
    });
  }

  searchTvDb(name:string){
    this.tvDbSvc.searchSeries(name).subscribe(result => {
      this.Result = result;
    });
  }

  queryMaze(tvmaze_id: number){
    this.tvmazeSvc.ShowAndEpisodes(tvmaze_id).subscribe(result => {
      this.QueryResult = result;
    });
  }
  queryTvDb(series_id: number){
    this.tvDbSvc.ShowAndEpisodes(series_id).subscribe(result => {
      this.QueryResult = result;
    });
  }
}
