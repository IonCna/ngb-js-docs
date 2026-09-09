import type { IComponentController, IComponentOptions } from "angular";
import type { NgbDateStruct } from "ngb-js/datepicker";

export class BasicDatepickerComponent implements IComponentController {
    public date: NgbDateStruct = { year: 2026, month: 8, day: 24 };
    static get $name() { return "docsBasicDatepicker" }
    static get $factory(): IComponentOptions {
        return { controller: BasicDatepickerComponent, controllerAs: "example", templateUrl: "./basic-datepicker.component.html", styleUrl: "./basic-datepicker.component.css" }
    }
}
