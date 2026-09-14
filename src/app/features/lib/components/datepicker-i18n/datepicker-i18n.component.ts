import { Component } from "ngjs-core";
import { NgbDatepickerI18n, type NgbDateStruct } from "ngb-js/datepicker";

class SpanishDatepickerI18n extends NgbDatepickerI18n {
    private readonly months = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
    private readonly weekdays = ["L", "M", "X", "J", "V", "S", "D"];
    getWeekdayLabel(weekday: number) { return this.weekdays[weekday - 1] ?? ""; }
    getMonthShortName(month: number) { return this.months[month - 1]?.slice(0, 3) ?? ""; }
    getMonthFullName(month: number) { return this.months[month - 1] ?? ""; }
    getDayAriaLabel(date: NgbDateStruct) { return `${date.day} de ${this.getMonthFullName(date.month)} de ${date.year}`; }
}

@Component({
    selector: "docs-datepicker-i18n",
    controllerAs: "example",
    templateUrl: "./datepicker-i18n.component.html",
    styleUrl: "./datepicker-i18n.component.css",
})
export class DatepickerI18nComponent {
    public readonly i18n = new SpanishDatepickerI18n();
    public date: NgbDateStruct = { year: 2026, month: 8, day: 24 };
}
