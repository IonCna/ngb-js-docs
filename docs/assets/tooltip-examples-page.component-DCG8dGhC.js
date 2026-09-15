import{r as e,t}from"./decorate-U3LoYfOr.js";var n=`<ng-template ng-ref="example.contentTemplate">\r
    <button type="button" class="btn btn-sm btn-light">Click inside</button>\r
</ng-template>\r
\r
<p>Every tooltip can also be closed with <kbd>Esc</kbd>.</p>\r
<div class="d-flex flex-wrap gap-2">\r
    <button type="button" class="btn btn-outline-secondary" triggers="click" auto-close="'inside'" ngb-tooltip="example.contentTemplate">Inside clicks</button>\r
    <button type="button" class="btn btn-outline-secondary" triggers="click" auto-close="'outside'" ngb-tooltip="example.contentTemplate">Outside clicks</button>\r
    <button type="button" class="btn btn-outline-secondary" triggers="click" auto-close="true" ngb-tooltip="example.contentTemplate">All clicks</button>\r
</div>\r
`,r=`import { Component, type TemplateRef } from "ngjs-core";\r
\r
@Component({\r
    selector: "docs-tooltip-autoclose",\r
    controllerAs: "example",\r
    templateUrl: "./tooltip-autoclose.component.html",\r
    styleUrl: "./tooltip-autoclose.component.css",\r
})\r
export class TooltipAutocloseComponent {\r
    public contentTemplate?: TemplateRef<unknown>;\r
}\r
`,i=`<div class="overflow-hidden border rounded p-4" style="max-width: 24rem">\r
    <p class="small text-body-secondary">This container clips overflowing descendants.</p>\r
    <div class="d-flex flex-wrap gap-2">\r
        <button type="button" class="btn btn-outline-secondary" placement="top" ngb-tooltip="'Inserted next to the trigger.'">Default</button>\r
        <button type="button" class="btn btn-outline-primary" placement="top" ngb-tooltip="'Appended directly to document.body.'" container="body">Append to body</button>\r
    </div>\r
</div>\r
`,a=`import { Component } from "ngjs-core";\r
\r
@Component({\r
    selector: "docs-tooltip-body",\r
    controllerAs: "example",\r
    templateUrl: "./tooltip-body.component.html",\r
    styleUrl: "./tooltip-body.component.css",\r
})\r
export class TooltipBodyComponent {}\r
`,o=`<ng-template ng-ref="example.contentTemplate" let-greeting="greeting">{{ greeting }}, <strong>{{ example.name }}</strong>!</ng-template>\r
\r
<p>Pass a different context each time a tooltip is opened manually.</p>\r
<div class="d-flex flex-wrap gap-2 mb-4">\r
    <button type="button" class="btn btn-outline-secondary" ngb-tooltip="example.contentTemplate" triggers="manual" ng-ref="example.french" ng-ref-read="ngbTooltip" ng-click="example.toggleWithGreeting(example.french, 'Bonjour')">French</button>\r
    <button type="button" class="btn btn-outline-secondary" ngb-tooltip="example.contentTemplate" triggers="manual" ng-ref="example.german" ng-ref-read="ngbTooltip" ng-click="example.toggleWithGreeting(example.german, 'Guten Tag')">German</button>\r
    <button type="button" class="btn btn-outline-secondary" ngb-tooltip="example.contentTemplate" triggers="manual" ng-ref="example.english" ng-ref-read="ngbTooltip" ng-click="example.toggleWithGreeting(example.english, 'Hello')">English</button>\r
</div>\r
\r
<p>Alternatively, provide a default context through <code>tooltip-context</code>.</p>\r
<button type="button" class="btn btn-outline-secondary" ngb-tooltip="example.contentTemplate" tooltip-context="{ greeting: 'Hola' }">Spanish</button>\r
`,s=`import { Component, type TemplateRef } from "ngjs-core";\r
import type { NgbTooltip } from "ngb-js/tooltip";\r
\r
@Component({\r
    selector: "docs-tooltip-context",\r
    controllerAs: "example",\r
    templateUrl: "./tooltip-context.component.html",\r
    styleUrl: "./tooltip-context.component.css",\r
})\r
export class TooltipContextComponent {\r
    public name = "World";\r
    public contentTemplate?: TemplateRef<unknown>;\r
    public french?: NgbTooltip;\r
    public german?: NgbTooltip;\r
    public english?: NgbTooltip;\r
\r
    public toggleWithGreeting(tooltip: NgbTooltip, greeting: string): void {\r
        tooltip.isOpen() ? tooltip.close() : tooltip.open({ greeting });\r
    }\r
}\r
`,c=`.tooltip-custom { --bs-tooltip-bg: var(--bs-primary-bg-subtle); --bs-tooltip-color: var(--bs-primary-text-emphasis); --bs-tooltip-opacity: 1; filter: drop-shadow(0 .35rem .8rem rgba(var(--bs-body-color-rgb), .18)); }
`,l=`<button type="button" class="btn btn-outline-primary" ngb-tooltip="'A custom skin layered on top of Bootstrap tooltip variables.'" tooltip-class="tooltip-custom">
    Tooltip with custom class\r
</button>\r
`,u=`import { Component } from "ngjs-core";\r
\r
@Component({\r
    selector: "docs-tooltip-custom-class",\r
    controllerAs: "example",\r
    templateUrl: "./tooltip-custom-class.component.html",\r
    styleUrl: "./tooltip-custom-class.component.css",\r
})\r
export class TooltipCustomClassComponent {}\r
`,d=`<div class="d-flex flex-wrap align-items-baseline gap-2">\r
    <span>You can hover</span>\r
    <button type="button" class="btn btn-outline-secondary" ngb-tooltip="'The button triggered me, but the text positioned me.'" position-target="#tooltip-position-target">this button</button>\r
    <span>while the tooltip appears over <strong id="tooltip-position-target" class="text-primary">this target</strong>.</span>\r
</div>\r
`,f=`import { Component } from "ngjs-core";\r
\r
@Component({\r
    selector: "docs-tooltip-custom-target",\r
    controllerAs: "example",\r
    templateUrl: "./tooltip-custom-target.component.html",\r
    styleUrl: "./tooltip-custom-target.component.css",\r
})\r
export class TooltipCustomTargetComponent {}\r
`,p=`<p>Move the pointer into the tooltip before its close delay expires to keep it open.</p>\r
<div class="d-flex flex-wrap gap-2">\r
    <button type="button" class="btn btn-outline-secondary" ngb-tooltip="'Opens after 300 ms and closes after 500 ms.'" triggers="mouseenter:mouseleave" open-delay="300" close-delay="500">300 / 500 ms</button>\r
    <button type="button" class="btn btn-outline-secondary" ngb-tooltip="'Opens after one second and closes after two.'" triggers="mouseenter:mouseleave" open-delay="1000" close-delay="2000">1 / 2 seconds</button>\r
</div>\r
`,m=`import { Component } from "ngjs-core";\r
\r
@Component({\r
    selector: "docs-tooltip-delays",\r
    controllerAs: "example",\r
    templateUrl: "./tooltip-delays.component.html",\r
    styleUrl: "./tooltip-delays.component.css",\r
})\r
export class TooltipDelaysComponent {}\r
`,h=`<div class="alert alert-light border d-flex gap-3 align-items-start" role="note">\r
    <i class="bi bi-gear text-primary mt-1" aria-hidden="true"></i>\r
    <div>\r
        <p class="fw-semibold mb-1">Global defaults used by this example</p>\r
        <p class="small text-body-secondary mb-0">Hover trigger, end placement, body container and a 300 ms opening delay.</p>\r
    </div>\r
</div>\r
\r
<button type="button" class="btn btn-outline-primary" ngb-tooltip="'This instance reads every option from NgbTooltipConfig.'">Hover over me</button>\r
`,g=`import { Component, Inject, type AfterViewInit, type OnDestroy } from "ngjs-core";\r
import { NgbTooltipConfig, NGB_TOOLTIP_CONFIG } from "ngb-js/tooltip";\r
\r
@Component({\r
    selector: "docs-tooltip-global",\r
    controllerAs: "example",\r
    templateUrl: "./tooltip-global.component.html",\r
    styleUrl: "./tooltip-global.component.css",\r
})\r
export class TooltipGlobalComponent implements AfterViewInit, OnDestroy {\r
    private readonly initialConfig: Pick<NgbTooltipConfig, "container" | "openDelay" | "placement" | "triggers">;\r
\r
    constructor(@Inject(NGB_TOOLTIP_CONFIG) private readonly config: NgbTooltipConfig) {\r
        this.initialConfig = {\r
            container: config.container,\r
            openDelay: config.openDelay,\r
            placement: config.placement,\r
            triggers: config.triggers,\r
        };\r
        config.container = "body";\r
        config.openDelay = 300;\r
        config.placement = "end";\r
        config.triggers = "mouseenter:mouseleave";\r
    }\r
\r
    public ngAfterViewInit(): void { this.restoreConfig(); }\r
    public ngOnDestroy(): void { this.restoreConfig(); }\r
\r
    private restoreConfig(): void {\r
        this.config.container = this.initialConfig.container;\r
        this.config.openDelay = this.initialConfig.openDelay;\r
        this.config.placement = this.initialConfig.placement;\r
        this.config.triggers = this.initialConfig.triggers;\r
    }\r
}\r
`,_=`<div class="d-flex flex-wrap gap-2">\r
    <button type="button" class="btn btn-outline-secondary" placement="top" ngb-tooltip="'Tooltip on top'">Top</button>\r
    <button type="button" class="btn btn-outline-secondary" placement="end" ngb-tooltip="'Tooltip on right'">Right</button>\r
    <button type="button" class="btn btn-outline-secondary" placement="bottom" ngb-tooltip="'Tooltip on bottom'">Bottom</button>\r
    <button type="button" class="btn btn-outline-secondary" placement="start" ngb-tooltip="'Tooltip on left'">Left</button>\r
</div>\r
`,v=`import { Component } from "ngjs-core";\r
\r
@Component({\r
    selector: "docs-tooltip-placements",\r
    controllerAs: "example",\r
    templateUrl: "./tooltip-placements.component.html",\r
    styleUrl: "./tooltip-placements.component.css",\r
})\r
export class TooltipPlacementsComponent {}\r
`,y=`<ng-template ng-ref="example.contentTemplate">\r
    <span>Hello, <strong>{{ example.name }}</strong>!</span>\r
</ng-template>\r
\r
<div class="d-flex flex-wrap align-items-center gap-2">\r
    <button type="button" class="btn btn-outline-primary" ngb-tooltip="example.contentTemplate">HTML and bindings</button>\r
    <button type="button" class="btn btn-sm btn-outline-secondary" ng-click="example.name = example.name === 'NgbJS' ? 'AngularJS' : 'NgbJS'">Change binding</button>\r
</div>\r
`,b=`import { Component, type TemplateRef } from "ngjs-core";\r
\r
@Component({\r
    selector: "docs-tooltip-template",\r
    controllerAs: "example",\r
    templateUrl: "./tooltip-template.component.html",\r
    styleUrl: "./tooltip-template.component.css",\r
})\r
export class TooltipTemplateComponent {\r
    public name = "NgbJS";\r
    public contentTemplate?: TemplateRef<unknown>;\r
}\r
`,x=`<p class="mb-3">Custom events can be paired as <code>mouseenter:mouseleave</code>.</p>\r
<button type="button" class="btn btn-outline-secondary mb-4" ngb-tooltip="'Shown while the pointer is over the trigger'" triggers="mouseenter:mouseleave">Hover over me</button>\r
\r
<p class="mb-3">Manual triggers delegate opening and closing to application code.</p>\r
<div class="d-flex flex-wrap gap-2">\r
    <button type="button" class="btn btn-outline-primary" ngb-tooltip="'Manually controlled tooltip'" triggers="manual" auto-close="false" ng-ref="example.manual" ng-ref-read="ngbTooltip" ng-click="example.manual.open()">Open tooltip</button>\r
    <button type="button" class="btn btn-outline-primary" ng-click="example.manual.close()">Close tooltip</button>\r
    <button type="button" class="btn btn-outline-primary" ng-click="example.manual.toggle()">Toggle tooltip</button>\r
</div>\r
`,S=`import { Component } from "ngjs-core";\r
import type { NgbTooltip } from "ngb-js/tooltip";\r
\r
@Component({\r
    selector: "docs-tooltip-triggers",\r
    controllerAs: "example",\r
    templateUrl: "./tooltip-triggers.component.html",\r
    styleUrl: "./tooltip-triggers.component.css",\r
})\r
export class TooltipTriggersComponent {\r
    public manual?: NgbTooltip;\r
}\r
`,C=class{examples={placements:{html:_,typescript:v},template:{html:y,typescript:b},triggers:{html:x,typescript:S},autoclose:{html:n,typescript:r},context:{html:o,typescript:s},customTarget:{html:d,typescript:f},delays:{html:p,typescript:m},body:{html:i,typescript:a},customClass:{html:l,typescript:u,css:c},global:{html:h,typescript:g}}};C=t([e({selector:`docs-tooltip-examples-page`,controllerAs:`$`,templateUrl:`/ngb-js-docs/templates/tooltip-examples-page.component-9909fde0.html`,styleUrl:`./tooltip-examples-page.component.css`})],C);export{C as TooltipExamplesPageComponent};