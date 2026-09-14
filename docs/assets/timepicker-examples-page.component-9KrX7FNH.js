import{d as e,f as t}from"./index-PqXhwIf1.js";var n=`import { Component, type DoCheck } from "ngjs-core";
import { NgbTimeAdapter, type NgbTimeStruct } from "ngb-js/timepicker";

const pad = (value: number): string => value.toString().padStart(2, "0");

export class NgbTimeStringAdapter extends NgbTimeAdapter<string> {
    public fromModel(value: string | null): NgbTimeStruct | null {
        if (!value) return null;
        const [hour, minute, second] = value.split(":").map(Number);
        return { hour, minute, second };
    }

    public toModel(time: NgbTimeStruct | null): string | null {
        return time ? \`\${pad(time.hour)}:\${pad(time.minute)}:\${pad(time.second ?? 0)}\` : null;
    }
}

@Component({
    selector: "docs-timepicker-custom-adapter",
    controllerAs: "example",
    templateUrl: "./timepicker-custom-adapter.component.html",
    styleUrl: "./timepicker-custom-adapter.component.css",
})
export class TimepickerCustomAdapterComponent implements DoCheck {
    public readonly adapter = new NgbTimeStringAdapter();
    public time = this.adapter.fromModel("13:30:00");
    public model = "13:30:00";

    public ngDoCheck(): void {
        this.model = this.adapter.toModel(this.time) ?? "";
    }
}
`,r=`<p>This adapter represents the application model as an <code>HH:mm:ss</code> string.</p>
<div class="d-flex flex-column align-items-start gap-3">
    <ngb-timepicker ng-model="example.time" seconds="true"></ngb-timepicker>
    <hr class="w-100 my-0">
    <pre class="w-100 mb-0">String model: {{ example.model }}</pre>
</div>
`,i=`import { Component } from "ngjs-core";
import type { NgbTimeStruct } from "ngb-js/timepicker";

@Component({
    selector: "docs-basic-timepicker",
    controllerAs: "example",
    templateUrl: "./basic-timepicker.component.html",
    styleUrl: "./basic-timepicker.component.css",
})
export class BasicTimepickerComponent {
    public time: NgbTimeStruct = { hour: 13, minute: 30, second: 0 };
}
`,a=`<div class="d-flex flex-column align-items-start gap-3">
    <ngb-timepicker ng-model="example.time"></ngb-timepicker>
    <hr class="w-100 my-0">
    <pre class="w-100 mb-0">Selected time: {{ example.time | json }}</pre>
</div>
`,o=`import { Component, Injectable } from "ngjs-core";
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
`,s=`<div class="alert alert-light border" role="note">
    Greek period labels supplied by a custom <code>NgbTimepickerI18n</code>:
    <strong>{{ example.i18n.getMorningPeriod() }}</strong> / <strong>{{ example.i18n.getAfternoonPeriod() }}</strong>
</div>

<div class="d-flex align-items-start">
    <ngb-timepicker ng-model="example.time" meridian="true"></ngb-timepicker>
</div>
`,c=`import { Component } from "ngjs-core";
import type { NgbTimeStruct } from "ngb-js/timepicker";

@Component({
    selector: "docs-meridian-timepicker",
    controllerAs: "example",
    templateUrl: "./meridian-timepicker.component.html",
    styleUrl: "./meridian-timepicker.component.css",
})
export class MeridianTimepickerComponent {
    public time: NgbTimeStruct = { hour: 13, minute: 30, second: 0 };
    public meridian = true;
}
`,l=`<div class="d-flex flex-column align-items-start gap-3">
    <ngb-timepicker ng-model="example.time" meridian="example.meridian"></ngb-timepicker>
    <button type="button" class="btn btn-sm" ng-class="example.meridian ? 'btn-outline-success' : 'btn-outline-secondary'" ng-click="example.meridian = !example.meridian">
        Meridian {{ example.meridian ? 'on' : 'off' }}
    </button>
    <hr class="w-100 my-0">
    <pre class="w-100 mb-0">Selected time: {{ example.time | json }}</pre>
</div>
`,u=`import { Component } from "ngjs-core";
import type { NgbTimeStruct } from "ngb-js/timepicker";

@Component({
    selector: "docs-seconds-timepicker",
    controllerAs: "example",
    templateUrl: "./seconds-timepicker.component.html",
    styleUrl: "./seconds-timepicker.component.css",
})
export class SecondsTimepickerComponent {
    public time: NgbTimeStruct = { hour: 13, minute: 30, second: 25 };
    public seconds = true;
}
`,d=`<div class="d-flex flex-column align-items-start gap-3">
    <ngb-timepicker ng-model="example.time" seconds="example.seconds"></ngb-timepicker>
    <button type="button" class="btn btn-sm" ng-class="example.seconds ? 'btn-outline-success' : 'btn-outline-secondary'" ng-click="example.seconds = !example.seconds">
        Seconds {{ example.seconds ? 'on' : 'off' }}
    </button>
    <hr class="w-100 my-0">
    <pre class="w-100 mb-0">Selected time: {{ example.time | json }}</pre>
</div>
`,f=`import { Component } from "ngjs-core";
import type { NgbTimeStruct } from "ngb-js/timepicker";

@Component({
    selector: "docs-spinners-timepicker",
    controllerAs: "example",
    templateUrl: "./spinners-timepicker.component.html",
    styleUrl: "./spinners-timepicker.component.css",
})
export class SpinnersTimepickerComponent {
    public time: NgbTimeStruct = { hour: 13, minute: 30, second: 0 };
    public spinners = true;
}
`,p=`<div class="d-flex flex-column align-items-start gap-3">
    <ngb-timepicker ng-model="example.time" spinners="example.spinners"></ngb-timepicker>
    <button type="button" class="btn btn-sm" ng-class="example.spinners ? 'btn-outline-success' : 'btn-outline-secondary'" ng-click="example.spinners = !example.spinners">
        Spinners {{ example.spinners ? 'on' : 'off' }}
    </button>
</div>
`,m=`import { Component } from "ngjs-core";
import type { NgbTimeStruct } from "ngb-js/timepicker";

@Component({
    selector: "docs-timepicker-custom-steps",
    controllerAs: "example",
    templateUrl: "./timepicker-custom-steps.component.html",
    styleUrl: "./timepicker-custom-steps.component.css",
})
export class TimepickerCustomStepsComponent {
    public time: NgbTimeStruct = { hour: 13, minute: 30, second: 0 };
    public hourStep = 1;
    public minuteStep = 15;
    public secondStep = 30;
}
`,h=`<div class="d-flex flex-column align-items-start gap-3">
    <ngb-timepicker ng-model="example.time" seconds="true" hour-step="example.hourStep" minute-step="example.minuteStep" second-step="example.secondStep"></ngb-timepicker>

    <div class="row g-3 align-self-stretch">
        <div class="col-sm-4">
            <label class="form-label small" for="timepicker-hour-step">Hour step</label>
            <input id="timepicker-hour-step" class="form-control form-control-sm" type="number" min="1" ng-model="example.hourStep">
        </div>
        <div class="col-sm-4">
            <label class="form-label small" for="timepicker-minute-step">Minute step</label>
            <input id="timepicker-minute-step" class="form-control form-control-sm" type="number" min="1" ng-model="example.minuteStep">
        </div>
        <div class="col-sm-4">
            <label class="form-label small" for="timepicker-second-step">Second step</label>
            <input id="timepicker-second-step" class="form-control form-control-sm" type="number" min="1" ng-model="example.secondStep">
        </div>
    </div>

    <hr class="w-100 my-0">
    <pre class="w-100 mb-0">Selected time: {{ example.time | json }}</pre>
</div>
`,g=`import { Component, Directive } from "ngjs-core";
import type { INgModelController } from "angular";
import type { NgbTimeStruct } from "ngb-js/timepicker";

@Component({
    selector: "docs-timepicker-validation",
    controllerAs: "example",
    templateUrl: "./timepicker-validation.component.html",
    styleUrl: "./timepicker-validation.component.css",
})
export class TimepickerValidationComponent {
    public time: NgbTimeStruct | null = null;
}

@Directive({
    selector: "[docsTimepickerLunchValidator]",
    require: "ngModel",
    link: (_scope, _element, _attributes, controller) => {
        const ngModel = controller as INgModelController;
        ngModel.$validators.lunchtime = (modelValue: NgbTimeStruct | null) =>
            !modelValue || (modelValue.hour >= 12 && modelValue.hour <= 13);
    },
})
export class TimepickerLunchValidatorDirective {}
`,_=`<p>Select a time between 12:00 and 13:59.</p>

<form name="example.form" novalidate>
    <div class="d-flex flex-column align-items-start gap-2">
        <ngb-timepicker name="lunchtime" ng-model="example.time" docs-timepicker-lunch-validator required></ngb-timepicker>

        <div class="small text-success" ng-if="example.form.lunchtime.$valid">Great choice.</div>
        <div class="small text-danger" ng-if="example.form.lunchtime.$error.required">Select a lunchtime.</div>
        <div class="small text-danger" ng-if="example.form.lunchtime.$error.lunchtime">The selected time is too early or too late.</div>
    </div>
</form>

<hr>
<pre class="w-100 mb-0">Selected time: {{ example.time | json }}</pre>
`,v=class{examples={basic:{html:a,typescript:i},meridian:{html:l,typescript:c},seconds:{html:d,typescript:u},spinners:{html:p,typescript:f},steps:{html:h,typescript:m},validation:{html:_,typescript:g},adapter:{html:r,typescript:n},i18n:{html:s,typescript:o}}};v=e([t({selector:`docs-timepicker-examples-page`,controllerAs:`$`,templateUrl:`/ngb-js-docs/templates/timepicker-examples-page.component-00454cb4.html`,styleUrl:`./timepicker-examples-page.component.css`})],v);export{v as TimepickerExamplesPageComponent};