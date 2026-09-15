import{r as e,t}from"./decorate-U3LoYfOr.js";var n=`import { Component } from "ngjs-core";\r
\r
@Component({\r
    selector: "docs-contextual-text-progressbar",\r
    controllerAs: "example",\r
    templateUrl: "./contextual-text-progressbar.component.html",\r
    styleUrl: "./contextual-text-progressbar.component.css",\r
})\r
export class ContextualTextProgressbarComponent {}\r
`,r=`<div class="vstack gap-3">\r
    <ngb-progressbar type="success" text-type="white" value="25" show-value="true"></ngb-progressbar>\r
    <ngb-progressbar type="dark" text-type="white" value="50" show-value="true"></ngb-progressbar>\r
    <ngb-progressbar type="light" text-type="success" value="75" show-value="true"></ngb-progressbar>\r
    <ngb-progressbar type="warning" text-type="dark" value="100" show-value="true"></ngb-progressbar>\r
</div>\r
`,i=`import { Component, Inject, type AfterViewInit, type OnDestroy } from "ngjs-core";\r
import { NgbProgressbarConfig, NGB_PROGRESSBAR_CONFIG } from "ngb-js/progressbar";\r
\r
@Component({\r
    selector: "docs-progressbar-global",\r
    controllerAs: "example",\r
    templateUrl: "./progressbar-global.component.html",\r
    styleUrl: "./progressbar-global.component.css",\r
})\r
export class ProgressbarGlobalComponent implements AfterViewInit, OnDestroy {\r
    private readonly initialConfig: Pick<NgbProgressbarConfig, "animated" | "height" | "max" | "showValue" | "striped" | "textType" | "type">;\r
\r
    constructor(@Inject(NGB_PROGRESSBAR_CONFIG) private readonly config: NgbProgressbarConfig) {\r
        this.initialConfig = {\r
            animated: config.animated,\r
            height: config.height,\r
            max: config.max,\r
            showValue: config.showValue,\r
            striped: config.striped,\r
            textType: config.textType,\r
            type: config.type,\r
        };\r
        config.animated = true;\r
        config.height = "1.5rem";\r
        config.max = 200;\r
        config.showValue = true;\r
        config.striped = true;\r
        config.textType = "light";\r
        config.type = "primary";\r
    }\r
\r
    public ngAfterViewInit() { this.restoreConfig(); }\r
    public ngOnDestroy() { this.restoreConfig(); }\r
    private restoreConfig() { Object.assign(this.config, this.initialConfig); }\r
}\r
`,a=`<div class="alert alert-light border d-flex gap-3 align-items-start" role="note">\r
    <i class="bi bi-gear text-primary mt-1" aria-hidden="true"></i>\r
    <div><p class="fw-semibold mb-1">Global defaults used by this example</p><p class="small text-body-secondary mb-0">Primary, striped and animated; maximum 200, visible percentage and 1.5rem height.</p></div>\r
</div>\r
\r
<ngb-progressbar value="135"></ngb-progressbar>\r
`,o=`import { Component } from "ngjs-core";\r
\r
@Component({\r
    selector: "docs-progress-height",\r
    controllerAs: "example",\r
    templateUrl: "./progress-height.component.html",\r
    styleUrl: "./progress-height.component.css",\r
})\r
export class ProgressHeightComponent {}\r
`,s=`<div class="vstack gap-3">\r
    <ngb-progressbar type="success" value="25">Default</ngb-progressbar>\r
    <ngb-progressbar type="info" value="50" height="10px">10px</ngb-progressbar>\r
    <ngb-progressbar type="warning" value="75" height="1.5rem">1.5rem</ngb-progressbar>\r
    <ngb-progressbar type="danger" value="100" height="2rem">2rem</ngb-progressbar>\r
</div>\r
`,c=`import { Component } from "ngjs-core";\r
\r
@Component({\r
    selector: "docs-custom-labels-progressbar",\r
    controllerAs: "example",\r
    templateUrl: "./custom-labels-progressbar.component.html",\r
    styleUrl: "./custom-labels-progressbar.component.css",\r
})\r
export class CustomLabelsProgressbarComponent {}\r
`,l=`<div class="vstack gap-3">\r
    <ngb-progressbar type="success" value="25"><strong>25%</strong></ngb-progressbar>\r
    <ngb-progressbar type="info" value="50">Copying file <strong class="ms-1">2 of 4</strong></ngb-progressbar>\r
    <ngb-progressbar type="warning" value="75" striped="true" animated="true"><em>Almost there…</em></ngb-progressbar>\r
    <ngb-progressbar type="danger" value="100">Completed!</ngb-progressbar>\r
</div>\r
`,u=`import { Component } from "ngjs-core";\r
\r
@Component({\r
    selector: "docs-simple-progressbar",\r
    controllerAs: "example",\r
    templateUrl: "./simple-progressbar.component.html",\r
    styleUrl: "./simple-progressbar.component.css",\r
})\r
export class SimpleProgressbarComponent {}\r
`,d=`<div class="vstack gap-3">\r
    <ngb-progressbar type="success" value="25"></ngb-progressbar>\r
    <ngb-progressbar type="info" value="50"></ngb-progressbar>\r
    <ngb-progressbar type="warning" value="75"></ngb-progressbar>\r
    <ngb-progressbar type="danger" value="100"></ngb-progressbar>\r
    <ngb-progressbar type="primary" value="75"></ngb-progressbar>\r
    <ngb-progressbar type="secondary" value="50"></ngb-progressbar>\r
    <ngb-progressbar type="dark" value="25"></ngb-progressbar>\r
</div>\r
`,f=`import { Component } from "ngjs-core";\r
\r
@Component({\r
    selector: "docs-progress-bars-stacked",\r
    controllerAs: "example",\r
    templateUrl: "./progress-bars-stacked.component.html",\r
    styleUrl: "./progress-bars-stacked.component.css",\r
})\r
export class ProgressBarsStackedComponent {}\r
`,p=`<ngb-progressbar-stacked>\r
    <ngb-progressbar type="danger" value="20">20%</ngb-progressbar>\r
    <ngb-progressbar type="warning" value="35">35%</ngb-progressbar>\r
    <ngb-progressbar type="success" value="45">45%</ngb-progressbar>\r
</ngb-progressbar-stacked>\r
\r
<p class="small text-body-secondary mt-3 mb-0">The three segments share one Bootstrap stacked progress container.</p>\r
`,m=`import { Component } from "ngjs-core";\r
\r
@Component({\r
    selector: "docs-striped-progress-bar",\r
    controllerAs: "example",\r
    templateUrl: "./striped-progress-bar.component.html",\r
    styleUrl: "./striped-progress-bar.component.css",\r
})\r
export class StripedProgressBarComponent {}\r
`,h=`<div class="vstack gap-3">\r
    <ngb-progressbar type="success" value="25" striped="true"></ngb-progressbar>\r
    <ngb-progressbar type="info" value="50" striped="true"></ngb-progressbar>\r
    <ngb-progressbar type="warning" value="75" striped="true"></ngb-progressbar>\r
    <ngb-progressbar type="danger" value="100" striped="true"></ngb-progressbar>\r
    <ngb-progressbar type="primary" value="65" striped="true" animated="true">Animated</ngb-progressbar>\r
</div>\r
`,g=class{examples={simple:{html:d,typescript:u},contextual:{html:r,typescript:n},striped:{html:h,typescript:m},labels:{html:l,typescript:c},height:{html:s,typescript:o},stacked:{html:p,typescript:f},global:{html:a,typescript:i}}};g=t([e({selector:`docs-progressbar-examples-page`,controllerAs:`$`,templateUrl:`/ngb-js-docs/templates/progressbar-examples-page.component-bf265a3c.html`,styleUrl:`./progressbar-examples-page.component.css`})],g);export{g as ProgressbarExamplesPageComponent};