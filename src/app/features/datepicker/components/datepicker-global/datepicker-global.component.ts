import { Component, type AfterViewInit, type OnDestroy } from "ngjs-core";
import { NgbDatepickerConfig, NgbInputDatepickerConfig, type NgbDateStruct } from "ngb-js/datepicker";

type DatepickerDefaults = Pick<NgbDatepickerConfig, "displayMonths" | "navigation" | "outsideDays" | "showWeekNumbers" | "weekdays">;

@Component({
    selector: "docs-datepicker-global",
    controllerAs: "example",
    templateUrl: "./datepicker-global.component.html",
    styleUrl: "./datepicker-global.component.css",
})
export class DatepickerGlobalComponent implements AfterViewInit, OnDestroy {
    private readonly inlineDefaults: DatepickerDefaults;
    private readonly inputDefaults: DatepickerDefaults;
    public inlineDate: NgbDateStruct = { year: 2026, month: 8, day: 24 };
    public popupDate: NgbDateStruct = { year: 2026, month: 8, day: 24 };

    constructor(private readonly config: NgbDatepickerConfig, private readonly inputConfig: NgbInputDatepickerConfig) {
        this.inlineDefaults = this.capture(config);
        this.inputDefaults = this.capture(inputConfig);
        Object.assign(config, { displayMonths: 2, navigation: "arrows", outsideDays: "hidden", showWeekNumbers: true, weekdays: "short" });
        Object.assign(inputConfig, { displayMonths: 2, navigation: "arrows", outsideDays: "hidden", showWeekNumbers: true, weekdays: "short" });
    }
    public ngAfterViewInit() { this.restore(); }
    public ngOnDestroy() { this.restore(); }
    private capture(config: NgbDatepickerConfig): DatepickerDefaults { return { displayMonths: config.displayMonths, navigation: config.navigation, outsideDays: config.outsideDays, showWeekNumbers: config.showWeekNumbers, weekdays: config.weekdays }; }
    private restore() { Object.assign(this.config, this.inlineDefaults); Object.assign(this.inputConfig, this.inputDefaults); }
}
