import { Component } from "ngjs-core";
import type { NgbDateStruct, NgbDatepicker } from "ngb-js/datepicker";

@Component({
    selector: "docs-datepicker-keyboard",
    controllerAs: "example",
    templateUrl: "./datepicker-keyboard.component.html",
    styleUrl: "./datepicker-keyboard.component.css",
})
export class DatepickerKeyboardComponent {
    public date: NgbDateStruct = { year: 2026, month: 8, day: 24 };
    public datepicker?: NgbDatepicker;
    public onKeydown(event: KeyboardEvent | JQueryEventObject) {
        if (!this.datepicker || (event.key !== "[" && event.key !== "]")) return;
        const direction = event.key === "[" ? -1 : 1;
        const target = direction < 0
            ? this.datepicker.calendar.getPrev(this.datepicker.state.firstDate, "m", 1)
            : this.datepicker.calendar.getNext(this.datepicker.state.firstDate, "m", 1);
        this.datepicker.navigateTo(target);
        event.preventDefault();
        event.stopPropagation();
    }
}
