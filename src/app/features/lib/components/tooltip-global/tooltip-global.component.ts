import type { IComponentController, IComponentOptions } from "angular";
import { NgbTooltipConfig, NGB_TOOLTIP_CONFIG } from "ngb-js/tooltip";

export class TooltipGlobalComponent implements IComponentController {
    private readonly initialConfig: Pick<NgbTooltipConfig, "container" | "openDelay" | "placement" | "triggers">;

    constructor(private readonly config: NgbTooltipConfig) {
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

    public $postLink(): void { this.restoreConfig(); }
    public $onDestroy(): void { this.restoreConfig(); }

    private restoreConfig(): void {
        this.config.container = this.initialConfig.container;
        this.config.openDelay = this.initialConfig.openDelay;
        this.config.placement = this.initialConfig.placement;
        this.config.triggers = this.initialConfig.triggers;
    }

    static get $name() { return "docsTooltipGlobal" }
    static get $inject() { return [NGB_TOOLTIP_CONFIG] }
    static get $factory(): IComponentOptions {
        return { controller: TooltipGlobalComponent, controllerAs: "example", templateUrl: "./tooltip-global.component.html", styleUrl: "./tooltip-global.component.css" }
    }
}
