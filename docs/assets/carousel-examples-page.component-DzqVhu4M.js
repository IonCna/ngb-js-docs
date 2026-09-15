import{r as e,t}from"./decorate-U3LoYfOr.js";var n=`import { Component, ViewChild } from "ngjs-core";\r
\r
interface CarouselController {\r
    cycle(): void;\r
    pause(): void;\r
}\r
\r
interface CarouselSlideEvent {\r
    source?: "timer" | "arrowLeft" | "arrowRight" | "indicator";\r
}\r
\r
@Component({\r
    selector: "docs-carousel-controls",\r
    controllerAs: "example",\r
    templateUrl: "./carousel-controls.component.html",\r
    styleUrl: "./carousel-controls.component.css",\r
})\r
export class CarouselControlsComponent {\r
    public pauseOnHover = true;\r
    public pauseOnFocus = true;\r
    public unpauseOnArrow = false;\r
    public pauseOnIndicator = false;\r
    public paused = false;\r
\r
    @ViewChild("carousel")\r
    private carousel?: CarouselController;\r
\r
    public onSlide(event: CarouselSlideEvent) {\r
        const isArrow = event.source === "arrowLeft" || event.source === "arrowRight";\r
\r
        if (isArrow && this.unpauseOnArrow) {\r
            this.carousel?.cycle();\r
            this.paused = false;\r
        }\r
\r
        if (event.source === "indicator" && this.pauseOnIndicator) {\r
            this.carousel?.pause();\r
            this.paused = true;\r
        }\r
    }\r
\r
    public toggleCycle() {\r
        if (this.paused) {\r
            this.carousel?.cycle();\r
        } else {\r
            this.carousel?.pause();\r
        }\r
\r
        this.paused = !this.paused;\r
    }\r
}\r
`,r=`import { Component, Inject, type OnDestroy } from "ngjs-core";\r
import { NgbCarouselConfig, NGB_CAROUSEL_CONFIG } from "ngb-js/carousel";\r
\r
@Component({\r
    selector: "docs-carousel-global",\r
    controllerAs: "example",\r
    templateUrl: "./carousel-global.component.html",\r
    styleUrl: "./carousel-global.component.css",\r
})\r
export class CarouselGlobalComponent implements OnDestroy {\r
    private readonly initialConfig: Pick<\r
        NgbCarouselConfig,\r
        "animation" | "interval" | "wrap" | "pauseOnFocus" | "pauseOnHover" | "showNavigationArrows"\r
    >;\r
\r
    constructor(@Inject(NGB_CAROUSEL_CONFIG) private readonly config: NgbCarouselConfig) {\r
        this.initialConfig = {\r
            animation: config.animation,\r
            interval: config.interval,\r
            wrap: config.wrap,\r
            pauseOnFocus: config.pauseOnFocus,\r
            pauseOnHover: config.pauseOnHover,\r
            showNavigationArrows: config.showNavigationArrows,\r
        };\r
\r
        config.animation = false;\r
        config.interval = 2500;\r
        config.wrap = false;\r
        config.pauseOnFocus = false;\r
        config.pauseOnHover = false;\r
        config.showNavigationArrows = false;\r
    }\r
\r
    public ngOnDestroy() {\r
        this.config.animation = this.initialConfig.animation;\r
        this.config.interval = this.initialConfig.interval;\r
        this.config.wrap = this.initialConfig.wrap;\r
        this.config.pauseOnFocus = this.initialConfig.pauseOnFocus;\r
        this.config.pauseOnHover = this.initialConfig.pauseOnHover;\r
        this.config.showNavigationArrows = this.initialConfig.showNavigationArrows;\r
    }\r
}\r
`,i=`<ngb-carousel aria-label="Featured landscapes">\r
    <ng-template ngb-slide id="simple-mountain">\r
        <img\r
            src="https://picsum.photos/id/944/900/500"\r
            class="d-block w-100 h-auto"\r
            width="900"\r
            height="500"\r
            alt="First carousel slide">\r
        <div class="carousel-caption d-none d-md-block">\r
            <h3 class="h5">Explore new perspectives</h3>\r
            <p>Default navigation arrows and indicators are enabled.</p>\r
        </div>\r
    </ng-template>\r
\r
    <ng-template ngb-slide id="simple-lake">\r
        <img\r
            src="https://picsum.photos/id/1011/900/500"\r
            class="d-block w-100 h-auto"\r
            width="900"\r
            height="500"\r
            alt="Second carousel slide">\r
        <div class="carousel-caption d-none d-md-block">\r
            <h3 class="h5">Move at your own pace</h3>\r
            <p>Use either the controls or the navigation indicators.</p>\r
        </div>\r
    </ng-template>\r
\r
    <ng-template ngb-slide id="simple-valley">\r
        <img\r
            src="https://picsum.photos/id/984/900/500"\r
            class="d-block w-100 h-auto"\r
            width="900"\r
            height="500"\r
            alt="Third carousel slide">\r
        <div class="carousel-caption d-none d-md-block">\r
            <h3 class="h5">Ready by default</h3>\r
            <p>No local configuration is required.</p>\r
        </div>\r
    </ng-template>\r
</ngb-carousel>\r
`,a=`<p class="small text-body-secondary mb-3">\r
    Click the carousel to focus it, then use the\r
    <kbd class="mx-1">←</kbd>\r
    and\r
    <kbd class="mx-1">→</kbd>\r
    keys.\r
</p>\r
\r
<ngb-carousel\r
    aria-label="Keyboard-controlled carousel"\r
    interval="0"\r
    keyboard="true"\r
    show-navigation-arrows="false"\r
    show-navigation-indicators="false">\r
    <ng-template ngb-slide id="keyboard-dog">\r
        <img\r
            src="https://picsum.photos/id/1025/900/500"\r
            class="d-block w-100 h-auto"\r
            width="900"\r
            height="500"\r
            alt="Dog wrapped in a blanket">\r
    </ng-template>\r
\r
    <ng-template ngb-slide id="keyboard-river">\r
        <img\r
            src="https://picsum.photos/id/1035/900/500"\r
            class="d-block w-100 h-auto"\r
            width="900"\r
            height="500"\r
            alt="River running through a forest">\r
    </ng-template>\r
\r
    <ng-template ngb-slide id="keyboard-coast">\r
        <img\r
            src="https://picsum.photos/id/1043/900/500"\r
            class="d-block w-100 h-auto"\r
            width="900"\r
            height="500"\r
            alt="Rocky coastline">\r
    </ng-template>\r
</ngb-carousel>\r
`,o=`<div class="d-flex flex-column gap-3">\r
    <div class="row g-3">\r
        <div class="col-sm-6">\r
            <div class="form-check form-switch">\r
                <input\r
                    class="form-check-input"\r
                    type="checkbox"\r
                    role="switch"\r
                    id="carousel-pause-hover"\r
                    ng-model="example.pauseOnHover">\r
                <label class="form-check-label" for="carousel-pause-hover">Pause on hover</label>\r
            </div>\r
        </div>\r
        <div class="col-sm-6">\r
            <div class="form-check form-switch">\r
                <input\r
                    class="form-check-input"\r
                    type="checkbox"\r
                    role="switch"\r
                    id="carousel-pause-focus"\r
                    ng-model="example.pauseOnFocus">\r
                <label class="form-check-label" for="carousel-pause-focus">Pause on focus</label>\r
            </div>\r
        </div>\r
        <div class="col-sm-6">\r
            <div class="form-check form-switch">\r
                <input\r
                    class="form-check-input"\r
                    type="checkbox"\r
                    role="switch"\r
                    id="carousel-unpause-arrows"\r
                    ng-model="example.unpauseOnArrow">\r
                <label class="form-check-label" for="carousel-unpause-arrows">Unpause when clicking an arrow</label>\r
            </div>\r
        </div>\r
        <div class="col-sm-6">\r
            <div class="form-check form-switch">\r
                <input\r
                    class="form-check-input"\r
                    type="checkbox"\r
                    role="switch"\r
                    id="carousel-pause-indicator"\r
                    ng-model="example.pauseOnIndicator">\r
                <label class="form-check-label" for="carousel-pause-indicator">Pause when clicking an indicator</label>\r
            </div>\r
        </div>\r
    </div>\r
\r
    <div>\r
        <button type="button" class="btn btn-outline-primary btn-sm" ng-click="example.toggleCycle()">\r
            <i class="bi me-1" ng-class="example.paused ? 'bi-play-fill' : 'bi-pause-fill'" aria-hidden="true"></i>\r
            {{ example.paused ? 'Cycle' : 'Pause' }}\r
        </button>\r
    </div>\r
\r
    <ngb-carousel\r
        ng-ref="carousel"\r
        ng-ref-read="ngbCarousel"\r
        aria-label="Configurable carousel"\r
        interval="3000"\r
        pause-on-hover="example.pauseOnHover"\r
        pause-on-focus="example.pauseOnFocus"\r
        show-navigation-arrows="true"\r
        show-navigation-indicators="true"\r
        slide="example.onSlide($event)">\r
        <ng-template ngb-slide id="controls-building">\r
            <img\r
                src="https://picsum.photos/id/1050/900/500"\r
                class="d-block w-100 h-auto"\r
                width="900"\r
                height="500"\r
                alt="Building beside the water">\r
        </ng-template>\r
\r
        <ng-template ngb-slide id="controls-landscape">\r
            <img\r
                src="https://picsum.photos/id/1067/900/500"\r
                class="d-block w-100 h-auto"\r
                width="900"\r
                height="500"\r
                alt="Open landscape at sunset">\r
        </ng-template>\r
\r
        <ng-template ngb-slide id="controls-field">\r
            <img\r
                src="https://picsum.photos/id/1074/900/500"\r
                class="d-block w-100 h-auto"\r
                width="900"\r
                height="500"\r
                alt="Field beneath a cloudy sky">\r
        </ng-template>\r
\r
        <ng-template ngb-slide id="controls-hills">\r
            <img\r
                src="https://picsum.photos/id/1084/900/500"\r
                class="d-block w-100 h-auto"\r
                width="900"\r
                height="500"\r
                alt="Hills in warm light">\r
        </ng-template>\r
    </ngb-carousel>\r
</div>\r
`,s=`<div class="alert alert-light border d-flex gap-3 align-items-start" role="note">\r
    <i class="bi bi-gear text-primary mt-1" aria-hidden="true"></i>\r
    <div>\r
        <p class="fw-semibold mb-1">Global defaults used by this example</p>\r
        <p class="small text-body-secondary mb-0">\r
            Slides change every 2.5 seconds without animation, do not pause on hover or focus,\r
            hide the arrows and stop after the final slide.\r
        </p>\r
    </div>\r
</div>\r
\r
<ngb-carousel aria-label="Carousel using global configuration">\r
    <ng-template ngb-slide id="global-coast">\r
        <img\r
            src="https://picsum.photos/id/11/900/500"\r
            class="d-block w-100 h-auto"\r
            width="900"\r
            height="500"\r
            alt="First globally configured carousel slide">\r
    </ng-template>\r
\r
    <ng-template ngb-slide id="global-mountains">\r
        <img\r
            src="https://picsum.photos/id/29/900/500"\r
            class="d-block w-100 h-auto"\r
            width="900"\r
            height="500"\r
            alt="Second globally configured carousel slide">\r
    </ng-template>\r
\r
    <ng-template ngb-slide id="global-city">\r
        <img\r
            src="https://picsum.photos/id/42/900/500"\r
            class="d-block w-100 h-auto"\r
            width="900"\r
            height="500"\r
            alt="Third globally configured carousel slide">\r
    </ng-template>\r
</ngb-carousel>\r
`,c=class{examples={simple:{html:i},keyboard:{html:a},controls:{html:o,typescript:n},global:{html:s,typescript:r}}};c=t([e({selector:`docs-carousel-examples-page`,controllerAs:`$`,templateUrl:`/ngb-js-docs/templates/carousel-examples-page.component-81b095cc.html`,styleUrl:`./carousel-examples-page.component.css`})],c);export{c as CarouselExamplesPageComponent};