import{r as e,t}from"./decorate-DwQZkZoC.js";var n=`import { Component } from "ngjs-core";
import type { NgbPopover } from "ngb-js/popover";

@Component({
    selector: "docs-popover-autoclose",
    controllerAs: "example",
    templateUrl: "./popover-autoclose.component.html",
    styleUrl: "./popover-autoclose.component.css",
})
export class PopoverAutocloseComponent {
    public popover?: NgbPopover;
}
`,r=`<p>Every popover also closes with <kbd>Esc</kbd>.</p>
<div class="vstack gap-3 align-items-start">
    <button type="button" class="btn btn-outline-secondary" auto-close="'inside'" ngb-popover="'Click this content or press Escape'" popover-title="'Inside clicks'">Close on inside click</button>
    <button type="button" class="btn btn-outline-secondary" auto-close="'outside'" ngb-popover="'Click elsewhere or press Escape'" popover-title="'Outside clicks'">Close on outside click</button>
    <div class="d-flex flex-wrap gap-2">
        <button type="button" class="btn btn-outline-secondary" auto-close="true" ngb-popover="'Click anywhere or press Escape'" popover-title="'All clicks'" ng-ref="example.popover" ng-ref-read="ngbPopover">Close on every click</button>
        <button type="button" class="btn btn-outline-secondary" ng-click="example.popover.toggle()">External toggle</button>
    </div>
</div>
`,i=`import { Component } from "ngjs-core";

@Component({
    selector: "docs-popover-body",
    controllerAs: "example",
    templateUrl: "./popover-body.component.html",
    styleUrl: "./popover-body.component.css",
})
export class PopoverBodyComponent {}
`,a=`<div class="overflow-hidden border rounded p-4" style="max-width: 24rem">
    <p class="small text-body-secondary">This container clips overflowing descendants.</p>
    <div class="d-flex flex-wrap gap-2">
        <button type="button" class="btn btn-outline-secondary" placement="'top'" ngb-popover="'Inserted next to the trigger.'">Default</button>
        <button type="button" class="btn btn-outline-primary" placement="'top'" ngb-popover="'Appended directly to document.body.'" container="'body'">Append to body</button>
    </div>
</div>
`,o=`import { Component } from "ngjs-core";
import type { NgbPopover } from "ngb-js/popover";
import type { TemplateRef } from "ngjs-core";

@Component({
    selector: "docs-popover-context",
    controllerAs: "example",
    templateUrl: "./popover-context.component.html",
    styleUrl: "./popover-context.component.css",
})
export class PopoverContextComponent {
    public name = "World";
    public contentTemplate?: TemplateRef<unknown>;
    public titleTemplate?: TemplateRef<unknown>;
    public french?: NgbPopover;
    public german?: NgbPopover;
    public english?: NgbPopover;

    public toggleWithGreeting(popover: NgbPopover, greeting: string, language: string) {
        popover.isOpen() ? popover.close() : popover.open({ greeting, language });
    }
}
`,s=`<ng-template ng-ref="example.contentTemplate" let-greeting="greeting">{{ greeting }}, <strong>{{ example.name }}</strong>!</ng-template>
<ng-template ng-ref="example.titleTemplate" let-language="language">Greeting in {{ language }}</ng-template>

<p>You can pass context when manually opening a popover.</p>
<div class="d-flex flex-wrap gap-2 mb-4">
    <button type="button" class="btn btn-outline-secondary" ngb-popover="example.contentTemplate" popover-title="example.titleTemplate" triggers="'manual'" ng-ref="example.french" ng-ref-read="ngbPopover" ng-click="example.toggleWithGreeting(example.french, 'Bonjour', 'French')">French</button>
    <button type="button" class="btn btn-outline-secondary" ngb-popover="example.contentTemplate" popover-title="example.titleTemplate" triggers="'manual'" ng-ref="example.german" ng-ref-read="ngbPopover" ng-click="example.toggleWithGreeting(example.german, 'Guten Tag', 'German')">German</button>
    <button type="button" class="btn btn-outline-secondary" ngb-popover="example.contentTemplate" popover-title="example.titleTemplate" triggers="'manual'" ng-ref="example.english" ng-ref-read="ngbPopover" ng-click="example.toggleWithGreeting(example.english, 'Hello', 'English')">English</button>
</div>

<p>Alternatively, provide a default context through <code>popover-context</code>.</p>
<button type="button" class="btn btn-outline-secondary" ngb-popover="example.contentTemplate" popover-title="example.titleTemplate" popover-context="{ language: '中文', greeting: '你好' }">Chinese</button>
`,c=`.popover-custom { --bs-popover-border-color: var(--bs-primary-border-subtle); --bs-popover-header-bg: var(--bs-primary-bg-subtle); --bs-popover-header-color: var(--bs-primary-text-emphasis); box-shadow: 0 .75rem 2rem rgba(var(--bs-body-color-rgb), .12); }\r
`,l=`import { Component } from "ngjs-core";

@Component({
    selector: "docs-popover-custom-class",
    controllerAs: "example",
    templateUrl: "./popover-custom-class.component.html",
    styleUrl: "./popover-custom-class.component.css",
})
export class PopoverCustomClassComponent {}
`,u=`<button type="button" class="btn btn-outline-primary" ngb-popover="'A small custom skin layered on top of Bootstrap variables.'" popover-title="'NgbJS popover'" popover-class="popover-custom">\r
    Popover with custom class\r
</button>\r
`,d=`import { Component } from "ngjs-core";

@Component({
    selector: "docs-popover-custom-target",
    controllerAs: "example",
    templateUrl: "./popover-custom-target.component.html",
    styleUrl: "./popover-custom-target.component.css",
})
export class PopoverCustomTargetComponent {}
`,f=`<div class="d-flex flex-wrap align-items-baseline gap-2">
    <span>You can click</span>
    <button class="btn btn-outline-secondary" type="button" ngb-popover="'The button triggered me, but this text positioned me.'" popover-title="'Custom target'" position-target="'#popover-position-target'">this button</button>
    <span>but the popover appears over <strong id="popover-position-target" class="text-primary">this target</strong>.</span>
</div>
`,p=`import { Component } from "ngjs-core";

@Component({
    selector: "docs-popover-delays",
    controllerAs: "example",
    templateUrl: "./popover-delays.component.html",
    styleUrl: "./popover-delays.component.css",
})
export class PopoverDelaysComponent {}
`,m=`<p>Move the pointer into the popover before its close delay expires to keep it open.</p>
<div class="d-flex flex-wrap gap-2">
    <button type="button" class="btn btn-outline-secondary" ngb-popover="'Opens after 300 ms and closes after 500 ms.'" triggers="'mouseenter:mouseleave'" open-delay="300" close-delay="500">300 / 500 ms</button>
    <button type="button" class="btn btn-outline-secondary" ngb-popover="'Opens after one second and closes after two.'" triggers="'mouseenter:mouseleave'" open-delay="1000" close-delay="2000">1 / 2 seconds</button>
</div>
`,h=`import { Component } from "ngjs-core";
import type { NgbPopover } from "ngb-js/popover";

@Component({
    selector: "docs-popover-events",
    controllerAs: "example",
    templateUrl: "./popover-events.component.html",
    styleUrl: "./popover-events.component.css",
})
export class PopoverEventsComponent {
    public popover?: NgbPopover;
    public events: { name: string; time: Date }[] = [];
    public record(name: string) { this.events.unshift({ name, time: new Date() }); }
}
`,g=`<button type="button" class="btn btn-outline-primary" placement="'top'" ngb-popover="'Watch the event log below.'" popover-title="'Visibility events'" shown="example.record('shown')" hidden="example.record('hidden')" ng-ref="example.popover" ng-ref-read="ngbPopover">
    Toggle popover
</button>

<div class="mt-4">
    <p class="mb-2">Current state: <code>{{ example.popover.isOpen() ? 'open' : 'closed' }}</code></p>
    <ul class="list-group list-group-flush" ng-if="example.events.length">
        <li class="list-group-item px-0 py-2" ng-repeat="event in example.events track by $index"><code>{{ event.name }}</code> at {{ event.time | date:'mediumTime' }}</li>
    </ul>
    <p class="text-body-secondary mb-0" ng-if="!example.events.length">No events recorded yet.</p>
</div>
`,_=`import { Component, Inject, type AfterViewInit, type OnDestroy } from "ngjs-core";
import { NgbPopoverConfig, NGB_POPOVER_CONFIG } from "ngb-js/popover";

@Component({
    selector: "docs-popover-global",
    controllerAs: "example",
    templateUrl: "./popover-global.component.html",
    styleUrl: "./popover-global.component.css",
})
export class PopoverGlobalComponent implements AfterViewInit, OnDestroy {
    private readonly initialConfig: Pick<NgbPopoverConfig, "container" | "openDelay" | "placement" | "triggers">;

    constructor(@Inject(NGB_POPOVER_CONFIG) private readonly config: NgbPopoverConfig) {
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

    public ngAfterViewInit() { this.restoreConfig(); }
    public ngOnDestroy() { this.restoreConfig(); }
    private restoreConfig() {
        this.config.container = this.initialConfig.container;
        this.config.openDelay = this.initialConfig.openDelay;
        this.config.placement = this.initialConfig.placement;
        this.config.triggers = this.initialConfig.triggers;
    }
}
`,v=`<div class="alert alert-light border d-flex gap-3 align-items-start" role="note">
    <i class="bi bi-gear text-primary mt-1" aria-hidden="true"></i>
    <div><p class="fw-semibold mb-1">Global defaults used by this example</p><p class="small text-body-secondary mb-0">Hover trigger, end placement, body container and a 300 ms opening delay.</p></div>
</div>
<button type="button" class="btn btn-outline-primary" ngb-popover="'This instance reads every option from NgbPopoverConfig.'" popover-title="'Configured globally'">Hover over me</button>
`,y=`import { Component } from "ngjs-core";
import type { NgbPopover } from "ngb-js/popover";

@Component({
    selector: "docs-popover-manual-control",
    controllerAs: "example",
    templateUrl: "./popover-manual-control.component.html",
    styleUrl: "./popover-manual-control.component.css",
})
export class PopoverManualControlComponent {
    public popover?: NgbPopover;
}
`,b=`<button type="button" class="btn btn-primary mb-3" ngb-popover="'This target is controlled by the buttons below'" popover-title="'External controls'" triggers="'manual'" auto-close="false" ng-ref="example.popover" ng-ref-read="ngbPopover">
    Popover target
</button>
<div class="d-flex flex-wrap gap-2">
    <button type="button" class="btn btn-sm btn-outline-primary" ng-click="example.popover.open()">Open</button>
    <button type="button" class="btn btn-sm btn-outline-primary" ng-click="example.popover.close()">Close</button>
    <button type="button" class="btn btn-sm btn-outline-primary" ng-click="example.popover.toggle()">Toggle</button>
</div>
`,x=`import { Component } from "ngjs-core";

@Component({
    selector: "docs-popover-placements",
    controllerAs: "example",
    templateUrl: "./popover-placements.component.html",
    styleUrl: "./popover-placements.component.css",
})
export class PopoverPlacementsComponent {}
`,S=`<div class="d-flex flex-wrap gap-2">
    <button type="button" class="btn btn-outline-secondary" placement="'top'" ngb-popover="'Popover content'" popover-title="'Popover on top'">Top</button>
    <button type="button" class="btn btn-outline-secondary" placement="'end'" ngb-popover="'Popover content'" popover-title="'Popover on right'">Right</button>
    <button type="button" class="btn btn-outline-secondary" placement="'bottom'" ngb-popover="'Popover content'" popover-title="'Popover on bottom'">Bottom</button>
    <button type="button" class="btn btn-outline-secondary" placement="'start'" ngb-popover="'Popover content'" popover-title="'Popover on left'">Left</button>
</div>
`,C=`import { Component } from "ngjs-core";
import type { TemplateRef } from "ngjs-core";

@Component({
    selector: "docs-popover-template",
    controllerAs: "example",
    templateUrl: "./popover-template.component.html",
    styleUrl: "./popover-template.component.css",
})
export class PopoverTemplateComponent {
    public name = "NgbJS";
    public contentTemplate?: TemplateRef<unknown>;
    public titleTemplate?: TemplateRef<unknown>;
}
`,w=`<ng-template ng-ref="example.titleTemplate">
    <span class="d-flex align-items-center gap-2"><i class="bi bi-code-slash" aria-hidden="true"></i><strong>Template content</strong></span>
</ng-template>
<ng-template ng-ref="example.contentTemplate">
    <p class="mb-2">Hello, <strong>{{ example.name }}</strong>!</p>
    <button class="btn btn-sm btn-primary" type="button" ng-click="example.name = 'AngularJS'">Update binding</button>
</ng-template>

<button type="button" class="btn btn-outline-primary" ngb-popover="example.contentTemplate" popover-title="example.titleTemplate">
    HTML and bindings
</button>
`,T=`import { Component } from "ngjs-core";
import type { NgbPopover } from "ngb-js/popover";

@Component({
    selector: "docs-popover-triggers",
    controllerAs: "example",
    templateUrl: "./popover-triggers.component.html",
    styleUrl: "./popover-triggers.component.css",
})
export class PopoverTriggersComponent {
    public manual?: NgbPopover;
}
`,E=`<p class="mb-3">Custom events can be paired as <code>mouseenter:mouseleave</code>.</p>
<button type="button" class="btn btn-outline-secondary mb-4" ngb-popover="'Shown while the pointer is over the trigger'" popover-title="'Hover trigger'" triggers="'mouseenter:mouseleave'">
    Hover over me
</button>

<p class="mb-3">A manual trigger delegates opening and closing to application code.</p>
<div class="d-flex flex-wrap gap-2">
    <button type="button" class="btn btn-outline-primary" ngb-popover="'Manually controlled content'" popover-title="'Manual popover'" triggers="'manual'" auto-close="false" ng-ref="example.manual" ng-ref-read="ngbPopover" ng-click="example.manual.open()">
        Open popover
    </button>
    <button type="button" class="btn btn-outline-primary" ng-click="example.manual.close()">Close popover</button>
</div>
`,D=class{examples={placements:{html:S,typescript:x},template:{html:w,typescript:C},triggers:{html:E,typescript:T},manual:{html:b,typescript:y},autoclose:{html:r,typescript:n},context:{html:s,typescript:o},customTarget:{html:f,typescript:d},delays:{html:m,typescript:p},events:{html:g,typescript:h},body:{html:a,typescript:i},customClass:{html:u,typescript:l,css:c},global:{html:v,typescript:_}}};D=t([e({selector:`docs-popover-examples-page`,controllerAs:`$`,templateUrl:`/ngb-js-docs/templates/popover-examples-page.component-cbe74148.html`,styleUrl:`./popover-examples-page.component.css`})],D);export{D as PopoverExamplesPageComponent};