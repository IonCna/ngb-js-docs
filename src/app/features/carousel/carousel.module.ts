import {NgModule} from "ngjs-core";
import  { RouterModule } from "ngjs-core/router"
import { routes } from "@/features/carousel/carousel.routes"

import { CarouselApiPageComponent } from "@/features/carousel/pages/carousel-api-page/carousel-api-page.component"
import { CarouselExamplesPageComponent } from "@/features/carousel/pages/carousel-examples-page/carousel-examples-page.component"

@NgModule({
    id: "docs.carousel",
    declarations: [CarouselApiPageComponent, CarouselExamplesPageComponent],
    imports: [
        RouterModule.forChild(routes)
    ]
})
export class CarouselModule {}