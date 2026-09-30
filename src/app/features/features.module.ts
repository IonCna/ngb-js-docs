import {NgModule} from "ngjs-core";
import { RouterModule } from "ngjs-core/router"
import {routes} from "@/features/features.routes";

@NgModule({
    imports: [
        RouterModule.forChild(routes)
    ]
})
export class FeaturesModule {}
