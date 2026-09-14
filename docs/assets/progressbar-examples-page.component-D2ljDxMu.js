import{d as e,f as t}from"./index-PqXhwIf1.js";var n=`import { Component } from "ngjs-core";

@Component({
    selector: "docs-contextual-text-progressbar",
    controllerAs: "example",
    templateUrl: "./contextual-text-progressbar.component.html",
    styleUrl: "./contextual-text-progressbar.component.css",
})
export class ContextualTextProgressbarComponent {}
`,r=`<div class="vstack gap-3">
    <ngb-progressbar type="success" text-type="white" value="25" show-value="true"></ngb-progressbar>
    <ngb-progressbar type="dark" text-type="white" value="50" show-value="true"></ngb-progressbar>
    <ngb-progressbar type="light" text-type="success" value="75" show-value="true"></ngb-progressbar>
    <ngb-progressbar type="warning" text-type="dark" value="100" show-value="true"></ngb-progressbar>
</div>
`,i=`import { Component, Inject, type AfterViewInit, type OnDestroy } from "ngjs-core";
import { NgbProgressbarConfig, NGB_PROGRESSBAR_CONFIG } from "ngb-js/progressbar";

@Component({
    selector: "docs-progressbar-global",
    controllerAs: "example",
    templateUrl: "./progressbar-global.component.html",
    styleUrl: "./progressbar-global.component.css",
})
export class ProgressbarGlobalComponent implements AfterViewInit, OnDestroy {
    private readonly initialConfig: Pick<NgbProgressbarConfig, "animated" | "height" | "max" | "showValue" | "striped" | "textType" | "type">;

    constructor(@Inject(NGB_PROGRESSBAR_CONFIG) private readonly config: NgbProgressbarConfig) {
        this.initialConfig = {
            animated: config.animated,
            height: config.height,
            max: config.max,
            showValue: config.showValue,
            striped: config.striped,
            textType: config.textType,
            type: config.type,
        };
        config.animated = true;
        config.height = "1.5rem";
        config.max = 200;
        config.showValue = true;
        config.striped = true;
        config.textType = "light";
        config.type = "primary";
    }

    public ngAfterViewInit() { this.restoreConfig(); }
    public ngOnDestroy() { this.restoreConfig(); }
    private restoreConfig() { Object.assign(this.config, this.initialConfig); }
}
`,a=`<div class="alert alert-light border d-flex gap-3 align-items-start" role="note">
    <i class="bi bi-gear text-primary mt-1" aria-hidden="true"></i>
    <div><p class="fw-semibold mb-1">Global defaults used by this example</p><p class="small text-body-secondary mb-0">Primary, striped and animated; maximum 200, visible percentage and 1.5rem height.</p></div>
</div>

<ngb-progressbar value="135"></ngb-progressbar>
`,o=`import { Component } from "ngjs-core";

@Component({
    selector: "docs-progress-height",
    controllerAs: "example",
    templateUrl: "./progress-height.component.html",
    styleUrl: "./progress-height.component.css",
})
export class ProgressHeightComponent {}
`,s=`<div class="vstack gap-3">
    <ngb-progressbar type="success" value="25">Default</ngb-progressbar>
    <ngb-progressbar type="info" value="50" height="10px">10px</ngb-progressbar>
    <ngb-progressbar type="warning" value="75" height="1.5rem">1.5rem</ngb-progressbar>
    <ngb-progressbar type="danger" value="100" height="2rem">2rem</ngb-progressbar>
</div>
`,c=`import { Component } from "ngjs-core";

@Component({
    selector: "docs-custom-labels-progressbar",
    controllerAs: "example",
    templateUrl: "./custom-labels-progressbar.component.html",
    styleUrl: "./custom-labels-progressbar.component.css",
})
export class CustomLabelsProgressbarComponent {}
`,l=`<div class="vstack gap-3">
    <ngb-progressbar type="success" value="25"><strong>25%</strong></ngb-progressbar>
    <ngb-progressbar type="info" value="50">Copying file <strong class="ms-1">2 of 4</strong></ngb-progressbar>
    <ngb-progressbar type="warning" value="75" striped="true" animated="true"><em>Almost there…</em></ngb-progressbar>
    <ngb-progressbar type="danger" value="100">Completed!</ngb-progressbar>
</div>
`,u=`import { Component } from "ngjs-core";

@Component({
    selector: "docs-simple-progressbar",
    controllerAs: "example",
    templateUrl: "./simple-progressbar.component.html",
    styleUrl: "./simple-progressbar.component.css",
})
export class SimpleProgressbarComponent {}
`,d=`<div class="vstack gap-3">
    <ngb-progressbar type="success" value="25"></ngb-progressbar>
    <ngb-progressbar type="info" value="50"></ngb-progressbar>
    <ngb-progressbar type="warning" value="75"></ngb-progressbar>
    <ngb-progressbar type="danger" value="100"></ngb-progressbar>
    <ngb-progressbar type="primary" value="75"></ngb-progressbar>
    <ngb-progressbar type="secondary" value="50"></ngb-progressbar>
    <ngb-progressbar type="dark" value="25"></ngb-progressbar>
</div>
`,f=`import { Component } from "ngjs-core";

@Component({
    selector: "docs-progress-bars-stacked",
    controllerAs: "example",
    templateUrl: "./progress-bars-stacked.component.html",
    styleUrl: "./progress-bars-stacked.component.css",
})
export class ProgressBarsStackedComponent {}
`,p=`<ngb-progressbar-stacked>
    <ngb-progressbar type="danger" value="20">20%</ngb-progressbar>
    <ngb-progressbar type="warning" value="35">35%</ngb-progressbar>
    <ngb-progressbar type="success" value="45">45%</ngb-progressbar>
</ngb-progressbar-stacked>

<p class="small text-body-secondary mt-3 mb-0">The three segments share one Bootstrap stacked progress container.</p>
`,m=`import { Component } from "ngjs-core";

@Component({
    selector: "docs-striped-progress-bar",
    controllerAs: "example",
    templateUrl: "./striped-progress-bar.component.html",
    styleUrl: "./striped-progress-bar.component.css",
})
export class StripedProgressBarComponent {}
`,h=`<div class="vstack gap-3">
    <ngb-progressbar type="success" value="25" striped="true"></ngb-progressbar>
    <ngb-progressbar type="info" value="50" striped="true"></ngb-progressbar>
    <ngb-progressbar type="warning" value="75" striped="true"></ngb-progressbar>
    <ngb-progressbar type="danger" value="100" striped="true"></ngb-progressbar>
    <ngb-progressbar type="primary" value="65" striped="true" animated="true">Animated</ngb-progressbar>
</div>
`,g=class{examples={simple:{html:d,typescript:u},contextual:{html:r,typescript:n},striped:{html:h,typescript:m},labels:{html:l,typescript:c},height:{html:s,typescript:o},stacked:{html:p,typescript:f},global:{html:a,typescript:i}}};g=e([t({selector:`docs-progressbar-examples-page`,controllerAs:`$`,templateUrl:`/ngb-js-docs/templates/progressbar-examples-page.component-6bbfcd64.html`,styleUrl:`./progressbar-examples-page.component.css`})],g);export{g as ProgressbarExamplesPageComponent};