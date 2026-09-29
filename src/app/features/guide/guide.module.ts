import { routes } from "@/features/guide/guide.routes"
import { NgModule } from "ngjs-core";
import { RouterModule } from "ngjs-core/router"

import { NgbNavModule } from "ngb-js/nav"
import { NgbScrollSpyModule } from "ngb-js/scrollspy"

@NgModule({
    id: "docs.guide.module",
    imports: [
        NgbNavModule,
        NgbScrollSpyModule,
        RouterModule.forChild(routes),
    ]
})
export class GuideModule {}
