import { HomeHeroComponent } from "@/features/home/components/home-hero/home-hero.component"
import { NgModule } from "ngjs-core"
import { NgbTooltipModule } from "ngb-js/tooltip"

@NgModule({
    id: "docs.home",
    imports: [NgbTooltipModule],
    declarations: [HomeHeroComponent],
})
export class HomeModule {}
