import { Component, OnInit } from '@angular/core';
import { LoggerService } from '../logger.service';
import { IDXDataDefinitionService, IDXDataManipulationService } from '../indexed-db.service';
@Component({
  selector: 'tvq-options',
  templateUrl: './options.component.html',
  styleUrls: ['./options.component.scss']
})
export class OptionsComponent implements OnInit {
  title = 'tvq option works!';
  public List: {[Name: string]: { Name: string, Value: any}};
  constructor(private logger: LoggerService, private dml: IDXDataManipulationService) {

  }

  ngOnInit() {
    this.logger.log(this.title);
    this.dml.FetchAll('settings').then(([list, storeName]) => {
      this.List = list;
      this.logger.log(this.List);
    });
  }
}
