import { Component, Inject, type AfterViewInit, type OnDestroy } from "ngjs-core";
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
