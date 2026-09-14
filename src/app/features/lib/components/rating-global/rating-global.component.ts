import { Component, Inject, type AfterViewInit, type OnDestroy } from "ngjs-core";
import { NgbRatingConfig, NGB_RATING_CONFIG } from "ngb-js/rating";

@Component({
    selector: "docs-rating-global",
    controllerAs: "example",
    templateUrl: "./rating-global.component.html",
    styleUrl: "./rating-global.component.css",
})
export class RatingGlobalComponent implements AfterViewInit, OnDestroy {
    private readonly initialConfig: Pick<NgbRatingConfig, "max" | "readonly" | "resettable" | "tabindex">;

    constructor(@Inject(NGB_RATING_CONFIG) private readonly config: NgbRatingConfig) {
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

    public ngAfterViewInit() { this.restoreConfig(); }
    public ngOnDestroy() { this.restoreConfig(); }
    private restoreConfig() { Object.assign(this.config, this.initialConfig); }
}
