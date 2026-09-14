import { Component, Inject, type OnDestroy } from "ngjs-core";
import { NgbCarouselConfig, NGB_CAROUSEL_CONFIG } from "ngb-js/carousel";

@Component({
    selector: "docs-carousel-global",
    controllerAs: "example",
    templateUrl: "./carousel-global.component.html",
    styleUrl: "./carousel-global.component.css",
})
export class CarouselGlobalComponent implements OnDestroy {
    private readonly initialConfig: Pick<
        NgbCarouselConfig,
        "animation" | "interval" | "wrap" | "pauseOnFocus" | "pauseOnHover" | "showNavigationArrows"
    >;

    constructor(@Inject(NGB_CAROUSEL_CONFIG) private readonly config: NgbCarouselConfig) {
        this.initialConfig = {
            animation: config.animation,
            interval: config.interval,
            wrap: config.wrap,
            pauseOnFocus: config.pauseOnFocus,
            pauseOnHover: config.pauseOnHover,
            showNavigationArrows: config.showNavigationArrows,
        };

        config.animation = false;
        config.interval = 2500;
        config.wrap = false;
        config.pauseOnFocus = false;
        config.pauseOnHover = false;
        config.showNavigationArrows = false;
    }

    public ngOnDestroy() {
        this.config.animation = this.initialConfig.animation;
        this.config.interval = this.initialConfig.interval;
        this.config.wrap = this.initialConfig.wrap;
        this.config.pauseOnFocus = this.initialConfig.pauseOnFocus;
        this.config.pauseOnHover = this.initialConfig.pauseOnHover;
        this.config.showNavigationArrows = this.initialConfig.showNavigationArrows;
    }
}
