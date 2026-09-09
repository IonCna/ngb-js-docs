import type { IComponentController, IComponentOptions } from "angular";
import { NgbProgressbarConfig, NGB_PROGRESSBAR_CONFIG } from "ngb-js/progressbar";

export class ProgressbarGlobalComponent implements IComponentController {
    private readonly initialConfig: Pick<NgbProgressbarConfig, "animated" | "height" | "max" | "showValue" | "striped" | "textType" | "type">;

    constructor(private readonly config: NgbProgressbarConfig) {
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

    public $postLink() { this.restoreConfig(); }
    public $onDestroy() { this.restoreConfig(); }
    private restoreConfig() { Object.assign(this.config, this.initialConfig); }

    static get $name() { return "docsProgressbarGlobal" }
    static get $inject() { return [NGB_PROGRESSBAR_CONFIG] }
    static get $factory(): IComponentOptions {
        return { controller: ProgressbarGlobalComponent, controllerAs: "example", templateUrl: "./progressbar-global.component.html", styleUrl: "./progressbar-global.component.css" }
    }
}
