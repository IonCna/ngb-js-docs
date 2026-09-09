import type { IComponentController, IComponentOptions } from "angular";
import type { NgbTimeStruct } from "ngb-js/timepicker";

export class SecondsTimepickerComponent implements IComponentController {
    public time: NgbTimeStruct = { hour: 13, minute: 30, second: 25 };
    public seconds = true;
    static get $name() { return "docsSecondsTimepicker" }
    static get $factory(): IComponentOptions {
        return { controller: SecondsTimepickerComponent, controllerAs: "example", templateUrl: "./seconds-timepicker.component.html", styleUrl: "./seconds-timepicker.component.css" }
    }
}
