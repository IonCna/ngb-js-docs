import { Component, Inject, type AfterViewInit, type OnDestroy } from "ngjs-core";
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
