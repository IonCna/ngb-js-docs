import { Component } from "ngjs-core";
import type { NgbTimeStruct } from "ngb-js/timepicker";

@Component({
    selector: "docs-seconds-timepicker",
    controllerAs: "example",
    templateUrl: "./seconds-timepicker.component.html",
    styleUrl: "./seconds-timepicker.component.css",
})
export class SecondsTimepickerComponent {
    public time: NgbTimeStruct = { hour: 13, minute: 30, second: 25 };
    public seconds = true;
}
