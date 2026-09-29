import { Component } from "ngjs-core";
import type { NgbTimeStruct } from "ngb-js/timepicker";

@Component({
    selector: "docs-meridian-timepicker",
    controllerAs: "example",
    templateUrl: "./meridian-timepicker.component.html",
    styleUrl: "./meridian-timepicker.component.css",
})
export class MeridianTimepickerComponent {
    public time: NgbTimeStruct = { hour: 13, minute: 30, second: 0 };
    public meridian = true;
}
