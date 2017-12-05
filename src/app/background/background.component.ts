import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'tvq-background',
  templateUrl: './background.component.html'
})
export class BackgroundComponent implements OnInit {
  title = 'tvq background works!';

  ngOnInit() {
    console.log(this.title);

    if (chrome.alarms) {
      chrome.alarms.clearAll();
      chrome.alarms.create('every min', {
        periodInMinutes: 1,
        when: Date.now()
      });

      chrome.alarms.onAlarm.addListener(alarm => {
        const name = alarm.name;
        const scheduledTime = new Date(alarm.scheduledTime).toLocaleString();
        const periodInMinutes = alarm.periodInMinutes;
        console.log(
          name,
          scheduledTime,
          periodInMinutes,
          alarm
        );

        this.updateShowsFromServer();
        this.updateShowsMetadata();
      });
    }

  }

  updateShowsFromServer() {
    console.log('Refreshing shows...');
  }

  updateShowsMetadata() {
    console.log('Updating shows metadata...');
  }
}
