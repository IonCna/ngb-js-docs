import type { IComponentController, IComponentOptions } from "angular";
import { NgbCarouselConfig, NGB_CAROUSEL_CONFIG } from "ngb-js/carousel";

export class CarouselGlobalComponent implements IComponentController {
    private readonly initialConfig: Pick<
        NgbCarouselConfig,
        "animation" | "interval" | "wrap" | "pauseOnFocus" | "pauseOnHover" | "showNavigationArrows"
    >;

    constructor(private readonly config: NgbCarouselConfig) {
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

    public $onDestroy() {
        this.config.animation = this.initialConfig.animation;
        this.config.interval = this.initialConfig.interval;
        this.config.wrap = this.initialConfig.wrap;
        this.config.pauseOnFocus = this.initialConfig.pauseOnFocus;
        this.config.pauseOnHover = this.initialConfig.pauseOnHover;
        this.config.showNavigationArrows = this.initialConfig.showNavigationArrows;
    }

    static get $name() {
        return "docsCarouselGlobal"
    }

    static get $inject() {
        return [NGB_CAROUSEL_CONFIG]
    }

    static get $factory(): IComponentOptions {
        return {
            controller: CarouselGlobalComponent,
            controllerAs: "example",
            templateUrl: "./carousel-global.component.html", styleUrl: "./carousel-global.component.css",
        }
    }
}
