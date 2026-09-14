import { Component } from "ngjs-core";
import type { NgbDateStruct } from "ngb-js/datepicker";

@Component({
    selector: "docs-popup-datepicker",
    controllerAs: "example",
    templateUrl: "./popup-datepicker.component.html",
    styleUrl: "./popup-datepicker.component.css",
})
export class PopupDatepickerComponent {
    public date: NgbDateStruct = { year: 2026, month: 8, day: 24 };
}
