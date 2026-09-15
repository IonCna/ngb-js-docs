import{r as e,t}from"./decorate-U3LoYfOr.js";var n=`import { Component } from "ngjs-core";\r
import type { NgbPopover } from "ngb-js/popover";\r
\r
@Component({\r
    selector: "docs-popover-autoclose",\r
    controllerAs: "example",\r
    templateUrl: "./popover-autoclose.component.html",\r
    styleUrl: "./popover-autoclose.component.css",\r
})\r
export class PopoverAutocloseComponent {\r
    public popover?: NgbPopover;\r
}\r
`,r=`<p>Every popover also closes with <kbd>Esc</kbd>.</p>\r
<div class="vstack gap-3 align-items-start">\r
    <button type="button" class="btn btn-outline-secondary" auto-close="'inside'" ngb-popover="'Click this content or press Escape'" popover-title="'Inside clicks'">Close on inside click</button>\r
    <button type="button" class="btn btn-outline-secondary" auto-close="'outside'" ngb-popover="'Click elsewhere or press Escape'" popover-title="'Outside clicks'">Close on outside click</button>\r
    <div class="d-flex flex-wrap gap-2">\r
        <button type="button" class="btn btn-outline-secondary" auto-close="true" ngb-popover="'Click anywhere or press Escape'" popover-title="'All clicks'" ng-ref="example.popover" ng-ref-read="ngbPopover">Close on every click</button>\r
        <button type="button" class="btn btn-outline-secondary" ng-click="example.popover.toggle()">External toggle</button>\r
    </div>\r
</div>\r
`,i=`import { Component } from "ngjs-core";\r
\r
@Component({\r
    selector: "docs-popover-body",\r
    controllerAs: "example",\r
    templateUrl: "./popover-body.component.html",\r
    styleUrl: "./popover-body.component.css",\r
})\r
export class PopoverBodyComponent {}\r
`,a=`<div class="overflow-hidden border rounded p-4" style="max-width: 24rem">\r
    <p class="small text-body-secondary">This container clips overflowing descendants.</p>\r
    <div class="d-flex flex-wrap gap-2">\r
        <button type="button" class="btn btn-outline-secondary" placement="'top'" ngb-popover="'Inserted next to the trigger.'">Default</button>\r
        <button type="button" class="btn btn-outline-primary" placement="'top'" ngb-popover="'Appended directly to document.body.'" container="'body'">Append to body</button>\r
    </div>\r
</div>\r
`,o=`import { Component } from "ngjs-core";\r
import type { NgbPopover } from "ngb-js/popover";\r
import type { TemplateRef } from "ngjs-core";\r
\r
@Component({\r
    selector: "docs-popover-context",\r
    controllerAs: "example",\r
    templateUrl: "./popover-context.component.html",\r
    styleUrl: "./popover-context.component.css",\r
})\r
export class PopoverContextComponent {\r
    public name = "World";\r
    public contentTemplate?: TemplateRef<unknown>;\r
    public titleTemplate?: TemplateRef<unknown>;\r
    public french?: NgbPopover;\r
    public german?: NgbPopover;\r
    public english?: NgbPopover;\r
\r
    public toggleWithGreeting(popover: NgbPopover, greeting: string, language: string) {\r
        popover.isOpen() ? popover.close() : popover.open({ greeting, language });\r
    }\r
}\r
`,s=`<ng-template ng-ref="example.contentTemplate" let-greeting="greeting">{{ greeting }}, <strong>{{ example.name }}</strong>!</ng-template>\r
<ng-template ng-ref="example.titleTemplate" let-language="language">Greeting in {{ language }}</ng-template>\r
\r
<p>You can pass context when manually opening a popover.</p>\r
<div class="d-flex flex-wrap gap-2 mb-4">\r
    <button type="button" class="btn btn-outline-secondary" ngb-popover="example.contentTemplate" popover-title="example.titleTemplate" triggers="'manual'" ng-ref="example.french" ng-ref-read="ngbPopover" ng-click="example.toggleWithGreeting(example.french, 'Bonjour', 'French')">French</button>\r
    <button type="button" class="btn btn-outline-secondary" ngb-popover="example.contentTemplate" popover-title="example.titleTemplate" triggers="'manual'" ng-ref="example.german" ng-ref-read="ngbPopover" ng-click="example.toggleWithGreeting(example.german, 'Guten Tag', 'German')">German</button>\r
    <button type="button" class="btn btn-outline-secondary" ngb-popover="example.contentTemplate" popover-title="example.titleTemplate" triggers="'manual'" ng-ref="example.english" ng-ref-read="ngbPopover" ng-click="example.toggleWithGreeting(example.english, 'Hello', 'English')">English</button>\r
</div>\r
\r
<p>Alternatively, provide a default context through <code>popover-context</code>.</p>\r
<button type="button" class="btn btn-outline-secondary" ngb-popover="example.contentTemplate" popover-title="example.titleTemplate" popover-context="{ language: '中文', greeting: '你好' }">Chinese</button>\r
`,c=`.popover-custom { --bs-popover-border-color: var(--bs-primary-border-subtle); --bs-popover-header-bg: var(--bs-primary-bg-subtle); --bs-popover-header-color: var(--bs-primary-text-emphasis); box-shadow: 0 .75rem 2rem rgba(var(--bs-body-color-rgb), .12); }
`,l=`import { Component } from "ngjs-core";\r
\r
@Component({\r
    selector: "docs-popover-custom-class",\r
    controllerAs: "example",\r
    templateUrl: "./popover-custom-class.component.html",\r
    styleUrl: "./popover-custom-class.component.css",\r
})\r
export class PopoverCustomClassComponent {}\r
`,u=`<button type="button" class="btn btn-outline-primary" ngb-popover="'A small custom skin layered on top of Bootstrap variables.'" popover-title="'NgbJS popover'" popover-class="popover-custom">
    Popover with custom class\r
</button>\r
`,d=`import { Component } from "ngjs-core";\r
\r
@Component({\r
    selector: "docs-popover-custom-target",\r
    controllerAs: "example",\r
    templateUrl: "./popover-custom-target.component.html",\r
    styleUrl: "./popover-custom-target.component.css",\r
})\r
export class PopoverCustomTargetComponent {}\r
`,f=`<div class="d-flex flex-wrap align-items-baseline gap-2">\r
    <span>You can click</span>\r
    <button class="btn btn-outline-secondary" type="button" ngb-popover="'The button triggered me, but this text positioned me.'" popover-title="'Custom target'" position-target="'#popover-position-target'">this button</button>\r
    <span>but the popover appears over <strong id="popover-position-target" class="text-primary">this target</strong>.</span>\r
</div>\r
`,p=`import { Component } from "ngjs-core";\r
\r
@Component({\r
    selector: "docs-popover-delays",\r
    controllerAs: "example",\r
    templateUrl: "./popover-delays.component.html",\r
    styleUrl: "./popover-delays.component.css",\r
})\r
export class PopoverDelaysComponent {}\r
`,m=`<p>Move the pointer into the popover before its close delay expires to keep it open.</p>\r
<div class="d-flex flex-wrap gap-2">\r
    <button type="button" class="btn btn-outline-secondary" ngb-popover="'Opens after 300 ms and closes after 500 ms.'" triggers="'mouseenter:mouseleave'" open-delay="300" close-delay="500">300 / 500 ms</button>\r
    <button type="button" class="btn btn-outline-secondary" ngb-popover="'Opens after one second and closes after two.'" triggers="'mouseenter:mouseleave'" open-delay="1000" close-delay="2000">1 / 2 seconds</button>\r
</div>\r
`,h=`import { Component } from "ngjs-core";\r
import type { NgbPopover } from "ngb-js/popover";\r
\r
@Component({\r
    selector: "docs-popover-events",\r
    controllerAs: "example",\r
    templateUrl: "./popover-events.component.html",\r
    styleUrl: "./popover-events.component.css",\r
})\r
export class PopoverEventsComponent {\r
    public popover?: NgbPopover;\r
    public events: { name: string; time: Date }[] = [];\r
    public record(name: string) { this.events.unshift({ name, time: new Date() }); }\r
}\r
`,g=`<button type="button" class="btn btn-outline-primary" placement="'top'" ngb-popover="'Watch the event log below.'" popover-title="'Visibility events'" shown="example.record('shown')" hidden="example.record('hidden')" ng-ref="example.popover" ng-ref-read="ngbPopover">\r
    Toggle popover\r
</button>\r
\r
<div class="mt-4">\r
    <p class="mb-2">Current state: <code>{{ example.popover.isOpen() ? 'open' : 'closed' }}</code></p>\r
    <ul class="list-group list-group-flush" ng-if="example.events.length">\r
        <li class="list-group-item px-0 py-2" ng-repeat="event in example.events track by $index"><code>{{ event.name }}</code> at {{ event.time | date:'mediumTime' }}</li>\r
    </ul>\r
    <p class="text-body-secondary mb-0" ng-if="!example.events.length">No events recorded yet.</p>\r
</div>\r
`,_=`import { Component, Inject, type AfterViewInit, type OnDestroy } from "ngjs-core";\r
import { NgbPopoverConfig, NGB_POPOVER_CONFIG } from "ngb-js/popover";\r
\r
@Component({\r
    selector: "docs-popover-global",\r
    controllerAs: "example",\r
    templateUrl: "./popover-global.component.html",\r
    styleUrl: "./popover-global.component.css",\r
})\r
export class PopoverGlobalComponent implements AfterViewInit, OnDestroy {\r
    private readonly initialConfig: Pick<NgbPopoverConfig, "container" | "openDelay" | "placement" | "triggers">;\r
\r
    constructor(@Inject(NGB_POPOVER_CONFIG) private readonly config: NgbPopoverConfig) {\r
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
    public ngAfterViewInit() { this.restoreConfig(); }\r
    public ngOnDestroy() { this.restoreConfig(); }\r
    private restoreConfig() {\r
        this.config.container = this.initialConfig.container;\r
        this.config.openDelay = this.initialConfig.openDelay;\r
        this.config.placement = this.initialConfig.placement;\r
        this.config.triggers = this.initialConfig.triggers;\r
    }\r
}\r
`,v=`<div class="alert alert-light border d-flex gap-3 align-items-start" role="note">\r
    <i class="bi bi-gear text-primary mt-1" aria-hidden="true"></i>\r
    <div><p class="fw-semibold mb-1">Global defaults used by this example</p><p class="small text-body-secondary mb-0">Hover trigger, end placement, body container and a 300 ms opening delay.</p></div>\r
</div>\r
<button type="button" class="btn btn-outline-primary" ngb-popover="'This instance reads every option from NgbPopoverConfig.'" popover-title="'Configured globally'">Hover over me</button>\r
`,y=`import { Component } from "ngjs-core";\r
import type { NgbPopover } from "ngb-js/popover";\r
\r
@Component({\r
    selector: "docs-popover-manual-control",\r
    controllerAs: "example",\r
    templateUrl: "./popover-manual-control.component.html",\r
    styleUrl: "./popover-manual-control.component.css",\r
})\r
export class PopoverManualControlComponent {\r
    public popover?: NgbPopover;\r
}\r
`,b=`<button type="button" class="btn btn-primary mb-3" ngb-popover="'This target is controlled by the buttons below'" popover-title="'External controls'" triggers="'manual'" auto-close="false" ng-ref="example.popover" ng-ref-read="ngbPopover">\r
    Popover target\r
</button>\r
<div class="d-flex flex-wrap gap-2">\r
    <button type="button" class="btn btn-sm btn-outline-primary" ng-click="example.popover.open()">Open</button>\r
    <button type="button" class="btn btn-sm btn-outline-primary" ng-click="example.popover.close()">Close</button>\r
    <button type="button" class="btn btn-sm btn-outline-primary" ng-click="example.popover.toggle()">Toggle</button>\r
</div>\r
`,x=`import { Component } from "ngjs-core";\r
\r
@Component({\r
    selector: "docs-popover-placements",\r
    controllerAs: "example",\r
    templateUrl: "./popover-placements.component.html",\r
    styleUrl: "./popover-placements.component.css",\r
})\r
export class PopoverPlacementsComponent {}\r
`,S=`<div class="d-flex flex-wrap gap-2">\r
    <button type="button" class="btn btn-outline-secondary" placement="'top'" ngb-popover="'Popover content'" popover-title="'Popover on top'">Top</button>\r
    <button type="button" class="btn btn-outline-secondary" placement="'end'" ngb-popover="'Popover content'" popover-title="'Popover on right'">Right</button>\r
    <button type="button" class="btn btn-outline-secondary" placement="'bottom'" ngb-popover="'Popover content'" popover-title="'Popover on bottom'">Bottom</button>\r
    <button type="button" class="btn btn-outline-secondary" placement="'start'" ngb-popover="'Popover content'" popover-title="'Popover on left'">Left</button>\r
</div>\r
`,C=`import { Component } from "ngjs-core";\r
import type { TemplateRef } from "ngjs-core";\r
\r
@Component({\r
    selector: "docs-popover-template",\r
    controllerAs: "example",\r
    templateUrl: "./popover-template.component.html",\r
    styleUrl: "./popover-template.component.css",\r
})\r
export class PopoverTemplateComponent {\r
    public name = "NgbJS";\r
    public contentTemplate?: TemplateRef<unknown>;\r
    public titleTemplate?: TemplateRef<unknown>;\r
}\r
`,w=`<ng-template ng-ref="example.titleTemplate">\r
    <span class="d-flex align-items-center gap-2"><i class="bi bi-code-slash" aria-hidden="true"></i><strong>Template content</strong></span>\r
</ng-template>\r
<ng-template ng-ref="example.contentTemplate">\r
    <p class="mb-2">Hello, <strong>{{ example.name }}</strong>!</p>\r
    <button class="btn btn-sm btn-primary" type="button" ng-click="example.name = 'AngularJS'">Update binding</button>\r
</ng-template>\r
\r
<button type="button" class="btn btn-outline-primary" ngb-popover="example.contentTemplate" popover-title="example.titleTemplate">\r
    HTML and bindings\r
</button>\r
`,T=`import { Component } from "ngjs-core";\r
import type { NgbPopover } from "ngb-js/popover";\r
\r
@Component({\r
    selector: "docs-popover-triggers",\r
    controllerAs: "example",\r
    templateUrl: "./popover-triggers.component.html",\r
    styleUrl: "./popover-triggers.component.css",\r
})\r
export class PopoverTriggersComponent {\r
    public manual?: NgbPopover;\r
}\r
`,E=`<p class="mb-3">Custom events can be paired as <code>mouseenter:mouseleave</code>.</p>\r
<button type="button" class="btn btn-outline-secondary mb-4" ngb-popover="'Shown while the pointer is over the trigger'" popover-title="'Hover trigger'" triggers="'mouseenter:mouseleave'">\r
    Hover over me\r
</button>\r
\r
<p class="mb-3">A manual trigger delegates opening and closing to application code.</p>\r
<div class="d-flex flex-wrap gap-2">\r
    <button type="button" class="btn btn-outline-primary" ngb-popover="'Manually controlled content'" popover-title="'Manual popover'" triggers="'manual'" auto-close="false" ng-ref="example.manual" ng-ref-read="ngbPopover" ng-click="example.manual.open()">\r
        Open popover\r
    </button>\r
    <button type="button" class="btn btn-outline-primary" ng-click="example.manual.close()">Close popover</button>\r
</div>\r
`,D=class{examples={placements:{html:S,typescript:x},template:{html:w,typescript:C},triggers:{html:E,typescript:T},manual:{html:b,typescript:y},autoclose:{html:r,typescript:n},context:{html:s,typescript:o},customTarget:{html:f,typescript:d},delays:{html:m,typescript:p},events:{html:g,typescript:h},body:{html:a,typescript:i},customClass:{html:u,typescript:l,css:c},global:{html:v,typescript:_}}};D=t([e({selector:`docs-popover-examples-page`,controllerAs:`$`,templateUrl:`/ngb-js-docs/templates/popover-examples-page.component-af68e82e.html`,styleUrl:`./popover-examples-page.component.css`})],D);export{D as PopoverExamplesPageComponent};