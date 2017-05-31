import { Component ,OnInit } from '@angular/core';

@Component({
  selector: 'tvq-options',
  templateUrl: './options.component.html',
  styleUrls: ['./options.component.scss']
})
export class OptionsComponent implements OnInit {
  title = 'tvq option works!';

  ngOnInit() {
    console.log(this.title);
  }
}
