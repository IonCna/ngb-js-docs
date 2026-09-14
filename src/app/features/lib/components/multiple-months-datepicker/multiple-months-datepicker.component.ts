import { Component } from "ngjs-core";
import type { NgbDateStruct } from "ngb-js/datepicker";

@Component({
    selector: "docs-multiple-months-datepicker",
    controllerAs: "example",
    templateUrl: "./multiple-months-datepicker.component.html",
    styleUrl: "./multiple-months-datepicker.component.css",
})
export class MultipleMonthsDatepickerComponent {
    public date: NgbDateStruct = { year: 2026, month: 8, day: 24 };
}
