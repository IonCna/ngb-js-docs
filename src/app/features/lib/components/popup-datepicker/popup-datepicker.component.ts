import type { IComponentController, IComponentOptions } from "angular";
import type { NgbDateStruct } from "ngb-js/datepicker";

export class PopupDatepickerComponent implements IComponentController {
    public date: NgbDateStruct = { year: 2026, month: 8, day: 24 };
    static get $name() { return "docsPopupDatepicker" }
    static get $factory(): IComponentOptions {
        return { controller: PopupDatepickerComponent, controllerAs: "example", templateUrl: "./popup-datepicker.component.html", styleUrl: "./popup-datepicker.component.css" }
    }
}
