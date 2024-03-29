import { Component, OnInit, ViewEncapsulation, HostBinding } from '@angular/core';
import { MenuItem } from 'primeng/primeng';

import { SettingsService, LoggerService, TvMazeService, TheTvDbService,IDXDataDefinitionService,
  IDXDataManipulationService  } from '../../providers';


@Component({
  selector: 'tvq-help',
  templateUrl: './help.component.html',
  styleUrls: ['./help.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class HelpComponent implements OnInit {

  constructor(private logger: LoggerService, 
    private tvmazeSvc: TvMazeService, 
    private tvDbSvc: TheTvDbService,
    private dml: IDXDataManipulationService 
  ) {

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
      this.dml.SetObj('subscribed_shows', result.show).then(obj=>{
        console.log('subscribed_shows',obj);
      });

      // result.show.unseen_count
      // result.show.total_episodes
      // result.show.first_episode
      // result.show.last_episode
      // result.show.next_episode
      // result.show.previous_episode

      this.dml.SetObj('user_shows', result.show).then(obj=>{
        console.log('subscribed_shows',obj);
      });

      this.dml.AddList('subscribed_episodes',result.episode_list).then(obj=>{
        console.log('subscribed_episodes',obj);
      });
    });
  }

  queryTvDb(series_id: number){
    this.tvDbSvc.ShowAndEpisodes(series_id).subscribe(result => {
      this.QueryResult = result;
    });
  }
}
