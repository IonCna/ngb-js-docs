import{d as e,f as t}from"./index-PqXhwIf1.js";var n=`<ng-template ng-ref="example.contentTemplate">
    <button type="button" class="btn btn-sm btn-light">Click inside</button>
</ng-template>

<p>Every tooltip can also be closed with <kbd>Esc</kbd>.</p>
<div class="d-flex flex-wrap gap-2">
    <button type="button" class="btn btn-outline-secondary" triggers="click" auto-close="'inside'" ngb-tooltip="example.contentTemplate">Inside clicks</button>
    <button type="button" class="btn btn-outline-secondary" triggers="click" auto-close="'outside'" ngb-tooltip="example.contentTemplate">Outside clicks</button>
    <button type="button" class="btn btn-outline-secondary" triggers="click" auto-close="true" ngb-tooltip="example.contentTemplate">All clicks</button>
</div>
`,r=`import { Component, type TemplateRef } from "ngjs-core";

@Component({
    selector: "docs-tooltip-autoclose",
    controllerAs: "example",
    templateUrl: "./tooltip-autoclose.component.html",
    styleUrl: "./tooltip-autoclose.component.css",
})
export class TooltipAutocloseComponent {
    public contentTemplate?: TemplateRef<unknown>;
}
`,i=`<div class="overflow-hidden border rounded p-4" style="max-width: 24rem">
    <p class="small text-body-secondary">This container clips overflowing descendants.</p>
    <div class="d-flex flex-wrap gap-2">
        <button type="button" class="btn btn-outline-secondary" placement="top" ngb-tooltip="'Inserted next to the trigger.'">Default</button>
        <button type="button" class="btn btn-outline-primary" placement="top" ngb-tooltip="'Appended directly to document.body.'" container="body">Append to body</button>
    </div>
</div>
`,a=`import { Component } from "ngjs-core";

@Component({
    selector: "docs-tooltip-body",
    controllerAs: "example",
    templateUrl: "./tooltip-body.component.html",
    styleUrl: "./tooltip-body.component.css",
})
export class TooltipBodyComponent {}
`,o=`<ng-template ng-ref="example.contentTemplate" let-greeting="greeting">{{ greeting }}, <strong>{{ example.name }}</strong>!</ng-template>

<p>Pass a different context each time a tooltip is opened manually.</p>
<div class="d-flex flex-wrap gap-2 mb-4">
    <button type="button" class="btn btn-outline-secondary" ngb-tooltip="example.contentTemplate" triggers="manual" ng-ref="example.french" ng-ref-read="ngbTooltip" ng-click="example.toggleWithGreeting(example.french, 'Bonjour')">French</button>
    <button type="button" class="btn btn-outline-secondary" ngb-tooltip="example.contentTemplate" triggers="manual" ng-ref="example.german" ng-ref-read="ngbTooltip" ng-click="example.toggleWithGreeting(example.german, 'Guten Tag')">German</button>
    <button type="button" class="btn btn-outline-secondary" ngb-tooltip="example.contentTemplate" triggers="manual" ng-ref="example.english" ng-ref-read="ngbTooltip" ng-click="example.toggleWithGreeting(example.english, 'Hello')">English</button>
</div>

<p>Alternatively, provide a default context through <code>tooltip-context</code>.</p>
<button type="button" class="btn btn-outline-secondary" ngb-tooltip="example.contentTemplate" tooltip-context="{ greeting: 'Hola' }">Spanish</button>
`,s=`import { Component, type TemplateRef } from "ngjs-core";
import type { NgbTooltip } from "ngb-js/tooltip";

@Component({
    selector: "docs-tooltip-context",
    controllerAs: "example",
    templateUrl: "./tooltip-context.component.html",
    styleUrl: "./tooltip-context.component.css",
})
export class TooltipContextComponent {
    public name = "World";
    public contentTemplate?: TemplateRef<unknown>;
    public french?: NgbTooltip;
    public german?: NgbTooltip;
    public english?: NgbTooltip;

    public toggleWithGreeting(tooltip: NgbTooltip, greeting: string): void {
        tooltip.isOpen() ? tooltip.close() : tooltip.open({ greeting });
    }
}
`,c=`.tooltip-custom { --bs-tooltip-bg: var(--bs-primary-bg-subtle); --bs-tooltip-color: var(--bs-primary-text-emphasis); --bs-tooltip-opacity: 1; filter: drop-shadow(0 .35rem .8rem rgba(var(--bs-body-color-rgb), .18)); }\r
`,l=`<button type="button" class="btn btn-outline-primary" ngb-tooltip="'A custom skin layered on top of Bootstrap tooltip variables.'" tooltip-class="tooltip-custom">\r
    Tooltip with custom class\r
</button>\r
`,u=`import { Component } from "ngjs-core";

@Component({
    selector: "docs-tooltip-custom-class",
    controllerAs: "example",
    templateUrl: "./tooltip-custom-class.component.html",
    styleUrl: "./tooltip-custom-class.component.css",
})
export class TooltipCustomClassComponent {}
`,d=`<div class="d-flex flex-wrap align-items-baseline gap-2">
    <span>You can hover</span>
    <button type="button" class="btn btn-outline-secondary" ngb-tooltip="'The button triggered me, but the text positioned me.'" position-target="#tooltip-position-target">this button</button>
    <span>while the tooltip appears over <strong id="tooltip-position-target" class="text-primary">this target</strong>.</span>
</div>
`,f=`import { Component } from "ngjs-core";

@Component({
    selector: "docs-tooltip-custom-target",
    controllerAs: "example",
    templateUrl: "./tooltip-custom-target.component.html",
    styleUrl: "./tooltip-custom-target.component.css",
})
export class TooltipCustomTargetComponent {}
`,p=`<p>Move the pointer into the tooltip before its close delay expires to keep it open.</p>
<div class="d-flex flex-wrap gap-2">
    <button type="button" class="btn btn-outline-secondary" ngb-tooltip="'Opens after 300 ms and closes after 500 ms.'" triggers="mouseenter:mouseleave" open-delay="300" close-delay="500">300 / 500 ms</button>
    <button type="button" class="btn btn-outline-secondary" ngb-tooltip="'Opens after one second and closes after two.'" triggers="mouseenter:mouseleave" open-delay="1000" close-delay="2000">1 / 2 seconds</button>
</div>
`,m=`import { Component } from "ngjs-core";

@Component({
    selector: "docs-tooltip-delays",
    controllerAs: "example",
    templateUrl: "./tooltip-delays.component.html",
    styleUrl: "./tooltip-delays.component.css",
})
export class TooltipDelaysComponent {}
`,h=`<div class="alert alert-light border d-flex gap-3 align-items-start" role="note">
    <i class="bi bi-gear text-primary mt-1" aria-hidden="true"></i>
    <div>
        <p class="fw-semibold mb-1">Global defaults used by this example</p>
        <p class="small text-body-secondary mb-0">Hover trigger, end placement, body container and a 300 ms opening delay.</p>
    </div>
</div>

<button type="button" class="btn btn-outline-primary" ngb-tooltip="'This instance reads every option from NgbTooltipConfig.'">Hover over me</button>
`,g=`import { Component, Inject, type AfterViewInit, type OnDestroy } from "ngjs-core";
import { NgbTooltipConfig, NGB_TOOLTIP_CONFIG } from "ngb-js/tooltip";

@Component({
    selector: "docs-tooltip-global",
    controllerAs: "example",
    templateUrl: "./tooltip-global.component.html",
    styleUrl: "./tooltip-global.component.css",
})
export class TooltipGlobalComponent implements AfterViewInit, OnDestroy {
    private readonly initialConfig: Pick<NgbTooltipConfig, "container" | "openDelay" | "placement" | "triggers">;

    constructor(@Inject(NGB_TOOLTIP_CONFIG) private readonly config: NgbTooltipConfig) {
        this.initialConfig = {
            container: config.container,
            openDelay: config.openDelay,
            placement: config.placement,
            triggers: config.triggers,
        };
        config.container = "body";
        config.openDelay = 300;
        config.placement = "end";
        config.triggers = "mouseenter:mouseleave";
    }

    public ngAfterViewInit(): void { this.restoreConfig(); }
    public ngOnDestroy(): void { this.restoreConfig(); }

    private restoreConfig(): void {
        this.config.container = this.initialConfig.container;
        this.config.openDelay = this.initialConfig.openDelay;
        this.config.placement = this.initialConfig.placement;
        this.config.triggers = this.initialConfig.triggers;
    }
}
`,_=`<div class="d-flex flex-wrap gap-2">
    <button type="button" class="btn btn-outline-secondary" placement="top" ngb-tooltip="'Tooltip on top'">Top</button>
    <button type="button" class="btn btn-outline-secondary" placement="end" ngb-tooltip="'Tooltip on right'">Right</button>
    <button type="button" class="btn btn-outline-secondary" placement="bottom" ngb-tooltip="'Tooltip on bottom'">Bottom</button>
    <button type="button" class="btn btn-outline-secondary" placement="start" ngb-tooltip="'Tooltip on left'">Left</button>
</div>
`,v=`import { Component } from "ngjs-core";

@Component({
    selector: "docs-tooltip-placements",
    controllerAs: "example",
    templateUrl: "./tooltip-placements.component.html",
    styleUrl: "./tooltip-placements.component.css",
})
export class TooltipPlacementsComponent {}
`,y=`<ng-template ng-ref="example.contentTemplate">
    <span>Hello, <strong>{{ example.name }}</strong>!</span>
</ng-template>

<div class="d-flex flex-wrap align-items-center gap-2">
    <button type="button" class="btn btn-outline-primary" ngb-tooltip="example.contentTemplate">HTML and bindings</button>
    <button type="button" class="btn btn-sm btn-outline-secondary" ng-click="example.name = example.name === 'NgbJS' ? 'AngularJS' : 'NgbJS'">Change binding</button>
</div>
`,b=`import { Component, type TemplateRef } from "ngjs-core";

@Component({
    selector: "docs-tooltip-template",
    controllerAs: "example",
    templateUrl: "./tooltip-template.component.html",
    styleUrl: "./tooltip-template.component.css",
})
export class TooltipTemplateComponent {
    public name = "NgbJS";
    public contentTemplate?: TemplateRef<unknown>;
}
`,x=`<p class="mb-3">Custom events can be paired as <code>mouseenter:mouseleave</code>.</p>
<button type="button" class="btn btn-outline-secondary mb-4" ngb-tooltip="'Shown while the pointer is over the trigger'" triggers="mouseenter:mouseleave">Hover over me</button>

<p class="mb-3">Manual triggers delegate opening and closing to application code.</p>
<div class="d-flex flex-wrap gap-2">
    <button type="button" class="btn btn-outline-primary" ngb-tooltip="'Manually controlled tooltip'" triggers="manual" auto-close="false" ng-ref="example.manual" ng-ref-read="ngbTooltip" ng-click="example.manual.open()">Open tooltip</button>
    <button type="button" class="btn btn-outline-primary" ng-click="example.manual.close()">Close tooltip</button>
    <button type="button" class="btn btn-outline-primary" ng-click="example.manual.toggle()">Toggle tooltip</button>
</div>
`,S=`import { Component } from "ngjs-core";
import type { NgbTooltip } from "ngb-js/tooltip";

@Component({
    selector: "docs-tooltip-triggers",
    controllerAs: "example",
    templateUrl: "./tooltip-triggers.component.html",
    styleUrl: "./tooltip-triggers.component.css",
})
export class TooltipTriggersComponent {
    public manual?: NgbTooltip;
}
`,C=class{examples={placements:{html:_,typescript:v},template:{html:y,typescript:b},triggers:{html:x,typescript:S},autoclose:{html:n,typescript:r},context:{html:o,typescript:s},customTarget:{html:d,typescript:f},delays:{html:p,typescript:m},body:{html:i,typescript:a},customClass:{html:l,typescript:u,css:c},global:{html:h,typescript:g}}};C=e([t({selector:`docs-tooltip-examples-page`,controllerAs:`$`,templateUrl:`/ngb-js-docs/templates/tooltip-examples-page.component-09afea44.html`,styleUrl:`./tooltip-examples-page.component.css`})],C);export{C as TooltipExamplesPageComponent};