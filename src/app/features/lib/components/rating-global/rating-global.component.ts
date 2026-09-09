import type { IComponentController, IComponentOptions } from "angular";
import { NgbRatingConfig, NGB_RATING_CONFIG } from "ngb-js/rating";

export class RatingGlobalComponent implements IComponentController {
    private readonly initialConfig: Pick<NgbRatingConfig, "max" | "readonly" | "resettable" | "tabindex">;

    constructor(private readonly config: NgbRatingConfig) {
        this.initialConfig = {
            max: config.max,
            readonly: config.readonly,
            resettable: config.resettable,
            tabindex: config.tabindex,
        };
        config.max = 5;
        config.readonly = true;
        config.resettable = true;
        config.tabindex = -1;
    }

    public $postLink() { this.restoreConfig(); }
    public $onDestroy() { this.restoreConfig(); }
    private restoreConfig() { Object.assign(this.config, this.initialConfig); }

    static get $name() { return "docsRatingGlobal" }
    static get $inject() { return [NGB_RATING_CONFIG] }
    static get $factory(): IComponentOptions {
        return { controller: RatingGlobalComponent, controllerAs: "example", templateUrl: "./rating-global.component.html", styleUrl: "./rating-global.component.css" }
    }
}
