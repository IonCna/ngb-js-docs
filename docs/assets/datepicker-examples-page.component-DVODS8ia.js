import{d as e,f as t}from"./index-B9XAkpig.js";var n=`import { Component } from "ngjs-core";
import { NgbDateAdapter, NgbDateParserFormatter, type NgbDateStruct } from "ngb-js/datepicker";

class StringDateAdapter extends NgbDateAdapter<string> {
    fromModel(value: string | null): NgbDateStruct | null {
        if (!value) return null;
        const [year, month, day] = value.split("/").map(Number);
        return year && month && day ? { year, month, day } : null;
    }
    toModel(date: NgbDateStruct | null): string | null { return date ? \`\${date.year}/\${date.month}/\${date.day}\` : null; }
}

class DotDateParserFormatter extends NgbDateParserFormatter {
    parse(value: string): NgbDateStruct | null {
        const [day, month, year] = value.split(".").map(Number);
        return day && month && year ? { year, month, day } : null;
    }
    format(date: NgbDateStruct | null): string { return date ? \`\${String(date.day).padStart(2, "0")}.\${String(date.month).padStart(2, "0")}.\${date.year}\` : ""; }
}

@Component({
    selector: "docs-datepicker-custom-adapter",
    controllerAs: "example",
    templateUrl: "./datepicker-custom-adapter.component.html",
    styleUrl: "./datepicker-custom-adapter.component.css",
})
export class DatepickerCustomAdapterComponent {
    public readonly adapter = new StringDateAdapter();
    public readonly formatter = new DotDateParserFormatter();
    public date = "2026/8/24";
}
`,r=`<label class="form-label" for="custom-adapter-input">Date using <code>dd.mm.yyyy</code></label>
<div class="input-group" style="max-width: 22rem">
    <input id="custom-adapter-input" class="form-control" ng-model="example.date" ngb-datepicker date-adapter="example.adapter" parser-formatter="example.formatter">
    <button type="button" class="btn btn-outline-secondary" ng-click="$datepicker.toggle()" aria-label="Toggle calendar"><i class="bi bi-calendar3" aria-hidden="true"></i></button>
</div>
<p class="small text-body-secondary mt-3 mb-0">Application model: <code>{{ example.date }}</code></p>
`,i=`import { Component } from "ngjs-core";
import type { NgbDateStruct } from "ngb-js/datepicker";

@Component({
    selector: "docs-basic-datepicker",
    controllerAs: "example",
    templateUrl: "./basic-datepicker.component.html",
    styleUrl: "./basic-datepicker.component.css",
})
export class BasicDatepickerComponent {
    public date: NgbDateStruct = { year: 2026, month: 8, day: 24 };
}
`,a=`<ngb-datepicker ng-model="example.date"></ngb-datepicker>
<p class="small text-body-secondary mt-3 mb-0">Selected date: <code>{{ example.date | json }}</code></p>
`,o=`.day { position: relative; display: inline-flex; width: 2rem; height: 2rem; align-items: center; justify-content: center; border-radius: .35rem; transition: background-color .15s ease, box-shadow .15s ease, color .15s ease; }\r
.day.weekend { color: var(--bs-danger); background: color-mix(in srgb, var(--bs-danger-bg-subtle) 42%, transparent); }\r
.day.today { font-weight: 750; box-shadow: inset 0 0 0 1px var(--bs-primary); }\r
.day.selected { color: var(--bs-white); background: var(--bs-primary); box-shadow: 0 .35rem .9rem rgba(var(--bs-primary-rgb), .22); }\r
.day.focused { outline: 2px solid rgba(var(--bs-primary-rgb), .4); outline-offset: 1px; }\r
.day .bi-dot { position: absolute; bottom: -.4rem; font-size: 1.25rem; }\r
`,s=`import { Component } from "ngjs-core";
import type { NgbDateStruct } from "ngb-js/datepicker";

@Component({
    selector: "docs-datepicker-custom-day",
    controllerAs: "example",
    templateUrl: "./datepicker-custom-day.component.html",
    styleUrl: "./datepicker-custom-day.component.css",
})
export class DatepickerCustomDayComponent {
    public date: NgbDateStruct = { year: 2026, month: 8, day: 24 };
    public dayData(date: NgbDateStruct) {
        const weekday = new Date(date.year, date.month - 1, date.day).getDay();
        return { weekend: weekday === 0 || weekday === 6 };
    }
}
`,c=`<ng-template ng-ref="example.customDay" let-date let-data="data" let-selected="selected" let-today="today" let-focused="focused">\r
    <span class="day" ng-class="{ selected: selected, today: today, weekend: data.weekend, focused: focused }">\r
        {{ date.day }}\r
        <i ng-if="today" class="bi bi-dot" aria-hidden="true"></i>\r
    </span>\r
</ng-template>\r
<ngb-datepicker ng-model="example.date" day-template="example.customDay" day-template-data="example.dayData"></ngb-datepicker>\r
`,l=`.layout { display: grid; grid-template-columns: repeat(2, max-content); gap: 1rem; width: max-content; border: 1px solid var(--bs-border-color); border-radius: var(--bs-border-radius-lg); background: var(--bs-body-bg); box-shadow: 0 .75rem 2rem rgba(var(--bs-body-color-rgb), .06); }\r
@media (max-width: 575.98px) { .layout { grid-template-columns: max-content; } }\r
`,u=`import { Component } from "ngjs-core";
import type { NgbDatepicker } from "ngb-js/datepicker";

@Component({
    selector: "docs-datepicker-custom-month",
    controllerAs: "example",
    templateUrl: "./datepicker-custom-month.component.html",
    styleUrl: "./datepicker-custom-month.component.css",
})
export class DatepickerCustomMonthComponent {
    public previous(datepicker: NgbDatepicker) { datepicker.navigateTo(datepicker.calendar.getPrev(datepicker.state.firstDate, "m", 1)); }
    public next(datepicker: NgbDatepicker) { datepicker.navigateTo(datepicker.calendar.getNext(datepicker.state.firstDate, "m", 1)); }
    public today(datepicker: NgbDatepicker) { datepicker.navigateTo(datepicker.calendar.getToday()); }
}
`,d=`<ng-template ng-ref="example.content" let-datepicker>\r
    <div class="d-flex align-items-center justify-content-between gap-2 p-2 border-bottom bg-body-tertiary">\r
        <button type="button" class="btn btn-sm btn-outline-secondary" ng-click="example.previous(datepicker)" aria-label="Previous month"><i class="bi bi-chevron-left"></i></button>\r
        <button type="button" class="btn btn-sm btn-link text-decoration-none" ng-click="example.today(datepicker)">Today</button>\r
        <button type="button" class="btn btn-sm btn-outline-secondary" ng-click="example.next(datepicker)" aria-label="Next month"><i class="bi bi-chevron-right"></i></button>\r
    </div>\r
    <div class="layout p-2">\r
        <div ng-repeat="month in datepicker.model.months track by $index">\r
            <p class="small fw-semibold text-center mb-1">{{ datepicker.i18n.getMonthLabel(month.firstDate) }}</p>\r
            <ngb-datepicker-month month="month.firstDate" datepicker="datepicker"></ngb-datepicker-month>\r
        </div>\r
    </div>\r
</ng-template>\r
<div class="overflow-auto pb-2">\r
    <ngb-datepicker display-months="2" navigation="none" outside-days="hidden" content-template="example.content"></ngb-datepicker>\r
</div>\r
`,f=`import { Component } from "ngjs-core";
import type { NgbDateStruct } from "ngb-js/datepicker";

@Component({
    selector: "docs-disabled-datepicker",
    controllerAs: "example",
    templateUrl: "./disabled-datepicker.component.html",
    styleUrl: "./disabled-datepicker.component.css",
})
export class DisabledDatepickerComponent {
    public disabled = true;
    public date: NgbDateStruct = { year: 2026, month: 8, day: 24 };
}
`,p=`<div class="form-check form-switch mb-3">
    <input id="disabled-datepicker-switch" class="form-check-input" type="checkbox" ng-model="example.disabled">
    <label class="form-check-label" for="disabled-datepicker-switch">Disable datepicker</label>
</div>
<ngb-datepicker ng-model="example.date" ng-disabled="example.disabled"></ngb-datepicker>
`,m=`import { Component } from "ngjs-core";
import type { NgbDateStruct, NgbDatepicker } from "ngb-js/datepicker";

@Component({
    selector: "docs-datepicker-footer",
    controllerAs: "example",
    templateUrl: "./datepicker-footer.component.html",
    styleUrl: "./datepicker-footer.component.css",
})
export class DatepickerFooterComponent {
    public date: NgbDateStruct | null = null;
    public datepicker?: NgbDatepicker;
    public today() { if (this.datepicker) this.date = this.datepicker.calendar.getToday(); }
    public clear() { this.date = null; }
}
`,h=`<ng-template ng-ref="example.footer">
    <div class="d-flex gap-2 p-2 border-top bg-body-tertiary">
        <button type="button" class="btn btn-primary btn-sm" ng-click="example.today()">Today</button>
        <button type="button" class="btn btn-outline-secondary btn-sm ms-auto" ng-click="example.clear()">Clear</button>
    </div>
</ng-template>
<ngb-datepicker ng-model="example.date" footer-template="example.footer" ng-ref="example.datepicker" ng-ref-read="ngbDatepicker"></ngb-datepicker>
<p class="small text-body-secondary mt-3 mb-0">Selected date: <code>{{ example.date | json }}</code></p>
`,g=`import { Component, type AfterViewInit, type OnDestroy } from "ngjs-core";
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
`,_=`<div class="alert alert-light border d-flex gap-3 align-items-start" role="note">
    <i class="bi bi-gear text-primary mt-1" aria-hidden="true"></i>
    <div><p class="fw-semibold mb-1">Global defaults used by this example</p><p class="small text-body-secondary mb-0">Two months, arrow navigation, hidden outside days, week numbers and short weekday labels.</p></div>
</div>
<div class="overflow-auto pb-3"><ngb-datepicker ng-model="example.inlineDate"></ngb-datepicker></div>
<div class="input-group" style="max-width: 22rem">
    <input class="form-control" ng-model="example.popupDate" ngb-datepicker aria-label="Globally configured popup datepicker">
    <button type="button" class="btn btn-outline-secondary" ng-click="$datepicker.toggle()" aria-label="Toggle calendar"><i class="bi bi-calendar3"></i></button>
</div>
`,v=`import { Component } from "ngjs-core";
import { NgbDatepickerI18n, type NgbDateStruct } from "ngb-js/datepicker";

class SpanishDatepickerI18n extends NgbDatepickerI18n {
    private readonly months = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
    private readonly weekdays = ["L", "M", "X", "J", "V", "S", "D"];
    getWeekdayLabel(weekday: number) { return this.weekdays[weekday - 1] ?? ""; }
    getMonthShortName(month: number) { return this.months[month - 1]?.slice(0, 3) ?? ""; }
    getMonthFullName(month: number) { return this.months[month - 1] ?? ""; }
    getDayAriaLabel(date: NgbDateStruct) { return \`\${date.day} de \${this.getMonthFullName(date.month)} de \${date.year}\`; }
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
`,y=`<ngb-datepicker ng-model="example.date" i18n="example.i18n" weekdays="'short'"></ngb-datepicker>
`,b=`import { Component } from "ngjs-core";
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
`,x=`<p class="small text-body-secondary">Focus the calendar and press <kbd>[</kbd> or <kbd>]</kbd> to navigate by month. The built-in arrow, Home, End and Page keys continue to work.</p>
<div ng-keydown="example.onKeydown($event)">
    <ngb-datepicker ng-model="example.date" ng-ref="example.datepicker" ng-ref-read="ngbDatepicker"></ngb-datepicker>
</div>
`,S=`import { Component } from "ngjs-core";
import type { NgbDateStruct } from "ngb-js/datepicker";

@Component({
    selector: "docs-multiple-months-datepicker",
    controllerAs: "example",
    templateUrl: "./multiple-months-datepicker.component.html",
    styleUrl: "./multiple-months-datepicker.component.css",
})
export class MultipleMonthsDatepickerComponent {
    public date: NgbDateStruct = { year: 2026, month: 8, day: 24 };
}
`,C=`<div class="overflow-auto pb-2">
    <ngb-datepicker ng-model="example.date" display-months="2" outside-days="hidden"></ngb-datepicker>
</div>
`,w=`import { Component } from "ngjs-core";
import type { NgbDateStruct } from "ngb-js/datepicker";

@Component({
    selector: "docs-popup-datepicker",
    controllerAs: "example",
    templateUrl: "./popup-datepicker.component.html",
    styleUrl: "./popup-datepicker.component.css",
})
export class PopupDatepickerComponent {
    public date: NgbDateStruct = { year: 2026, month: 8, day: 24 };
}
`,T=`<label class="form-label" for="popup-datepicker-input">Choose a date</label>
<div class="input-group" style="max-width: 22rem">
    <input id="popup-datepicker-input" class="form-control" ng-model="example.date" ngb-datepicker ng-focus="$datepicker.open()">
    <button type="button" class="btn btn-outline-secondary" ng-click="$datepicker.toggle()" aria-label="Toggle calendar">
        <i class="bi bi-calendar3" aria-hidden="true"></i>
    </button>
</div>
<p class="small text-body-secondary mt-3 mb-0">Selected date: <code>{{ example.date | json }}</code></p>
`,E=`import { Component } from "ngjs-core";
import type { NgbDateStruct } from "ngb-js/datepicker";

@Component({
    selector: "docs-datepicker-position-target",
    controllerAs: "example",
    templateUrl: "./datepicker-position-target.component.html",
    styleUrl: "./datepicker-position-target.component.css",
})
export class DatepickerPositionTargetComponent {
    public date: NgbDateStruct | null = null;
    public readonly target = "#datepicker-custom-position-target";
}
`,D=`<div class="row g-3 align-items-end">
    <div class="col-sm-7">
        <label class="form-label" for="positioned-datepicker-input">The input controls the popup</label>
        <div class="input-group">
            <input id="positioned-datepicker-input" class="form-control" ng-model="example.date" ngb-datepicker position-target="example.target">
            <button type="button" class="btn btn-outline-secondary" ng-click="$datepicker.toggle()">Open</button>
        </div>
    </div>
    <div class="col-sm-5 text-sm-end">
        <span id="datepicker-custom-position-target" class="d-inline-flex align-items-center gap-2 px-3 py-2 rounded border bg-body-tertiary">
            <i class="bi bi-crosshair" aria-hidden="true"></i> Popup target
        </span>
    </div>
</div>
`,O=`.day { display: inline-flex; width: 2rem; height: 2rem; align-items: center; justify-content: center; border-radius: .35rem; transition: background-color .15s ease, box-shadow .15s ease; }\r
.day.range { background: var(--bs-primary); color: var(--bs-white); box-shadow: inset 0 0 0 1px rgba(255, 255, 255, .22); }\r
.day.faded { background: color-mix(in srgb, var(--bs-primary-bg-subtle) 78%, transparent); color: var(--bs-primary-text-emphasis); }\r
.day.focused { outline: 2px solid rgba(var(--bs-primary-rgb), .45); outline-offset: 1px; }\r
`,k=`import { Component } from "ngjs-core";
import { NgbCalendarGregorian, NgbDate } from "ngb-js/datepicker";

@Component({
    selector: "docs-range-datepicker",
    controllerAs: "example",
    templateUrl: "./range-datepicker.component.html",
    styleUrl: "./range-datepicker.component.css",
})
export class RangeDatepickerComponent {
    private readonly calendar = new NgbCalendarGregorian();
    public hoveredDate: NgbDate | null = null;
    public fromDate = this.calendar.getToday();
    public toDate: NgbDate | null = this.calendar.getNext(this.fromDate, "d", 10);

    public select(date: NgbDate) {
        if (!this.fromDate || this.toDate) {
            this.fromDate = date;
            this.toDate = null;
        } else if (date.after(this.fromDate)) {
            this.toDate = date;
        } else {
            this.fromDate = date;
        }
    }
    public isHovered(date: NgbDate) { return !!this.fromDate && !this.toDate && !!this.hoveredDate && date.after(this.fromDate) && date.before(this.hoveredDate); }
    public isInside(date: NgbDate) { return !!this.toDate && date.after(this.fromDate) && date.before(this.toDate); }
    public isRange(date: NgbDate) { return date.equals(this.fromDate) || (!!this.toDate && date.equals(this.toDate)) || this.isInside(date) || this.isHovered(date); }
}
`,A=`<ng-template ng-ref="example.day" let-date let-focused="focused">\r
    <span class="day" ng-class="{ focused: focused, range: example.isRange(date), faded: example.isHovered(date) || example.isInside(date) }" ng-mouseenter="example.hoveredDate = date" ng-mouseleave="example.hoveredDate = null">{{ date.day }}</span>\r
</ng-template>\r
<div class="overflow-auto pb-2">\r
    <ngb-datepicker display-months="2" outside-days="hidden" day-template="example.day" date-select="example.select($event)"></ngb-datepicker>\r
</div>\r
<p class="small text-body-secondary mt-3 mb-0">From <code>{{ example.fromDate | json }}</code> to <code>{{ example.toDate | json }}</code></p>\r
`,j=`.day { display: inline-flex; width: 2rem; height: 2rem; align-items: center; justify-content: center; border-radius: .35rem; transition: background-color .15s ease, box-shadow .15s ease; }\r
.day.range { background: var(--bs-primary); color: var(--bs-white); box-shadow: inset 0 0 0 1px rgba(255, 255, 255, .22); }\r
.day.faded { background: color-mix(in srgb, var(--bs-primary-bg-subtle) 78%, transparent); color: var(--bs-primary-text-emphasis); }\r
.day.focused { outline: 2px solid rgba(var(--bs-primary-rgb), .45); outline-offset: 1px; }\r
`,M=`import { Component } from "ngjs-core";
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
`,N=`<ng-template ng-ref="example.day" let-date let-focused="focused">\r
    <span class="day" ng-class="{ focused: focused, range: example.isRange(date), faded: example.isHovered(date) || example.isInside(date) }" ng-mouseenter="example.hoveredDate = date" ng-mouseleave="example.hoveredDate = null">{{ date.day }}</span>\r
</ng-template>\r
<div class="input-group" style="max-width: 24rem">\r
    <input class="form-control" ng-model="example.model" ngb-datepicker display-months="2" outside-days="hidden" auto-close="'outside'" day-template="example.day" date-select="example.select($event)" aria-label="Date range">\r
    <button type="button" class="btn btn-outline-secondary" ng-click="$datepicker.toggle()" aria-label="Toggle calendar"><i class="bi bi-calendar-range" aria-hidden="true"></i></button>\r
</div>\r
<p class="small text-body-secondary mt-3 mb-0">From <code>{{ example.fromDate | json }}</code> to <code>{{ example.toDate | json }}</code></p>\r
`,P=class{examples={basic:{html:a,typescript:i},popup:{html:T,typescript:w},multiple:{html:C,typescript:S},range:{html:A,typescript:k,css:O},rangePopup:{html:N,typescript:M,css:j},disabled:{html:p,typescript:f},adapter:{html:r,typescript:n},i18n:{html:y,typescript:v},customDay:{html:c,typescript:s,css:o},customMonth:{html:d,typescript:u,css:l},footer:{html:h,typescript:m},position:{html:D,typescript:E},keyboard:{html:x,typescript:b},global:{html:_,typescript:g}}};P=e([t({selector:`docs-datepicker-examples-page`,controllerAs:`$`,templateUrl:`/ngb-js-docs/templates/datepicker-examples-page.component-8457eaa8.html`,styleUrl:`./datepicker-examples-page.component.css`})],P);export{P as DatepickerExamplesPageComponent};