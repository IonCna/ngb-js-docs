import type { IComponentController, IComponentOptions } from "angular";
import type { NgbTimeStruct } from "ngb-js/timepicker";

export class TimepickerCustomStepsComponent implements IComponentController {
    public time: NgbTimeStruct = { hour: 13, minute: 30, second: 0 };
    public hourStep = 1;
    public minuteStep = 15;
    public secondStep = 30;
    static get $name() { return "docsTimepickerCustomSteps" }
    static get $factory(): IComponentOptions {
        return { controller: TimepickerCustomStepsComponent, controllerAs: "example", templateUrl: "./timepicker-custom-steps.component.html", styleUrl: "./timepicker-custom-steps.component.css" }
    }
}
