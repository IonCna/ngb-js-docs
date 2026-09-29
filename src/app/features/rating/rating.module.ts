import { NgModule } from "ngjs-core";
import { RouterModule } from "ngjs-core/router";
import { NgbRatingModule } from "ngb-js/rating";
import { NgbScrollSpyModule } from "ngb-js/scrollspy";
import { NgbNavModule } from "ngb-js/nav";
import { NgbCollapseModule } from "ngb-js/collapse";
import { routes } from "@/features/rating/rating.routes";
import { BasicRatingComponent } from "@/features/rating/components/basic-rating/basic-rating.component";
import { RatingCustomTemplateComponent } from "@/features/rating/components/rating-custom-template/rating-custom-template.component";
import { RatingDecimalComponent } from "@/features/rating/components/rating-decimal/rating-decimal.component";
import { RatingEventsComponent } from "@/features/rating/components/rating-events/rating-events.component";
import { RatingFormComponent } from "@/features/rating/components/rating-form/rating-form.component";
import { RatingGlobalComponent } from "@/features/rating/components/rating-global/rating-global.component";

@NgModule({
    declarations: [BasicRatingComponent, RatingCustomTemplateComponent, RatingDecimalComponent, RatingEventsComponent, RatingFormComponent, RatingGlobalComponent],
    imports: [NgbRatingModule, NgbScrollSpyModule, NgbNavModule, NgbCollapseModule, RouterModule.forChild(routes)],
})
export class RatingModule {}
