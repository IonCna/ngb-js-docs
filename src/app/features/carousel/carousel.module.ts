import {NgModule} from "ngjs-core";
import  { RouterModule } from "ngjs-core/router"

import { NgbCarouselModule } from "ngb-js/carousel"
import { NgbNavModule } from "ngb-js/nav"
import { NgbCollapseModule } from "ngb-js/collapse"

import { routes } from "@/features/carousel/carousel.routes"

import { CarouselControlsComponent } from "@/features/carousel/components/carousel-controls/carousel-controls.component"
import { CarouselGlobalComponent } from "@/features/carousel/components/carousel-global/carousel-global.component"
import { CarouselKeyboardComponent } from "@/features/carousel/components/carousel-keyboard/carousel-keyboard.component"
import { CarouselSimpleComponent } from "@/features/carousel/components/carousel-simple/carousel-simple.component"

@NgModule({
    id: "docs.carousel",
    declarations: [
        CarouselControlsComponent,
        CarouselGlobalComponent,
        CarouselKeyboardComponent,
        CarouselSimpleComponent
    ],
    imports: [
        NgbNavModule,
        NgbCarouselModule,
        NgbCollapseModule,
        RouterModule.forChild(routes)
    ]
})
export class CarouselModule {}
