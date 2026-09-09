import type { IComponentController, IComponentOptions } from "angular";
import type { NgbTimeStruct } from "ngb-js/timepicker";

export class SpinnersTimepickerComponent implements IComponentController {
    public time: NgbTimeStruct = { hour: 13, minute: 30, second: 0 };
    public spinners = true;
    static get $name() { return "docsSpinnersTimepicker" }
    static get $factory(): IComponentOptions {
        return { controller: SpinnersTimepickerComponent, controllerAs: "example", templateUrl: "./spinners-timepicker.component.html", styleUrl: "./spinners-timepicker.component.css" }
    }
}
