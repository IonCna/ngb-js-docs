import { Component } from "ngjs-core";
import carouselControlsTs from "@/features/lib/components/carousel-controls/carousel-controls.component.ts?raw"
import carouselGlobalTs from "@/features/lib/components/carousel-global/carousel-global.component.ts?raw"
import carouselSimpleHtml from "@/features/lib/components/carousel-simple/carousel-simple.component.html?raw"
import carouselKeyboardHtml from "@/features/lib/components/carousel-keyboard/carousel-keyboard.component.html?raw"
import carouselControlsHtml from "@/features/lib/components/carousel-controls/carousel-controls.component.html?raw"
import carouselGlobalHtml from "@/features/lib/components/carousel-global/carousel-global.component.html?raw"

@Component({
    selector: "docs-carousel-examples-page",
    controllerAs: "$",
    templateUrl: "./carousel-examples-page.component.html",
    styleUrl: "./carousel-examples-page.component.css",
})
export class CarouselExamplesPageComponent {
    public readonly examples = {
        simple: {
            html: carouselSimpleHtml,
        },
        keyboard: {
            html: carouselKeyboardHtml,
        },
        controls: {
            html: carouselControlsHtml,
            typescript: carouselControlsTs,
        },
        global: {
            html: carouselGlobalHtml,
            typescript: carouselGlobalTs,
        },
    }
}
