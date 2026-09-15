import { NgModule } from "ngjs-core";
import { RouterModule } from "ngjs-core/router";
import { NgbCollapseModule } from "ngb-js/collapse";

import { HorizontalCollapseComponent } from "@/features/collapse/components/horizontal-collapse/horizontal-collapse.component"
import { NavbarCollapseComponent } from "@/features/collapse/components/navbar-collapse/navbar-collapse.component"
import { SimpleCollapseComponent } from "@/features/collapse/components/simple-collapse/simple-collapse.component"

import { routes } from "@/features/collapse/collapse.routes"

@NgModule({
    id: "docs.collapse",
    declarations: [
        HorizontalCollapseComponent,
        NavbarCollapseComponent,
        SimpleCollapseComponent
    ],
    imports: [
        NgbCollapseModule,
        RouterModule.forChild(routes)
    ]
})
export class CollapseModule {

}