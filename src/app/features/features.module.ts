import { HomeModule } from "@/features/home/home.module"
import {NgModule} from "ngjs-core";
import { RouterModule } from "ngjs-core/router"
import {routes} from "@/features/features.routes";

@NgModule({
    id: "docs.features",
    imports: [
        HomeModule,
        RouterModule.forChild(routes)
    ]
})
export class FeaturesModule {}