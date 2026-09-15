import { Component } from "ngjs-core";
import type { NgbDateStruct } from "ngb-js/datepicker";

@Component({
    selector: "docs-disabled-datepicker",
    controllerAs: "example",
    templateUrl: "./disabled-datepicker.component.html",
    styleUrl: "./disabled-datepicker.component.css",
})
export class DisabledDatepickerComponent {
    public disabled = true;
    public date: NgbDateStruct = { year: 2026, month: 8, day: 24 };
}
