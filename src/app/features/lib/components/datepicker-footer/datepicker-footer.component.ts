import type { IComponentController, IComponentOptions } from "angular";
import type { NgbDateStruct, NgbDatepicker } from "ngb-js/datepicker";

export class DatepickerFooterComponent implements IComponentController {
    public date: NgbDateStruct | null = null;
    public datepicker?: NgbDatepicker;
    public today() { if (this.datepicker) this.date = this.datepicker.calendar.getToday(); }
    public clear() { this.date = null; }
    static get $name() { return "docsDatepickerFooter" }
    static get $factory(): IComponentOptions { return { controller: DatepickerFooterComponent, controllerAs: "example", templateUrl: "./datepicker-footer.component.html", styleUrl: "./datepicker-footer.component.css" } }
}
