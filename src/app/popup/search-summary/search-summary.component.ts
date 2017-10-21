import { Component, OnChanges, Input, ViewEncapsulation, SimpleChanges } from '@angular/core';
import { SearchModel } from '../../models/search.model';

@Component({
  selector: 'tvq-search-summary',
  templateUrl: './search-summary.component.html',
  styleUrls: ['./search-summary.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class SearchSummaryComponent implements OnChanges {

  @Input() searchModel: SearchModel;

  constructor() {  }

  ngOnChanges(changes: SimpleChanges) {

  }
}
