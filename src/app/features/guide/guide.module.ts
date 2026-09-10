import { routes } from "@/features/guide/guide.routes"
import { NgModule } from "ngjs-core";
import { RouterModule } from "ngjs-core/router"

@NgModule({
    id: "docs.guide.module",
    imports: [
        RouterModule.forChild(routes),
    ]
})
export class GuideModule {}
