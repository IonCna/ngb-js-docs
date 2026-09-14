import { Component } from "ngjs-core";
import { NgbCalendarGregorian, NgbDate } from "ngb-js/datepicker";

@Component({
    selector: "docs-range-popup-datepicker",
    controllerAs: "example",
    templateUrl: "./range-popup-datepicker.component.html",
    styleUrl: "./range-popup-datepicker.component.css",
})
export class RangePopupDatepickerComponent {
    private readonly calendar = new NgbCalendarGregorian();
    public hoveredDate: NgbDate | null = null;
    public fromDate = this.calendar.getToday();
    public toDate: NgbDate | null = this.calendar.getNext(this.fromDate, "d", 7);
    public model: NgbDate | null = this.fromDate;
    public select(date: NgbDate) {
        if (!this.fromDate || this.toDate) { this.fromDate = date; this.toDate = null; }
        else if (date.after(this.fromDate)) { this.toDate = date; }
        else { this.fromDate = date; }
        this.model = date;
    }
    public isHovered(date: NgbDate) { return !!this.fromDate && !this.toDate && !!this.hoveredDate && date.after(this.fromDate) && date.before(this.hoveredDate); }
    public isInside(date: NgbDate) { return !!this.toDate && date.after(this.fromDate) && date.before(this.toDate); }
    public isRange(date: NgbDate) { return date.equals(this.fromDate) || (!!this.toDate && date.equals(this.toDate)) || this.isInside(date) || this.isHovered(date); }
}
