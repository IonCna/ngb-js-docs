import { Component } from "ngjs-core";
import type { NgbTimeStruct } from "ngb-js/timepicker";

@Component({
    selector: "docs-timepicker-custom-steps",
    controllerAs: "example",
    templateUrl: "./timepicker-custom-steps.component.html",
    styleUrl: "./timepicker-custom-steps.component.css",
})
export class TimepickerCustomStepsComponent {
    public time: NgbTimeStruct = { hour: 13, minute: 30, second: 0 };
    public hourStep = 1;
    public minuteStep = 15;
    public secondStep = 30;
}
