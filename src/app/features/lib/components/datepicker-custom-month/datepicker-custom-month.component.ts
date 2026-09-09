import type { IComponentController, IComponentOptions } from "angular";
import type { NgbDatepicker } from "ngb-js/datepicker";

export class DatepickerCustomMonthComponent implements IComponentController {
    public previous(datepicker: NgbDatepicker) { datepicker.navigateTo(datepicker.calendar.getPrev(datepicker.state.firstDate, "m", 1)); }
    public next(datepicker: NgbDatepicker) { datepicker.navigateTo(datepicker.calendar.getNext(datepicker.state.firstDate, "m", 1)); }
    public today(datepicker: NgbDatepicker) { datepicker.navigateTo(datepicker.calendar.getToday()); }
    static get $name() { return "docsDatepickerCustomMonth" }
    static get $factory(): IComponentOptions { return { controller: DatepickerCustomMonthComponent, controllerAs: "example", templateUrl: "./datepicker-custom-month.component.html", styleUrl: "./datepicker-custom-month.component.css" } }
}
