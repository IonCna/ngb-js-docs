import { Component, Inject, type AfterViewInit, type OnDestroy } from "ngjs-core";
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
