import { Component } from "ngjs-core";
import type { NgbDateStruct, NgbDatepicker } from "ngb-js/datepicker";

@Component({
    selector: "docs-datepicker-footer",
    controllerAs: "example",
    templateUrl: "./datepicker-footer.component.html",
    styleUrl: "./datepicker-footer.component.css",
})
export class DatepickerFooterComponent {
    public date: NgbDateStruct | null = null;
    public datepicker?: NgbDatepicker;
    public today() { if (this.datepicker) this.date = this.datepicker.calendar.getToday(); }
    public clear() { this.date = null; }
}
