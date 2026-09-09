import type { IComponentController, IComponentOptions } from "angular";
import { NgbDatepickerConfig, NgbInputDatepickerConfig, type NgbDateStruct } from "ngb-js/datepicker";

type DatepickerDefaults = Pick<NgbDatepickerConfig, "displayMonths" | "navigation" | "outsideDays" | "showWeekNumbers" | "weekdays">;

export class DatepickerGlobalComponent implements IComponentController {
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
    public $postLink() { this.restore(); }
    public $onDestroy() { this.restore(); }
    private capture(config: NgbDatepickerConfig): DatepickerDefaults { return { displayMonths: config.displayMonths, navigation: config.navigation, outsideDays: config.outsideDays, showWeekNumbers: config.showWeekNumbers, weekdays: config.weekdays }; }
    private restore() { Object.assign(this.config, this.inlineDefaults); Object.assign(this.inputConfig, this.inputDefaults); }
    static get $name() { return "docsDatepickerGlobal" }
    static get $inject() { return ["NgbDatepickerConfig", "NgbInputDatepickerConfig"] }
    static get $factory(): IComponentOptions { return { controller: DatepickerGlobalComponent, controllerAs: "example", templateUrl: "./datepicker-global.component.html", styleUrl: "./datepicker-global.component.css" } }
}
