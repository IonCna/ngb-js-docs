import { Component, Injectable } from "ngjs-core";
import { NgbTimepickerI18n, type NgbTimeStruct } from "ngb-js/timepicker";

@Injectable({ id: "NgbTimepickerI18n" })
export class GreekTimepickerI18n extends NgbTimepickerI18n {
    public getMorningPeriod(): string { return "π.μ."; }
    public getAfternoonPeriod(): string { return "μ.μ."; }
}

@Component({
    selector: "docs-timepicker-i18n",
    controllerAs: "example",
    templateUrl: "./timepicker-i18n.component.html",
    styleUrl: "./timepicker-i18n.component.css",
})
export class TimepickerI18nComponent {
    public time: NgbTimeStruct = { hour: 13, minute: 30, second: 0 };
    constructor(public readonly i18n: NgbTimepickerI18n) {}
}
