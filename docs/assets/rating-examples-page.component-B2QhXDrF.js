import{d as e,f as t}from"./index-B9XAkpig.js";var n=`import { Component } from "ngjs-core";

@Component({
    selector: "docs-basic-rating",
    controllerAs: "example",
    templateUrl: "./basic-rating.component.html",
    styleUrl: "./basic-rating.component.css",
})
export class BasicRatingComponent {
    public rating = 3;
    public setRating(rating: number) { this.rating = rating; }
}
`,r=`<ngb-rating rate="example.rating" rate-change="example.setRating($event)"></ngb-rating>
<hr>
<p class="mb-0">Rate: <strong>{{ example.rating }}</strong></p>
`,i=`.star { color: var(--bs-secondary-color); font-size: 2.1rem; padding-right: .15rem; filter: drop-shadow(0 .2rem .35rem rgba(var(--bs-body-color-rgb), .1)); }\r
.star.filled { color: var(--bs-warning); }\r
.star.filled.low { color: var(--bs-danger); }\r
`,a=`import { Component } from "ngjs-core";

@Component({
    selector: "docs-rating-custom-template",
    controllerAs: "example",
    templateUrl: "./rating-custom-template.component.html",
    styleUrl: "./rating-custom-template.component.css",
})
export class RatingCustomTemplateComponent {
    public rating = 6;
    public setRating(rating: number) { this.rating = rating; }
}
`,o=`<p>Bootstrap Icons are rendered through a child <code>ng-template</code>.</p>\r
<ngb-rating rate="example.rating" rate-change="example.setRating($event)">\r
    <ng-template let-fill="fill" let-index="index">\r
        <i class="bi star" ng-class="[fill === 100 ? 'bi-star-fill filled' : 'bi-star', { low: index < 3 }]" aria-hidden="true"></i>\r
    </ng-template>\r
</ngb-rating>\r
<hr>\r
<p class="mb-0">Rate: <strong>{{ example.rating }}</strong></p>\r
`,s=`.heart { color: var(--bs-secondary-bg); display: inline-block; font-size: 2.35rem; margin-right: .15rem; position: relative; filter: drop-shadow(0 .25rem .45rem rgba(var(--bs-body-color-rgb), .1)); }\r
.heart .fill { color: var(--bs-danger); left: 0; overflow: hidden; position: absolute; top: 0; }\r
`,c=`import { Component, type TemplateRef } from "ngjs-core";

@Component({
    selector: "docs-rating-decimal",
    controllerAs: "example",
    templateUrl: "./rating-decimal.component.html",
    styleUrl: "./rating-decimal.component.css",
})
export class RatingDecimalComponent {
    public rating = 3.14;
    public heartTemplate?: TemplateRef<unknown>;
    public readonly ariaValueText = (current: number, max: number) => \`\${current} out of \${max} hearts\`;
}
`,l=`<ng-template ng-ref="example.heartTemplate" let-fill="fill">\r
    <span class="heart">\r
        <i class="bi bi-heart-fill" aria-hidden="true"></i>\r
        <span class="fill" ng-style="{ width: fill + '%' }"><i class="bi bi-heart-fill" aria-hidden="true"></i></span>\r
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
`,u=`import { Component } from "ngjs-core";

@Component({
    selector: "docs-rating-events",
    controllerAs: "example",
    templateUrl: "./rating-events.component.html",
    styleUrl: "./rating-events.component.css",
})
export class RatingEventsComponent {
    public selected = 0;
    public hovered = 0;
    public readonly = false;
    public setSelected(value: number) { this.selected = value; }
    public setHovered(value: number) { this.hovered = value; }
}
`,d=`<ngb-rating rate="example.selected" rate-change="example.setSelected($event)" hover="example.setHovered($event)" leave="example.setHovered(0)" readonly="example.readonly"></ngb-rating>
<hr>
<dl class="row mb-3">
    <dt class="col-auto">Selected</dt><dd class="col mb-0">{{ example.selected }}</dd>
    <dt class="col-auto">Hovered</dt><dd class="col mb-0">{{ example.hovered }}</dd>
</dl>
<button type="button" class="btn btn-sm" ng-class="example.readonly ? 'btn-outline-danger' : 'btn-outline-success'" ng-click="example.readonly = !example.readonly">
    {{ example.readonly ? 'Read-only' : 'Editable' }}
</button>
`,f=`import { Component } from "ngjs-core";
import type { IFormController } from "angular";

@Component({
    selector: "docs-rating-form",
    controllerAs: "example",
    templateUrl: "./rating-form.component.html",
    styleUrl: "./rating-form.component.css",
})
export class RatingFormComponent {
    public rating: number | null = null;
    public disabled = false;
    public form?: IFormController;

    public setRating(rating: number) { this.rating = rating; }
    public clear() { this.rating = null; }
}
`,p=`<form name="example.form" novalidate>
    <ngb-rating rate="example.rating" rate-change="example.setRating($event)" ng-disabled="example.disabled"></ngb-rating>
    <input class="visually-hidden" type="number" name="rating" ng-model="example.rating" min="1" required ng-disabled="example.disabled" tabindex="-1" aria-hidden="true">

    <p class="small mt-2 mb-3" ng-class="example.form.rating.$valid ? 'text-success' : 'text-danger'">
        {{ example.form.rating.$valid ? 'Thanks!' : 'Please rate us' }}
    </p>

    <p>Model: <strong>{{ example.rating === null ? 'null' : example.rating }}</strong></p>
    <div class="d-flex flex-wrap gap-2">
        <button type="button" class="btn btn-sm" ng-class="example.disabled ? 'btn-outline-danger' : 'btn-outline-success'" ng-click="example.disabled = !example.disabled">
            {{ example.disabled ? 'Control disabled' : 'Control enabled' }}
        </button>
        <button type="button" class="btn btn-sm btn-outline-primary" ng-click="example.clear()">Clear</button>
    </div>
</form>
`,m=`import { Component, Inject, type AfterViewInit, type OnDestroy } from "ngjs-core";
import { NgbRatingConfig, NGB_RATING_CONFIG } from "ngb-js/rating";

@Component({
    selector: "docs-rating-global",
    controllerAs: "example",
    templateUrl: "./rating-global.component.html",
    styleUrl: "./rating-global.component.css",
})
export class RatingGlobalComponent implements AfterViewInit, OnDestroy {
    private readonly initialConfig: Pick<NgbRatingConfig, "max" | "readonly" | "resettable" | "tabindex">;

    constructor(@Inject(NGB_RATING_CONFIG) private readonly config: NgbRatingConfig) {
        this.initialConfig = {
            max: config.max,
            readonly: config.readonly,
            resettable: config.resettable,
            tabindex: config.tabindex,
        };
        config.max = 5;
        config.readonly = true;
        config.resettable = true;
        config.tabindex = -1;
    }

    public ngAfterViewInit() { this.restoreConfig(); }
    public ngOnDestroy() { this.restoreConfig(); }
    private restoreConfig() { Object.assign(this.config, this.initialConfig); }
}
`,h=`<div class="alert alert-light border d-flex gap-3 align-items-start" role="note">
    <i class="bi bi-gear text-primary mt-1" aria-hidden="true"></i>
    <div><p class="fw-semibold mb-1">Customized defaults</p><p class="small text-body-secondary mb-0">Five stars, read-only behavior and no keyboard tab stop.</p></div>
</div>

<ngb-rating rate="3"></ngb-rating>
`,g=class{examples={basic:{html:r,typescript:n},events:{html:d,typescript:u},customTemplate:{html:o,typescript:a,css:i},decimal:{html:l,typescript:c,css:s},form:{html:p,typescript:f},global:{html:h,typescript:m}}};g=e([t({selector:`docs-rating-examples-page`,controllerAs:`$`,templateUrl:`/ngb-js-docs/templates/rating-examples-page.component-342d42a0.html`,styleUrl:`./rating-examples-page.component.css`})],g);export{g as RatingExamplesPageComponent};