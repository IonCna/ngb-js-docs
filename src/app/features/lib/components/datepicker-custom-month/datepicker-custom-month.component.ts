import { Component } from "ngjs-core";
import type { NgbDatepicker } from "ngb-js/datepicker";

@Component({
    selector: "docs-datepicker-custom-month",
    controllerAs: "example",
    templateUrl: "./datepicker-custom-month.component.html",
    styleUrl: "./datepicker-custom-month.component.css",
})
export class DatepickerCustomMonthComponent {
    public previous(datepicker: NgbDatepicker) { datepicker.navigateTo(datepicker.calendar.getPrev(datepicker.state.firstDate, "m", 1)); }
    public next(datepicker: NgbDatepicker) { datepicker.navigateTo(datepicker.calendar.getNext(datepicker.state.firstDate, "m", 1)); }
    public today(datepicker: NgbDatepicker) { datepicker.navigateTo(datepicker.calendar.getToday()); }
}
