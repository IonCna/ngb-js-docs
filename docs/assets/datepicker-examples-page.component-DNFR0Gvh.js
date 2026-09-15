import{r as e,t}from"./decorate-U3LoYfOr.js";var n=`import { Component } from "ngjs-core";\r
import { NgbDateAdapter, NgbDateParserFormatter, type NgbDateStruct } from "ngb-js/datepicker";\r
\r
class StringDateAdapter extends NgbDateAdapter<string> {\r
    fromModel(value: string | null): NgbDateStruct | null {\r
        if (!value) return null;\r
        const [year, month, day] = value.split("/").map(Number);\r
        return year && month && day ? { year, month, day } : null;\r
    }\r
    toModel(date: NgbDateStruct | null): string | null { return date ? \`\${date.year}/\${date.month}/\${date.day}\` : null; }\r
}\r
\r
class DotDateParserFormatter extends NgbDateParserFormatter {\r
    parse(value: string): NgbDateStruct | null {\r
        const [day, month, year] = value.split(".").map(Number);\r
        return day && month && year ? { year, month, day } : null;\r
    }\r
    format(date: NgbDateStruct | null): string { return date ? \`\${String(date.day).padStart(2, "0")}.\${String(date.month).padStart(2, "0")}.\${date.year}\` : ""; }\r
}\r
\r
@Component({\r
    selector: "docs-datepicker-custom-adapter",\r
    controllerAs: "example",\r
    templateUrl: "./datepicker-custom-adapter.component.html",\r
    styleUrl: "./datepicker-custom-adapter.component.css",\r
})\r
export class DatepickerCustomAdapterComponent {\r
    public readonly adapter = new StringDateAdapter();\r
    public readonly formatter = new DotDateParserFormatter();\r
    public date = "2026/8/24";\r
}\r
`,r=`<label class="form-label" for="custom-adapter-input">Date using <code>dd.mm.yyyy</code></label>\r
<div class="input-group" style="max-width: 22rem">\r
    <input id="custom-adapter-input" class="form-control" ng-model="example.date" ngb-datepicker date-adapter="example.adapter" parser-formatter="example.formatter">\r
    <button type="button" class="btn btn-outline-secondary" ng-click="$datepicker.toggle()" aria-label="Toggle calendar"><i class="bi bi-calendar3" aria-hidden="true"></i></button>\r
</div>\r
<p class="small text-body-secondary mt-3 mb-0">Application model: <code>{{ example.date }}</code></p>\r
`,i=`import { Component } from "ngjs-core";\r
import type { NgbDateStruct } from "ngb-js/datepicker";\r
\r
@Component({\r
    selector: "docs-basic-datepicker",\r
    controllerAs: "example",\r
    templateUrl: "./basic-datepicker.component.html",\r
    styleUrl: "./basic-datepicker.component.css",\r
})\r
export class BasicDatepickerComponent {\r
    public date: NgbDateStruct = { year: 2026, month: 8, day: 24 };\r
}\r
`,a=`<ngb-datepicker ng-model="example.date"></ngb-datepicker>\r
<p class="small text-body-secondary mt-3 mb-0">Selected date: <code>{{ example.date | json }}</code></p>\r
`,o=`.day { position: relative; display: inline-flex; width: 2rem; height: 2rem; align-items: center; justify-content: center; border-radius: .35rem; transition: background-color .15s ease, box-shadow .15s ease, color .15s ease; }
.day.weekend { color: var(--bs-danger); background: color-mix(in srgb, var(--bs-danger-bg-subtle) 42%, transparent); }
.day.today { font-weight: 750; box-shadow: inset 0 0 0 1px var(--bs-primary); }
.day.selected { color: var(--bs-white); background: var(--bs-primary); box-shadow: 0 .35rem .9rem rgba(var(--bs-primary-rgb), .22); }
.day.focused { outline: 2px solid rgba(var(--bs-primary-rgb), .4); outline-offset: 1px; }
.day .bi-dot { position: absolute; bottom: -.4rem; font-size: 1.25rem; }
`,s=`import { Component } from "ngjs-core";\r
import type { NgbDateStruct } from "ngb-js/datepicker";\r
\r
@Component({\r
    selector: "docs-datepicker-custom-day",\r
    controllerAs: "example",\r
    templateUrl: "./datepicker-custom-day.component.html",\r
    styleUrl: "./datepicker-custom-day.component.css",\r
})\r
export class DatepickerCustomDayComponent {\r
    public date: NgbDateStruct = { year: 2026, month: 8, day: 24 };\r
    public dayData(date: NgbDateStruct) {\r
        const weekday = new Date(date.year, date.month - 1, date.day).getDay();\r
        return { weekend: weekday === 0 || weekday === 6 };\r
    }\r
}\r
`,c=`<ng-template ng-ref="example.customDay" let-date let-data="data" let-selected="selected" let-today="today" let-focused="focused">\r
    <span class="day" ng-class="{ selected: selected, today: today, weekend: data.weekend, focused: focused }">
        {{ date.day }}\r
        <i ng-if="today" class="bi bi-dot" aria-hidden="true"></i>\r
    </span>\r
</ng-template>\r
<ngb-datepicker ng-model="example.date" day-template="example.customDay" day-template-data="example.dayData"></ngb-datepicker>\r
`,l=`.layout { display: grid; grid-template-columns: repeat(2, max-content); gap: 1rem; width: max-content; border: 1px solid var(--bs-border-color); border-radius: var(--bs-border-radius-lg); background: var(--bs-body-bg); box-shadow: 0 .75rem 2rem rgba(var(--bs-body-color-rgb), .06); }
@media (max-width: 575.98px) { .layout { grid-template-columns: max-content; } }
`,u=`import { Component } from "ngjs-core";\r
import type { NgbDatepicker } from "ngb-js/datepicker";\r
\r
@Component({\r
    selector: "docs-datepicker-custom-month",\r
    controllerAs: "example",\r
    templateUrl: "./datepicker-custom-month.component.html",\r
    styleUrl: "./datepicker-custom-month.component.css",\r
})\r
export class DatepickerCustomMonthComponent {\r
    public previous(datepicker: NgbDatepicker) { datepicker.navigateTo(datepicker.calendar.getPrev(datepicker.state.firstDate, "m", 1)); }\r
    public next(datepicker: NgbDatepicker) { datepicker.navigateTo(datepicker.calendar.getNext(datepicker.state.firstDate, "m", 1)); }\r
    public today(datepicker: NgbDatepicker) { datepicker.navigateTo(datepicker.calendar.getToday()); }\r
}\r
`,d=`<ng-template ng-ref="example.content" let-datepicker>\r
    <div class="d-flex align-items-center justify-content-between gap-2 p-2 border-bottom bg-body-tertiary">\r
        <button type="button" class="btn btn-sm btn-outline-secondary" ng-click="example.previous(datepicker)" aria-label="Previous month"><i class="bi bi-chevron-left"></i></button>\r
        <button type="button" class="btn btn-sm btn-link text-decoration-none" ng-click="example.today(datepicker)">Today</button>\r
        <button type="button" class="btn btn-sm btn-outline-secondary" ng-click="example.next(datepicker)" aria-label="Next month"><i class="bi bi-chevron-right"></i></button>\r
    </div>\r
    <div class="layout p-2">
        <div ng-repeat="month in datepicker.model.months track by $index">\r
            <p class="small fw-semibold text-center mb-1">{{ datepicker.i18n.getMonthLabel(month.firstDate) }}</p>\r
            <ngb-datepicker-month month="month.firstDate" datepicker="datepicker"></ngb-datepicker-month>\r
        </div>\r
    </div>\r
</ng-template>\r
<div class="overflow-auto pb-2">\r
    <ngb-datepicker display-months="2" navigation="none" outside-days="hidden" content-template="example.content"></ngb-datepicker>\r
</div>\r
`,f=`import { Component } from "ngjs-core";\r
import type { NgbDateStruct } from "ngb-js/datepicker";\r
\r
@Component({\r
    selector: "docs-disabled-datepicker",\r
    controllerAs: "example",\r
    templateUrl: "./disabled-datepicker.component.html",\r
    styleUrl: "./disabled-datepicker.component.css",\r
})\r
export class DisabledDatepickerComponent {\r
    public disabled = true;\r
    public date: NgbDateStruct = { year: 2026, month: 8, day: 24 };\r
}\r
`,p=`<div class="form-check form-switch mb-3">\r
    <input id="disabled-datepicker-switch" class="form-check-input" type="checkbox" ng-model="example.disabled">\r
    <label class="form-check-label" for="disabled-datepicker-switch">Disable datepicker</label>\r
</div>\r
<ngb-datepicker ng-model="example.date" ng-disabled="example.disabled"></ngb-datepicker>\r
`,m=`import { Component } from "ngjs-core";\r
import type { NgbDateStruct, NgbDatepicker } from "ngb-js/datepicker";\r
\r
@Component({\r
    selector: "docs-datepicker-footer",\r
    controllerAs: "example",\r
    templateUrl: "./datepicker-footer.component.html",\r
    styleUrl: "./datepicker-footer.component.css",\r
})\r
export class DatepickerFooterComponent {\r
    public date: NgbDateStruct | null = null;\r
    public datepicker?: NgbDatepicker;\r
    public today() { if (this.datepicker) this.date = this.datepicker.calendar.getToday(); }\r
    public clear() { this.date = null; }\r
}\r
`,h=`<ng-template ng-ref="example.footer">\r
    <div class="d-flex gap-2 p-2 border-top bg-body-tertiary">\r
        <button type="button" class="btn btn-primary btn-sm" ng-click="example.today()">Today</button>\r
        <button type="button" class="btn btn-outline-secondary btn-sm ms-auto" ng-click="example.clear()">Clear</button>\r
    </div>\r
</ng-template>\r
<ngb-datepicker ng-model="example.date" footer-template="example.footer" ng-ref="example.datepicker" ng-ref-read="ngbDatepicker"></ngb-datepicker>\r
<p class="small text-body-secondary mt-3 mb-0">Selected date: <code>{{ example.date | json }}</code></p>\r
`,g=`import { Component, type AfterViewInit, type OnDestroy } from "ngjs-core";\r
import { NgbDatepickerConfig, NgbInputDatepickerConfig, type NgbDateStruct } from "ngb-js/datepicker";\r
\r
type DatepickerDefaults = Pick<NgbDatepickerConfig, "displayMonths" | "navigation" | "outsideDays" | "showWeekNumbers" | "weekdays">;\r
\r
@Component({\r
    selector: "docs-datepicker-global",\r
    controllerAs: "example",\r
    templateUrl: "./datepicker-global.component.html",\r
    styleUrl: "./datepicker-global.component.css",\r
})\r
export class DatepickerGlobalComponent implements AfterViewInit, OnDestroy {\r
    private readonly inlineDefaults: DatepickerDefaults;\r
    private readonly inputDefaults: DatepickerDefaults;\r
    public inlineDate: NgbDateStruct = { year: 2026, month: 8, day: 24 };\r
    public popupDate: NgbDateStruct = { year: 2026, month: 8, day: 24 };\r
\r
    constructor(private readonly config: NgbDatepickerConfig, private readonly inputConfig: NgbInputDatepickerConfig) {\r
        this.inlineDefaults = this.capture(config);\r
        this.inputDefaults = this.capture(inputConfig);\r
        Object.assign(config, { displayMonths: 2, navigation: "arrows", outsideDays: "hidden", showWeekNumbers: true, weekdays: "short" });\r
        Object.assign(inputConfig, { displayMonths: 2, navigation: "arrows", outsideDays: "hidden", showWeekNumbers: true, weekdays: "short" });\r
    }\r
    public ngAfterViewInit() { this.restore(); }\r
    public ngOnDestroy() { this.restore(); }\r
    private capture(config: NgbDatepickerConfig): DatepickerDefaults { return { displayMonths: config.displayMonths, navigation: config.navigation, outsideDays: config.outsideDays, showWeekNumbers: config.showWeekNumbers, weekdays: config.weekdays }; }\r
    private restore() { Object.assign(this.config, this.inlineDefaults); Object.assign(this.inputConfig, this.inputDefaults); }\r
}\r
`,_=`<div class="alert alert-light border d-flex gap-3 align-items-start" role="note">\r
    <i class="bi bi-gear text-primary mt-1" aria-hidden="true"></i>\r
    <div><p class="fw-semibold mb-1">Global defaults used by this example</p><p class="small text-body-secondary mb-0">Two months, arrow navigation, hidden outside days, week numbers and short weekday labels.</p></div>\r
</div>\r
<div class="overflow-auto pb-3"><ngb-datepicker ng-model="example.inlineDate"></ngb-datepicker></div>\r
<div class="input-group" style="max-width: 22rem">\r
    <input class="form-control" ng-model="example.popupDate" ngb-datepicker aria-label="Globally configured popup datepicker">\r
    <button type="button" class="btn btn-outline-secondary" ng-click="$datepicker.toggle()" aria-label="Toggle calendar"><i class="bi bi-calendar3"></i></button>\r
</div>\r
`,v=`import { Component } from "ngjs-core";\r
import { NgbDatepickerI18n, type NgbDateStruct } from "ngb-js/datepicker";\r
\r
class SpanishDatepickerI18n extends NgbDatepickerI18n {\r
    private readonly months = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];\r
    private readonly weekdays = ["L", "M", "X", "J", "V", "S", "D"];\r
    getWeekdayLabel(weekday: number) { return this.weekdays[weekday - 1] ?? ""; }\r
    getMonthShortName(month: number) { return this.months[month - 1]?.slice(0, 3) ?? ""; }\r
    getMonthFullName(month: number) { return this.months[month - 1] ?? ""; }\r
    getDayAriaLabel(date: NgbDateStruct) { return \`\${date.day} de \${this.getMonthFullName(date.month)} de \${date.year}\`; }\r
}\r
\r
@Component({\r
    selector: "docs-datepicker-i18n",\r
    controllerAs: "example",\r
    templateUrl: "./datepicker-i18n.component.html",\r
    styleUrl: "./datepicker-i18n.component.css",\r
})\r
export class DatepickerI18nComponent {\r
    public readonly i18n = new SpanishDatepickerI18n();\r
    public date: NgbDateStruct = { year: 2026, month: 8, day: 24 };\r
}\r
`,y=`<ngb-datepicker ng-model="example.date" i18n="example.i18n" weekdays="'short'"></ngb-datepicker>\r
`,b=`import { Component } from "ngjs-core";\r
import type { NgbDateStruct, NgbDatepicker } from "ngb-js/datepicker";\r
\r
@Component({\r
    selector: "docs-datepicker-keyboard",\r
    controllerAs: "example",\r
    templateUrl: "./datepicker-keyboard.component.html",\r
    styleUrl: "./datepicker-keyboard.component.css",\r
})\r
export class DatepickerKeyboardComponent {\r
    public date: NgbDateStruct = { year: 2026, month: 8, day: 24 };\r
    public datepicker?: NgbDatepicker;\r
    public onKeydown(event: KeyboardEvent | JQueryEventObject) {\r
        if (!this.datepicker || (event.key !== "[" && event.key !== "]")) return;\r
        const direction = event.key === "[" ? -1 : 1;\r
        const target = direction < 0\r
            ? this.datepicker.calendar.getPrev(this.datepicker.state.firstDate, "m", 1)\r
            : this.datepicker.calendar.getNext(this.datepicker.state.firstDate, "m", 1);\r
        this.datepicker.navigateTo(target);\r
        event.preventDefault();\r
        event.stopPropagation();\r
    }\r
}\r
`,x=`<p class="small text-body-secondary">Focus the calendar and press <kbd>[</kbd> or <kbd>]</kbd> to navigate by month. The built-in arrow, Home, End and Page keys continue to work.</p>\r
<div ng-keydown="example.onKeydown($event)">\r
    <ngb-datepicker ng-model="example.date" ng-ref="example.datepicker" ng-ref-read="ngbDatepicker"></ngb-datepicker>\r
</div>\r
`,S=`import { Component } from "ngjs-core";\r
import type { NgbDateStruct } from "ngb-js/datepicker";\r
\r
@Component({\r
    selector: "docs-multiple-months-datepicker",\r
    controllerAs: "example",\r
    templateUrl: "./multiple-months-datepicker.component.html",\r
    styleUrl: "./multiple-months-datepicker.component.css",\r
})\r
export class MultipleMonthsDatepickerComponent {\r
    public date: NgbDateStruct = { year: 2026, month: 8, day: 24 };\r
}\r
`,C=`<div class="overflow-auto pb-2">\r
    <ngb-datepicker ng-model="example.date" display-months="2" outside-days="hidden"></ngb-datepicker>\r
</div>\r
`,w=`import { Component } from "ngjs-core";\r
import type { NgbDateStruct } from "ngb-js/datepicker";\r
\r
@Component({\r
    selector: "docs-popup-datepicker",\r
    controllerAs: "example",\r
    templateUrl: "./popup-datepicker.component.html",\r
    styleUrl: "./popup-datepicker.component.css",\r
})\r
export class PopupDatepickerComponent {\r
    public date: NgbDateStruct = { year: 2026, month: 8, day: 24 };\r
}\r
`,T=`<label class="form-label" for="popup-datepicker-input">Choose a date</label>\r
<div class="input-group" style="max-width: 22rem">\r
    <input id="popup-datepicker-input" class="form-control" ng-model="example.date" ngb-datepicker ng-focus="$datepicker.open()">\r
    <button type="button" class="btn btn-outline-secondary" ng-click="$datepicker.toggle()" aria-label="Toggle calendar">\r
        <i class="bi bi-calendar3" aria-hidden="true"></i>\r
    </button>\r
</div>\r
<p class="small text-body-secondary mt-3 mb-0">Selected date: <code>{{ example.date | json }}</code></p>\r
`,E=`import { Component } from "ngjs-core";\r
import type { NgbDateStruct } from "ngb-js/datepicker";\r
\r
@Component({\r
    selector: "docs-datepicker-position-target",\r
    controllerAs: "example",\r
    templateUrl: "./datepicker-position-target.component.html",\r
    styleUrl: "./datepicker-position-target.component.css",\r
})\r
export class DatepickerPositionTargetComponent {\r
    public date: NgbDateStruct | null = null;\r
    public readonly target = "#datepicker-custom-position-target";\r
}\r
`,D=`<div class="row g-3 align-items-end">\r
    <div class="col-sm-7">\r
        <label class="form-label" for="positioned-datepicker-input">The input controls the popup</label>\r
        <div class="input-group">\r
            <input id="positioned-datepicker-input" class="form-control" ng-model="example.date" ngb-datepicker position-target="example.target">\r
            <button type="button" class="btn btn-outline-secondary" ng-click="$datepicker.toggle()">Open</button>\r
        </div>\r
    </div>\r
    <div class="col-sm-5 text-sm-end">\r
        <span id="datepicker-custom-position-target" class="d-inline-flex align-items-center gap-2 px-3 py-2 rounded border bg-body-tertiary">\r
            <i class="bi bi-crosshair" aria-hidden="true"></i> Popup target\r
        </span>\r
    </div>\r
</div>\r
`,O=`.day { display: inline-flex; width: 2rem; height: 2rem; align-items: center; justify-content: center; border-radius: .35rem; transition: background-color .15s ease, box-shadow .15s ease; }
.day.range { background: var(--bs-primary); color: var(--bs-white); box-shadow: inset 0 0 0 1px rgba(255, 255, 255, .22); }
.day.faded { background: color-mix(in srgb, var(--bs-primary-bg-subtle) 78%, transparent); color: var(--bs-primary-text-emphasis); }
.day.focused { outline: 2px solid rgba(var(--bs-primary-rgb), .45); outline-offset: 1px; }
`,k=`import { Component } from "ngjs-core";\r
import { NgbCalendarGregorian, NgbDate } from "ngb-js/datepicker";\r
\r
@Component({\r
    selector: "docs-range-datepicker",\r
    controllerAs: "example",\r
    templateUrl: "./range-datepicker.component.html",\r
    styleUrl: "./range-datepicker.component.css",\r
})\r
export class RangeDatepickerComponent {\r
    private readonly calendar = new NgbCalendarGregorian();\r
    public hoveredDate: NgbDate | null = null;\r
    public fromDate = this.calendar.getToday();\r
    public toDate: NgbDate | null = this.calendar.getNext(this.fromDate, "d", 10);\r
\r
    public select(date: NgbDate) {\r
        if (!this.fromDate || this.toDate) {\r
            this.fromDate = date;\r
            this.toDate = null;\r
        } else if (date.after(this.fromDate)) {\r
            this.toDate = date;\r
        } else {\r
            this.fromDate = date;\r
        }\r
    }\r
    public isHovered(date: NgbDate) { return !!this.fromDate && !this.toDate && !!this.hoveredDate && date.after(this.fromDate) && date.before(this.hoveredDate); }\r
    public isInside(date: NgbDate) { return !!this.toDate && date.after(this.fromDate) && date.before(this.toDate); }\r
    public isRange(date: NgbDate) { return date.equals(this.fromDate) || (!!this.toDate && date.equals(this.toDate)) || this.isInside(date) || this.isHovered(date); }\r
}\r
`,A=`<ng-template ng-ref="example.day" let-date let-focused="focused">\r
    <span class="day" ng-class="{ focused: focused, range: example.isRange(date), faded: example.isHovered(date) || example.isInside(date) }" ng-mouseenter="example.hoveredDate = date" ng-mouseleave="example.hoveredDate = null">{{ date.day }}</span>
</ng-template>\r
<div class="overflow-auto pb-2">\r
    <ngb-datepicker display-months="2" outside-days="hidden" day-template="example.day" date-select="example.select($event)"></ngb-datepicker>\r
</div>\r
<p class="small text-body-secondary mt-3 mb-0">From <code>{{ example.fromDate | json }}</code> to <code>{{ example.toDate | json }}</code></p>\r
`,j=`.day { display: inline-flex; width: 2rem; height: 2rem; align-items: center; justify-content: center; border-radius: .35rem; transition: background-color .15s ease, box-shadow .15s ease; }
.day.range { background: var(--bs-primary); color: var(--bs-white); box-shadow: inset 0 0 0 1px rgba(255, 255, 255, .22); }
.day.faded { background: color-mix(in srgb, var(--bs-primary-bg-subtle) 78%, transparent); color: var(--bs-primary-text-emphasis); }
.day.focused { outline: 2px solid rgba(var(--bs-primary-rgb), .45); outline-offset: 1px; }
`,M=`import { Component } from "ngjs-core";\r
import { NgbCalendarGregorian, NgbDate } from "ngb-js/datepicker";\r
\r
@Component({\r
    selector: "docs-range-popup-datepicker",\r
    controllerAs: "example",\r
    templateUrl: "./range-popup-datepicker.component.html",\r
    styleUrl: "./range-popup-datepicker.component.css",\r
})\r
export class RangePopupDatepickerComponent {\r
    private readonly calendar = new NgbCalendarGregorian();\r
    public hoveredDate: NgbDate | null = null;\r
    public fromDate = this.calendar.getToday();\r
    public toDate: NgbDate | null = this.calendar.getNext(this.fromDate, "d", 7);\r
    public model: NgbDate | null = this.fromDate;\r
    public select(date: NgbDate) {\r
        if (!this.fromDate || this.toDate) { this.fromDate = date; this.toDate = null; }\r
        else if (date.after(this.fromDate)) { this.toDate = date; }\r
        else { this.fromDate = date; }\r
        this.model = date;\r
    }\r
    public isHovered(date: NgbDate) { return !!this.fromDate && !this.toDate && !!this.hoveredDate && date.after(this.fromDate) && date.before(this.hoveredDate); }\r
    public isInside(date: NgbDate) { return !!this.toDate && date.after(this.fromDate) && date.before(this.toDate); }\r
    public isRange(date: NgbDate) { return date.equals(this.fromDate) || (!!this.toDate && date.equals(this.toDate)) || this.isInside(date) || this.isHovered(date); }\r
}\r
`,N=`<ng-template ng-ref="example.day" let-date let-focused="focused">\r
    <span class="day" ng-class="{ focused: focused, range: example.isRange(date), faded: example.isHovered(date) || example.isInside(date) }" ng-mouseenter="example.hoveredDate = date" ng-mouseleave="example.hoveredDate = null">{{ date.day }}</span>
</ng-template>\r
<div class="input-group" style="max-width: 24rem">\r
    <input class="form-control" ng-model="example.model" ngb-datepicker display-months="2" outside-days="hidden" auto-close="'outside'" day-template="example.day" date-select="example.select($event)" aria-label="Date range">\r
    <button type="button" class="btn btn-outline-secondary" ng-click="$datepicker.toggle()" aria-label="Toggle calendar"><i class="bi bi-calendar-range" aria-hidden="true"></i></button>\r
</div>\r
<p class="small text-body-secondary mt-3 mb-0">From <code>{{ example.fromDate | json }}</code> to <code>{{ example.toDate | json }}</code></p>\r
`,P=class{examples={basic:{html:a,typescript:i},popup:{html:T,typescript:w},multiple:{html:C,typescript:S},range:{html:A,typescript:k,css:O},rangePopup:{html:N,typescript:M,css:j},disabled:{html:p,typescript:f},adapter:{html:r,typescript:n},i18n:{html:y,typescript:v},customDay:{html:c,typescript:s,css:o},customMonth:{html:d,typescript:u,css:l},footer:{html:h,typescript:m},position:{html:D,typescript:E},keyboard:{html:x,typescript:b},global:{html:_,typescript:g}}};P=t([e({selector:`docs-datepicker-examples-page`,controllerAs:`$`,templateUrl:`/ngb-js-docs/templates/datepicker-examples-page.component-70bc3969.html`,styleUrl:`./datepicker-examples-page.component.css`})],P);export{P as DatepickerExamplesPageComponent};