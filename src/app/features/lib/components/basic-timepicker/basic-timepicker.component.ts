import type { IComponentController, IComponentOptions } from "angular";
import type { NgbTimeStruct } from "ngb-js/timepicker";

export class BasicTimepickerComponent implements IComponentController {
    public time: NgbTimeStruct = { hour: 13, minute: 30, second: 0 };
    static get $name() { return "docsBasicTimepicker" }
    static get $factory(): IComponentOptions {
        return { controller: BasicTimepickerComponent, controllerAs: "example", templateUrl: "./basic-timepicker.component.html", styleUrl: "./basic-timepicker.component.css" }
    }
}
