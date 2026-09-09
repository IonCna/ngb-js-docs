import type { IComponentController, IComponentOptions } from "angular";
import type { NgbDateStruct } from "ngb-js/datepicker";

export class DatepickerPositionTargetComponent implements IComponentController {
    public date: NgbDateStruct | null = null;
    public readonly target = "#datepicker-custom-position-target";
    static get $name() { return "docsDatepickerPositionTarget" }
    static get $factory(): IComponentOptions { return { controller: DatepickerPositionTargetComponent, controllerAs: "example", templateUrl: "./datepicker-position-target.component.html", styleUrl: "./datepicker-position-target.component.css" } }
}
