export type Days = 'Monday'|'Tuesday'|'Wednesday'|'Thursday'|'Friday'|'Saturday'|'Sunday';
export class ScheduleModel {
    time: string;
    days: Days[];
    constructor() {
        this.time = '';
        this.days = [];
    }
    // test = {'time':'06:00','days':['Monday','Tuesday','Wednesday','Thursday','Friday']};
}
