import type { IComponentController, IComponentOptions } from "angular";
import { NgbTimepickerI18n, type NgbTimeStruct } from "ngb-js/timepicker";

export class GreekTimepickerI18n extends NgbTimepickerI18n {
    public getMorningPeriod(): string { return "π.μ."; }
    public getAfternoonPeriod(): string { return "μ.μ."; }
}

// Register once in your application module:
// AppModule.service("NgbTimepickerI18n", GreekTimepickerI18n);

export class TimepickerI18nComponent implements IComponentController {
    public time: NgbTimeStruct = { hour: 13, minute: 30, second: 0 };
    constructor(public readonly i18n: NgbTimepickerI18n) {}
    static get $name() { return "docsTimepickerI18n" }
    static get $inject() { return ["NgbTimepickerI18n"] }
    static get $factory(): IComponentOptions {
        return { controller: TimepickerI18nComponent, controllerAs: "example", templateUrl: "./timepicker-i18n.component.html", styleUrl: "./timepicker-i18n.component.css" }
    }
}
