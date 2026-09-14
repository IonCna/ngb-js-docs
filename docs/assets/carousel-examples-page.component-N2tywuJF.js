import{d as e,f as t}from"./index-B9XAkpig.js";var n=`import { Component, ViewChild } from "ngjs-core";

interface CarouselController {
    cycle(): void;
    pause(): void;
}

interface CarouselSlideEvent {
    source?: "timer" | "arrowLeft" | "arrowRight" | "indicator";
}

@Component({
    selector: "docs-carousel-controls",
    controllerAs: "example",
    templateUrl: "./carousel-controls.component.html",
    styleUrl: "./carousel-controls.component.css",
})
export class CarouselControlsComponent {
    public pauseOnHover = true;
    public pauseOnFocus = true;
    public unpauseOnArrow = false;
    public pauseOnIndicator = false;
    public paused = false;

    @ViewChild("carousel")
    private carousel?: CarouselController;

    public onSlide(event: CarouselSlideEvent) {
        const isArrow = event.source === "arrowLeft" || event.source === "arrowRight";

        if (isArrow && this.unpauseOnArrow) {
            this.carousel?.cycle();
            this.paused = false;
        }

        if (event.source === "indicator" && this.pauseOnIndicator) {
            this.carousel?.pause();
            this.paused = true;
        }
    }

    public toggleCycle() {
        if (this.paused) {
            this.carousel?.cycle();
        } else {
            this.carousel?.pause();
        }

        this.paused = !this.paused;
    }
}
`,r=`import { Component, Inject, type OnDestroy } from "ngjs-core";
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
`,i=`<ngb-carousel aria-label="Featured landscapes">
    <ng-template ngb-slide id="simple-mountain">
        <img
            src="https://picsum.photos/id/944/900/500"
            class="d-block w-100 h-auto"
            width="900"
            height="500"
            alt="First carousel slide">
        <div class="carousel-caption d-none d-md-block">
            <h3 class="h5">Explore new perspectives</h3>
            <p>Default navigation arrows and indicators are enabled.</p>
        </div>
    </ng-template>

    <ng-template ngb-slide id="simple-lake">
        <img
            src="https://picsum.photos/id/1011/900/500"
            class="d-block w-100 h-auto"
            width="900"
            height="500"
            alt="Second carousel slide">
        <div class="carousel-caption d-none d-md-block">
            <h3 class="h5">Move at your own pace</h3>
            <p>Use either the controls or the navigation indicators.</p>
        </div>
    </ng-template>

    <ng-template ngb-slide id="simple-valley">
        <img
            src="https://picsum.photos/id/984/900/500"
            class="d-block w-100 h-auto"
            width="900"
            height="500"
            alt="Third carousel slide">
        <div class="carousel-caption d-none d-md-block">
            <h3 class="h5">Ready by default</h3>
            <p>No local configuration is required.</p>
        </div>
    </ng-template>
</ngb-carousel>
`,a=`<p class="small text-body-secondary mb-3">
    Click the carousel to focus it, then use the
    <kbd class="mx-1">←</kbd>
    and
    <kbd class="mx-1">→</kbd>
    keys.
</p>

<ngb-carousel
    aria-label="Keyboard-controlled carousel"
    interval="0"
    keyboard="true"
    show-navigation-arrows="false"
    show-navigation-indicators="false">
    <ng-template ngb-slide id="keyboard-dog">
        <img
            src="https://picsum.photos/id/1025/900/500"
            class="d-block w-100 h-auto"
            width="900"
            height="500"
            alt="Dog wrapped in a blanket">
    </ng-template>

    <ng-template ngb-slide id="keyboard-river">
        <img
            src="https://picsum.photos/id/1035/900/500"
            class="d-block w-100 h-auto"
            width="900"
            height="500"
            alt="River running through a forest">
    </ng-template>

    <ng-template ngb-slide id="keyboard-coast">
        <img
            src="https://picsum.photos/id/1043/900/500"
            class="d-block w-100 h-auto"
            width="900"
            height="500"
            alt="Rocky coastline">
    </ng-template>
</ngb-carousel>
`,o=`<div class="d-flex flex-column gap-3">
    <div class="row g-3">
        <div class="col-sm-6">
            <div class="form-check form-switch">
                <input
                    class="form-check-input"
                    type="checkbox"
                    role="switch"
                    id="carousel-pause-hover"
                    ng-model="example.pauseOnHover">
                <label class="form-check-label" for="carousel-pause-hover">Pause on hover</label>
            </div>
        </div>
        <div class="col-sm-6">
            <div class="form-check form-switch">
                <input
                    class="form-check-input"
                    type="checkbox"
                    role="switch"
                    id="carousel-pause-focus"
                    ng-model="example.pauseOnFocus">
                <label class="form-check-label" for="carousel-pause-focus">Pause on focus</label>
            </div>
        </div>
        <div class="col-sm-6">
            <div class="form-check form-switch">
                <input
                    class="form-check-input"
                    type="checkbox"
                    role="switch"
                    id="carousel-unpause-arrows"
                    ng-model="example.unpauseOnArrow">
                <label class="form-check-label" for="carousel-unpause-arrows">Unpause when clicking an arrow</label>
            </div>
        </div>
        <div class="col-sm-6">
            <div class="form-check form-switch">
                <input
                    class="form-check-input"
                    type="checkbox"
                    role="switch"
                    id="carousel-pause-indicator"
                    ng-model="example.pauseOnIndicator">
                <label class="form-check-label" for="carousel-pause-indicator">Pause when clicking an indicator</label>
            </div>
        </div>
    </div>

    <div>
        <button type="button" class="btn btn-outline-primary btn-sm" ng-click="example.toggleCycle()">
            <i class="bi me-1" ng-class="example.paused ? 'bi-play-fill' : 'bi-pause-fill'" aria-hidden="true"></i>
            {{ example.paused ? 'Cycle' : 'Pause' }}
        </button>
    </div>

    <ngb-carousel
        ng-ref="carousel"
        ng-ref-read="ngbCarousel"
        aria-label="Configurable carousel"
        interval="3000"
        pause-on-hover="example.pauseOnHover"
        pause-on-focus="example.pauseOnFocus"
        show-navigation-arrows="true"
        show-navigation-indicators="true"
        slide="example.onSlide($event)">
        <ng-template ngb-slide id="controls-building">
            <img
                src="https://picsum.photos/id/1050/900/500"
                class="d-block w-100 h-auto"
                width="900"
                height="500"
                alt="Building beside the water">
        </ng-template>

        <ng-template ngb-slide id="controls-landscape">
            <img
                src="https://picsum.photos/id/1067/900/500"
                class="d-block w-100 h-auto"
                width="900"
                height="500"
                alt="Open landscape at sunset">
        </ng-template>

        <ng-template ngb-slide id="controls-field">
            <img
                src="https://picsum.photos/id/1074/900/500"
                class="d-block w-100 h-auto"
                width="900"
                height="500"
                alt="Field beneath a cloudy sky">
        </ng-template>

        <ng-template ngb-slide id="controls-hills">
            <img
                src="https://picsum.photos/id/1084/900/500"
                class="d-block w-100 h-auto"
                width="900"
                height="500"
                alt="Hills in warm light">
        </ng-template>
    </ngb-carousel>
</div>
`,s=`<div class="alert alert-light border d-flex gap-3 align-items-start" role="note">
    <i class="bi bi-gear text-primary mt-1" aria-hidden="true"></i>
    <div>
        <p class="fw-semibold mb-1">Global defaults used by this example</p>
        <p class="small text-body-secondary mb-0">
            Slides change every 2.5 seconds without animation, do not pause on hover or focus,
            hide the arrows and stop after the final slide.
        </p>
    </div>
</div>

<ngb-carousel aria-label="Carousel using global configuration">
    <ng-template ngb-slide id="global-coast">
        <img
            src="https://picsum.photos/id/11/900/500"
            class="d-block w-100 h-auto"
            width="900"
            height="500"
            alt="First globally configured carousel slide">
    </ng-template>

    <ng-template ngb-slide id="global-mountains">
        <img
            src="https://picsum.photos/id/29/900/500"
            class="d-block w-100 h-auto"
            width="900"
            height="500"
            alt="Second globally configured carousel slide">
    </ng-template>

    <ng-template ngb-slide id="global-city">
        <img
            src="https://picsum.photos/id/42/900/500"
            class="d-block w-100 h-auto"
            width="900"
            height="500"
            alt="Third globally configured carousel slide">
    </ng-template>
</ngb-carousel>
`,c=class{examples={simple:{html:i},keyboard:{html:a},controls:{html:o,typescript:n},global:{html:s,typescript:r}}};c=e([t({selector:`docs-carousel-examples-page`,controllerAs:`$`,templateUrl:`/ngb-js-docs/templates/carousel-examples-page.component-1be71d2f.html`,styleUrl:`./carousel-examples-page.component.css`})],c);export{c as CarouselExamplesPageComponent};