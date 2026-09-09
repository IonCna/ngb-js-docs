import type { IComponentController, IComponentOptions } from "angular";
import type { NgbDateStruct } from "ngb-js/datepicker";

export class MultipleMonthsDatepickerComponent implements IComponentController {
    public date: NgbDateStruct = { year: 2026, month: 8, day: 24 };
    static get $name() { return "docsMultipleMonthsDatepicker" }
    static get $factory(): IComponentOptions {
        return { controller: MultipleMonthsDatepickerComponent, controllerAs: "example", templateUrl: "./multiple-months-datepicker.component.html", styleUrl: "./multiple-months-datepicker.component.css" }
    }
}
