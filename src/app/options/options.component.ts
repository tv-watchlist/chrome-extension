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

  async ngOnInit() {
    this.logger.log(this.title);

    try {
      const fetchResult = await this.dml.FetchAll('settings');
      this.List = fetchResult[0];
      this.logger.log('FetchAll', this.List);

      const setResult = await this.dml.SetObj('settings', { 'Name': 'update_time', 'Value': (new Date()).getTime() });
      this.logger.log('SetObj', setResult);

    } catch (error) {
      this.logger.error(error);
    }
  }
}
