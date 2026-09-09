import type { IComponentController, IComponentOptions } from "angular";
import { NgbCalendarGregorian, NgbDate } from "ngb-js/datepicker";

export class RangePopupDatepickerComponent implements IComponentController {
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
    static get $name() { return "docsRangePopupDatepicker" }
    static get $factory(): IComponentOptions { return { controller: RangePopupDatepickerComponent, controllerAs: "example", templateUrl: "./range-popup-datepicker.component.html", styleUrl: "./range-popup-datepicker.component.css" } }
}
