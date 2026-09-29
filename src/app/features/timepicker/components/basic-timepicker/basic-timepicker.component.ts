import { Component } from "ngjs-core";
import type { NgbTimeStruct } from "ngb-js/timepicker";

@Component({
    selector: "docs-basic-timepicker",
    controllerAs: "example",
    templateUrl: "./basic-timepicker.component.html",
    styleUrl: "./basic-timepicker.component.css",
})
export class BasicTimepickerComponent {
    public time: NgbTimeStruct = { hour: 13, minute: 30, second: 0 };
}
