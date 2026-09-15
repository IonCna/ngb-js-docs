import{r as e,t}from"./decorate-U3LoYfOr.js";var n=`import { Component, type DoCheck } from "ngjs-core";\r
import { NgbTimeAdapter, type NgbTimeStruct } from "ngb-js/timepicker";\r
\r
const pad = (value: number): string => value.toString().padStart(2, "0");\r
\r
export class NgbTimeStringAdapter extends NgbTimeAdapter<string> {\r
    public fromModel(value: string | null): NgbTimeStruct | null {\r
        if (!value) return null;\r
        const [hour, minute, second] = value.split(":").map(Number);\r
        return { hour, minute, second };\r
    }\r
\r
    public toModel(time: NgbTimeStruct | null): string | null {\r
        return time ? \`\${pad(time.hour)}:\${pad(time.minute)}:\${pad(time.second ?? 0)}\` : null;\r
    }\r
}\r
\r
@Component({\r
    selector: "docs-timepicker-custom-adapter",\r
    controllerAs: "example",\r
    templateUrl: "./timepicker-custom-adapter.component.html",\r
    styleUrl: "./timepicker-custom-adapter.component.css",\r
})\r
export class TimepickerCustomAdapterComponent implements DoCheck {\r
    public readonly adapter = new NgbTimeStringAdapter();\r
    public time = this.adapter.fromModel("13:30:00");\r
    public model = "13:30:00";\r
\r
    public ngDoCheck(): void {\r
        this.model = this.adapter.toModel(this.time) ?? "";\r
    }\r
}\r
`,r=`<p>This adapter represents the application model as an <code>HH:mm:ss</code> string.</p>\r
<div class="d-flex flex-column align-items-start gap-3">\r
    <ngb-timepicker ng-model="example.time" seconds="true"></ngb-timepicker>\r
    <hr class="w-100 my-0">\r
    <pre class="w-100 mb-0">String model: {{ example.model }}</pre>\r
</div>\r
`,i=`import { Component } from "ngjs-core";\r
import type { NgbTimeStruct } from "ngb-js/timepicker";\r
\r
@Component({\r
    selector: "docs-basic-timepicker",\r
    controllerAs: "example",\r
    templateUrl: "./basic-timepicker.component.html",\r
    styleUrl: "./basic-timepicker.component.css",\r
})\r
export class BasicTimepickerComponent {\r
    public time: NgbTimeStruct = { hour: 13, minute: 30, second: 0 };\r
}\r
`,a=`<div class="d-flex flex-column align-items-start gap-3">\r
    <ngb-timepicker ng-model="example.time"></ngb-timepicker>\r
    <hr class="w-100 my-0">\r
    <pre class="w-100 mb-0">Selected time: {{ example.time | json }}</pre>\r
</div>\r
`,o=`import { Component, Injectable } from "ngjs-core";\r
import { NgbTimepickerI18n, type NgbTimeStruct } from "ngb-js/timepicker";\r
\r
@Injectable({ id: "NgbTimepickerI18n" })\r
export class GreekTimepickerI18n extends NgbTimepickerI18n {\r
    public getMorningPeriod(): string { return "π.μ."; }\r
    public getAfternoonPeriod(): string { return "μ.μ."; }\r
}\r
\r
@Component({\r
    selector: "docs-timepicker-i18n",\r
    controllerAs: "example",\r
    templateUrl: "./timepicker-i18n.component.html",\r
    styleUrl: "./timepicker-i18n.component.css",\r
})\r
export class TimepickerI18nComponent {\r
    public time: NgbTimeStruct = { hour: 13, minute: 30, second: 0 };\r
    constructor(public readonly i18n: NgbTimepickerI18n) {}\r
}\r
`,s=`<div class="alert alert-light border" role="note">\r
    Greek period labels supplied by a custom <code>NgbTimepickerI18n</code>:\r
    <strong>{{ example.i18n.getMorningPeriod() }}</strong> / <strong>{{ example.i18n.getAfternoonPeriod() }}</strong>\r
</div>\r
\r
<div class="d-flex align-items-start">\r
    <ngb-timepicker ng-model="example.time" meridian="true"></ngb-timepicker>\r
</div>\r
`,c=`import { Component } from "ngjs-core";\r
import type { NgbTimeStruct } from "ngb-js/timepicker";\r
\r
@Component({\r
    selector: "docs-meridian-timepicker",\r
    controllerAs: "example",\r
    templateUrl: "./meridian-timepicker.component.html",\r
    styleUrl: "./meridian-timepicker.component.css",\r
})\r
export class MeridianTimepickerComponent {\r
    public time: NgbTimeStruct = { hour: 13, minute: 30, second: 0 };\r
    public meridian = true;\r
}\r
`,l=`<div class="d-flex flex-column align-items-start gap-3">\r
    <ngb-timepicker ng-model="example.time" meridian="example.meridian"></ngb-timepicker>\r
    <button type="button" class="btn btn-sm" ng-class="example.meridian ? 'btn-outline-success' : 'btn-outline-secondary'" ng-click="example.meridian = !example.meridian">\r
        Meridian {{ example.meridian ? 'on' : 'off' }}\r
    </button>\r
    <hr class="w-100 my-0">\r
    <pre class="w-100 mb-0">Selected time: {{ example.time | json }}</pre>\r
</div>\r
`,u=`import { Component } from "ngjs-core";\r
import type { NgbTimeStruct } from "ngb-js/timepicker";\r
\r
@Component({\r
    selector: "docs-seconds-timepicker",\r
    controllerAs: "example",\r
    templateUrl: "./seconds-timepicker.component.html",\r
    styleUrl: "./seconds-timepicker.component.css",\r
})\r
export class SecondsTimepickerComponent {\r
    public time: NgbTimeStruct = { hour: 13, minute: 30, second: 25 };\r
    public seconds = true;\r
}\r
`,d=`<div class="d-flex flex-column align-items-start gap-3">\r
    <ngb-timepicker ng-model="example.time" seconds="example.seconds"></ngb-timepicker>\r
    <button type="button" class="btn btn-sm" ng-class="example.seconds ? 'btn-outline-success' : 'btn-outline-secondary'" ng-click="example.seconds = !example.seconds">\r
        Seconds {{ example.seconds ? 'on' : 'off' }}\r
    </button>\r
    <hr class="w-100 my-0">\r
    <pre class="w-100 mb-0">Selected time: {{ example.time | json }}</pre>\r
</div>\r
`,f=`import { Component } from "ngjs-core";\r
import type { NgbTimeStruct } from "ngb-js/timepicker";\r
\r
@Component({\r
    selector: "docs-spinners-timepicker",\r
    controllerAs: "example",\r
    templateUrl: "./spinners-timepicker.component.html",\r
    styleUrl: "./spinners-timepicker.component.css",\r
})\r
export class SpinnersTimepickerComponent {\r
    public time: NgbTimeStruct = { hour: 13, minute: 30, second: 0 };\r
    public spinners = true;\r
}\r
`,p=`<div class="d-flex flex-column align-items-start gap-3">\r
    <ngb-timepicker ng-model="example.time" spinners="example.spinners"></ngb-timepicker>\r
    <button type="button" class="btn btn-sm" ng-class="example.spinners ? 'btn-outline-success' : 'btn-outline-secondary'" ng-click="example.spinners = !example.spinners">\r
        Spinners {{ example.spinners ? 'on' : 'off' }}\r
    </button>\r
</div>\r
`,m=`import { Component } from "ngjs-core";\r
import type { NgbTimeStruct } from "ngb-js/timepicker";\r
\r
@Component({\r
    selector: "docs-timepicker-custom-steps",\r
    controllerAs: "example",\r
    templateUrl: "./timepicker-custom-steps.component.html",\r
    styleUrl: "./timepicker-custom-steps.component.css",\r
})\r
export class TimepickerCustomStepsComponent {\r
    public time: NgbTimeStruct = { hour: 13, minute: 30, second: 0 };\r
    public hourStep = 1;\r
    public minuteStep = 15;\r
    public secondStep = 30;\r
}\r
`,h=`<div class="d-flex flex-column align-items-start gap-3">\r
    <ngb-timepicker ng-model="example.time" seconds="true" hour-step="example.hourStep" minute-step="example.minuteStep" second-step="example.secondStep"></ngb-timepicker>\r
\r
    <div class="row g-3 align-self-stretch">\r
        <div class="col-sm-4">\r
            <label class="form-label small" for="timepicker-hour-step">Hour step</label>\r
            <input id="timepicker-hour-step" class="form-control form-control-sm" type="number" min="1" ng-model="example.hourStep">\r
        </div>\r
        <div class="col-sm-4">\r
            <label class="form-label small" for="timepicker-minute-step">Minute step</label>\r
            <input id="timepicker-minute-step" class="form-control form-control-sm" type="number" min="1" ng-model="example.minuteStep">\r
        </div>\r
        <div class="col-sm-4">\r
            <label class="form-label small" for="timepicker-second-step">Second step</label>\r
            <input id="timepicker-second-step" class="form-control form-control-sm" type="number" min="1" ng-model="example.secondStep">\r
        </div>\r
    </div>\r
\r
    <hr class="w-100 my-0">\r
    <pre class="w-100 mb-0">Selected time: {{ example.time | json }}</pre>\r
</div>\r
`,g=`import { Component, Directive } from "ngjs-core";\r
import type { INgModelController } from "angular";\r
import type { NgbTimeStruct } from "ngb-js/timepicker";\r
\r
@Component({\r
    selector: "docs-timepicker-validation",\r
    controllerAs: "example",\r
    templateUrl: "./timepicker-validation.component.html",\r
    styleUrl: "./timepicker-validation.component.css",\r
})\r
export class TimepickerValidationComponent {\r
    public time: NgbTimeStruct | null = null;\r
}\r
\r
@Directive({\r
    selector: "[docsTimepickerLunchValidator]",\r
    require: "ngModel",\r
    link: (_scope, _element, _attributes, controller) => {\r
        const ngModel = controller as INgModelController;\r
        ngModel.$validators.lunchtime = (modelValue: NgbTimeStruct | null) =>\r
            !modelValue || (modelValue.hour >= 12 && modelValue.hour <= 13);\r
    },\r
})\r
export class TimepickerLunchValidatorDirective {}\r
`,_=`<p>Select a time between 12:00 and 13:59.</p>\r
\r
<form name="example.form" novalidate>\r
    <div class="d-flex flex-column align-items-start gap-2">\r
        <ngb-timepicker name="lunchtime" ng-model="example.time" docs-timepicker-lunch-validator required></ngb-timepicker>\r
\r
        <div class="small text-success" ng-if="example.form.lunchtime.$valid">Great choice.</div>\r
        <div class="small text-danger" ng-if="example.form.lunchtime.$error.required">Select a lunchtime.</div>\r
        <div class="small text-danger" ng-if="example.form.lunchtime.$error.lunchtime">The selected time is too early or too late.</div>\r
    </div>\r
</form>\r
\r
<hr>\r
<pre class="w-100 mb-0">Selected time: {{ example.time | json }}</pre>\r
`,v=class{examples={basic:{html:a,typescript:i},meridian:{html:l,typescript:c},seconds:{html:d,typescript:u},spinners:{html:p,typescript:f},steps:{html:h,typescript:m},validation:{html:_,typescript:g},adapter:{html:r,typescript:n},i18n:{html:s,typescript:o}}};v=t([e({selector:`docs-timepicker-examples-page`,controllerAs:`$`,templateUrl:`/ngb-js-docs/templates/timepicker-examples-page.component-4b524a6b.html`,styleUrl:`./timepicker-examples-page.component.css`})],v);export{v as TimepickerExamplesPageComponent};