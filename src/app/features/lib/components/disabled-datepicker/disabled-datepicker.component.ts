import type { IComponentController, IComponentOptions } from "angular";
import type { NgbDateStruct } from "ngb-js/datepicker";

export class DisabledDatepickerComponent implements IComponentController {
    public disabled = true;
    public date: NgbDateStruct = { year: 2026, month: 8, day: 24 };
    static get $name() { return "docsDisabledDatepicker" }
    static get $factory(): IComponentOptions { return { controller: DisabledDatepickerComponent, controllerAs: "example", templateUrl: "./disabled-datepicker.component.html", styleUrl: "./disabled-datepicker.component.css" } }
}
