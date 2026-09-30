import { Component } from "ngjs-core";
import { NgbCalendar, type NgbDatepicker, type NgbDateStruct } from "ngb-js/datepicker";

@Component({
    selector: "docs-basic-datepicker",
    controllerAs: "example",
    templateUrl: "./basic-datepicker.component.html",
    styleUrl: "./basic-datepicker.component.css",
})
export class BasicDatepickerComponent {
    public today: NgbDateStruct;

    public dp?: NgbDatepicker;
    public model?: NgbDateStruct;
    public date?: { year: number; month: number };

    constructor(calendar: NgbCalendar) {
        this.today = calendar.getToday();
    }
}
