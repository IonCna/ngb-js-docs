import { Component } from "ngjs-core";
import type { NgbDateStruct } from "ngb-js/datepicker";

@Component({
    selector: "docs-basic-datepicker",
    controllerAs: "example",
    templateUrl: "./basic-datepicker.component.html",
    styleUrl: "./basic-datepicker.component.css",
})
export class BasicDatepickerComponent {
    public date: NgbDateStruct = { year: 2026, month: 8, day: 24 };
}
