import { Component, ViewChild } from "ngjs-core";

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
