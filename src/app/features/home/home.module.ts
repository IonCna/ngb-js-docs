import { HomeHeroComponent } from "@/features/home/components/home-hero/home-hero.component"
import { NgModule } from "ngjs-core"
import { NgbTooltipModule } from "ngb-js/tooltip"
import { HomePageComponent } from "@/features/home/pages/home-page/home-page.component"

@NgModule({
    id: "docs.home",
    imports: [NgbTooltipModule],
    declarations: [HomeHeroComponent, HomePageComponent]
})
export class HomeModule {}
