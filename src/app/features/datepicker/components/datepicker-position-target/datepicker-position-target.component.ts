import { Component } from "ngjs-core";
import type { NgbDateStruct } from "ngb-js/datepicker";

@Component({
    selector: "docs-datepicker-position-target",
    controllerAs: "example",
    templateUrl: "./datepicker-position-target.component.html",
    styleUrl: "./datepicker-position-target.component.css",
})
export class DatepickerPositionTargetComponent {
    public date: NgbDateStruct | null = null;
    public readonly target = "#datepicker-custom-position-target";
}
