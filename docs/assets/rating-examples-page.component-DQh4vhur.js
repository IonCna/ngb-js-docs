import{r as e,t}from"./decorate-U3LoYfOr.js";var n=`import { Component } from "ngjs-core";\r
\r
@Component({\r
    selector: "docs-basic-rating",\r
    controllerAs: "example",\r
    templateUrl: "./basic-rating.component.html",\r
    styleUrl: "./basic-rating.component.css",\r
})\r
export class BasicRatingComponent {\r
    public rating = 3;\r
    public setRating(rating: number) { this.rating = rating; }\r
}\r
`,r=`<ngb-rating rate="example.rating" rate-change="example.setRating($event)"></ngb-rating>\r
<hr>\r
<p class="mb-0">Rate: <strong>{{ example.rating }}</strong></p>\r
`,i=`.star { color: var(--bs-secondary-color); font-size: 2.1rem; padding-right: .15rem; filter: drop-shadow(0 .2rem .35rem rgba(var(--bs-body-color-rgb), .1)); }
.star.filled { color: var(--bs-warning); }
.star.filled.low { color: var(--bs-danger); }
`,a=`import { Component } from "ngjs-core";\r
\r
@Component({\r
    selector: "docs-rating-custom-template",\r
    controllerAs: "example",\r
    templateUrl: "./rating-custom-template.component.html",\r
    styleUrl: "./rating-custom-template.component.css",\r
})\r
export class RatingCustomTemplateComponent {\r
    public rating = 6;\r
    public setRating(rating: number) { this.rating = rating; }\r
}\r
`,o=`<p>Bootstrap Icons are rendered through a child <code>ng-template</code>.</p>\r
<ngb-rating rate="example.rating" rate-change="example.setRating($event)">\r
    <ng-template let-fill="fill" let-index="index">\r
        <i class="bi star" ng-class="[fill === 100 ? 'bi-star-fill filled' : 'bi-star', { low: index < 3 }]" aria-hidden="true"></i>
    </ng-template>\r
</ngb-rating>\r
<hr>\r
<p class="mb-0">Rate: <strong>{{ example.rating }}</strong></p>\r
`,s=`.heart { color: var(--bs-secondary-bg); display: inline-block; font-size: 2.35rem; margin-right: .15rem; position: relative; filter: drop-shadow(0 .25rem .45rem rgba(var(--bs-body-color-rgb), .1)); }
.heart .fill { color: var(--bs-danger); left: 0; overflow: hidden; position: absolute; top: 0; }
`,c=`import { Component, type TemplateRef } from "ngjs-core";\r
\r
@Component({\r
    selector: "docs-rating-decimal",\r
    controllerAs: "example",\r
    templateUrl: "./rating-decimal.component.html",\r
    styleUrl: "./rating-decimal.component.css",\r
})\r
export class RatingDecimalComponent {\r
    public rating = 3.14;\r
    public heartTemplate?: TemplateRef<unknown>;\r
    public readonly ariaValueText = (current: number, max: number) => \`\${current} out of \${max} hearts\`;\r
}\r
`,l=`<ng-template ng-ref="example.heartTemplate" let-fill="fill">\r
    <span class="heart">
        <i class="bi bi-heart-fill" aria-hidden="true"></i>
        <span class="fill" ng-style="{ width: fill + '%' }"><i class="bi bi-heart-fill" aria-hidden="true"></i></span>
    </span>\r
</ng-template>\r
\r
<ngb-rating rate="example.rating" max="5" readonly="true" star-template="example.heartTemplate" aria-value-text="example.ariaValueText"></ngb-rating>\r
<hr>\r
<p>Rate: <strong>{{ example.rating }}</strong></p>\r
<div class="d-flex flex-wrap gap-2">\r
    <button type="button" class="btn btn-sm btn-outline-primary" ng-click="example.rating = 1.35">1.35</button>\r
    <button type="button" class="btn btn-sm btn-outline-primary" ng-click="example.rating = 4.72">4.72</button>\r
</div>\r
`,u=`import { Component } from "ngjs-core";\r
\r
@Component({\r
    selector: "docs-rating-events",\r
    controllerAs: "example",\r
    templateUrl: "./rating-events.component.html",\r
    styleUrl: "./rating-events.component.css",\r
})\r
export class RatingEventsComponent {\r
    public selected = 0;\r
    public hovered = 0;\r
    public readonly = false;\r
    public setSelected(value: number) { this.selected = value; }\r
    public setHovered(value: number) { this.hovered = value; }\r
}\r
`,d=`<ngb-rating rate="example.selected" rate-change="example.setSelected($event)" hover="example.setHovered($event)" leave="example.setHovered(0)" readonly="example.readonly"></ngb-rating>\r
<hr>\r
<dl class="row mb-3">\r
    <dt class="col-auto">Selected</dt><dd class="col mb-0">{{ example.selected }}</dd>\r
    <dt class="col-auto">Hovered</dt><dd class="col mb-0">{{ example.hovered }}</dd>\r
</dl>\r
<button type="button" class="btn btn-sm" ng-class="example.readonly ? 'btn-outline-danger' : 'btn-outline-success'" ng-click="example.readonly = !example.readonly">\r
    {{ example.readonly ? 'Read-only' : 'Editable' }}\r
</button>\r
`,f=`import { Component } from "ngjs-core";\r
import type { IFormController } from "angular";\r
\r
@Component({\r
    selector: "docs-rating-form",\r
    controllerAs: "example",\r
    templateUrl: "./rating-form.component.html",\r
    styleUrl: "./rating-form.component.css",\r
})\r
export class RatingFormComponent {\r
    public rating: number | null = null;\r
    public disabled = false;\r
    public form?: IFormController;\r
\r
    public setRating(rating: number) { this.rating = rating; }\r
    public clear() { this.rating = null; }\r
}\r
`,p=`<form name="example.form" novalidate>\r
    <ngb-rating rate="example.rating" rate-change="example.setRating($event)" ng-disabled="example.disabled"></ngb-rating>\r
    <input class="visually-hidden" type="number" name="rating" ng-model="example.rating" min="1" required ng-disabled="example.disabled" tabindex="-1" aria-hidden="true">\r
\r
    <p class="small mt-2 mb-3" ng-class="example.form.rating.$valid ? 'text-success' : 'text-danger'">\r
        {{ example.form.rating.$valid ? 'Thanks!' : 'Please rate us' }}\r
    </p>\r
\r
    <p>Model: <strong>{{ example.rating === null ? 'null' : example.rating }}</strong></p>\r
    <div class="d-flex flex-wrap gap-2">\r
        <button type="button" class="btn btn-sm" ng-class="example.disabled ? 'btn-outline-danger' : 'btn-outline-success'" ng-click="example.disabled = !example.disabled">\r
            {{ example.disabled ? 'Control disabled' : 'Control enabled' }}\r
        </button>\r
        <button type="button" class="btn btn-sm btn-outline-primary" ng-click="example.clear()">Clear</button>\r
    </div>\r
</form>\r
`,m=`import { Component, Inject, type AfterViewInit, type OnDestroy } from "ngjs-core";\r
import { NgbRatingConfig, NGB_RATING_CONFIG } from "ngb-js/rating";\r
\r
@Component({\r
    selector: "docs-rating-global",\r
    controllerAs: "example",\r
    templateUrl: "./rating-global.component.html",\r
    styleUrl: "./rating-global.component.css",\r
})\r
export class RatingGlobalComponent implements AfterViewInit, OnDestroy {\r
    private readonly initialConfig: Pick<NgbRatingConfig, "max" | "readonly" | "resettable" | "tabindex">;\r
\r
    constructor(@Inject(NGB_RATING_CONFIG) private readonly config: NgbRatingConfig) {\r
        this.initialConfig = {\r
            max: config.max,\r
            readonly: config.readonly,\r
            resettable: config.resettable,\r
            tabindex: config.tabindex,\r
        };\r
        config.max = 5;\r
        config.readonly = true;\r
        config.resettable = true;\r
        config.tabindex = -1;\r
    }\r
\r
    public ngAfterViewInit() { this.restoreConfig(); }\r
    public ngOnDestroy() { this.restoreConfig(); }\r
    private restoreConfig() { Object.assign(this.config, this.initialConfig); }\r
}\r
`,h=`<div class="alert alert-light border d-flex gap-3 align-items-start" role="note">\r
    <i class="bi bi-gear text-primary mt-1" aria-hidden="true"></i>\r
    <div><p class="fw-semibold mb-1">Customized defaults</p><p class="small text-body-secondary mb-0">Five stars, read-only behavior and no keyboard tab stop.</p></div>\r
</div>\r
\r
<ngb-rating rate="3"></ngb-rating>\r
`,g=class{examples={basic:{html:r,typescript:n},events:{html:d,typescript:u},customTemplate:{html:o,typescript:a,css:i},decimal:{html:l,typescript:c,css:s},form:{html:p,typescript:f},global:{html:h,typescript:m}}};g=t([e({selector:`docs-rating-examples-page`,controllerAs:`$`,templateUrl:`/ngb-js-docs/templates/rating-examples-page.component-12ee2d16.html`,styleUrl:`./rating-examples-page.component.css`})],g);export{g as RatingExamplesPageComponent};