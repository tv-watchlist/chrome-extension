import { Component, OnInit,Input,Output,EventEmitter} from '@angular/core';

declare var $: any;

let counter = 0;

@Component({
  selector: 'tvq-dialog-box',
  templateUrl: 'dialog-box.component.html',
  styleUrls: ['dialog-box.component.scss']
})
export class DialogBoxComponent implements OnInit {

  private modelId: string;
  private $selector: string;

  @Input() dialogSize: 'Small' | 'Default' | 'Large';
  @Output() dialogEvent = new EventEmitter<any>();

  constructor() {
    this.modelId = 'myModal' + (++counter);
    this.$selector = '#' + this.modelId;
    this.dialogSize = 'Default';
  }

  ngOnInit() {
    // This event fires immediately when the show instance method is called.
    // If caused by a click, the clicked element is available as the relatedTarget property of the event.
    $(this.$selector).on('show.bs.modal', (e) => {
      this.dialogEvent.emit({'on': 'show', 'event': e});
    });

    // This event is fired when the modal has been made visible to the user (will wait for CSS transitions to complete).
    // If caused by a click, the clicked element is available as the relatedTarget property of the event.
    $(this.$selector).on('shown.bs.modal', (e) => {
      this.dialogEvent.emit({'on': 'shown', 'event': e});
    });

    // This event is fired immediately when the hide instance method has been called.
    $(this.$selector).on('hide.bs.modal', (e) => {
      this.dialogEvent.emit({'on': 'hide', 'event': e});
    });

    // This event is fired when the modal has finished being hidden from the user (will wait for CSS transitions to complete).
    $(this.$selector).on('hidden.bs.modal', (e) => {
      this.dialogEvent.emit({'on': 'hidden', 'event': e});
    });
  }

  public open() {
    $(this.$selector).modal('show');
  }

  public close() {
    $(this.$selector).modal('hide');
  }

  public toggle() {
    $(this.$selector).modal('toggle');
  }
}
