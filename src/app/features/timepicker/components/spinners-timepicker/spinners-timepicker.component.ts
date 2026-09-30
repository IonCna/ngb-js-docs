import { Component } from "ngjs-core";
import type { NgbTimeStruct } from "ngb-js/timepicker";

@Component({
    selector: "docs-spinners-timepicker",
    controllerAs: "example",
    templateUrl: "./spinners-timepicker.component.html",
    styleUrl: "./spinners-timepicker.component.css",
})
export class SpinnersTimepickerComponent {
    public time: NgbTimeStruct = { hour: 13, minute: 30, second: 0 };
    public spinners = true;
}
