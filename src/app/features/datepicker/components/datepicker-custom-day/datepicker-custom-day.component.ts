import { Component } from "ngjs-core";
import type { NgbDateStruct } from "ngb-js/datepicker";

@Component({
    selector: "docs-datepicker-custom-day",
    controllerAs: "example",
    templateUrl: "./datepicker-custom-day.component.html",
    styleUrl: "./datepicker-custom-day.component.css",
})
export class DatepickerCustomDayComponent {
    public date: NgbDateStruct = { year: 2026, month: 8, day: 24 };
    public dayData(date: NgbDateStruct) {
        const weekday = new Date(date.year, date.month - 1, date.day).getDay();
        return { weekend: weekday === 0 || weekday === 6 };
    }
}
