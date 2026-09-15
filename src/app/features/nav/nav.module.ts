import {NgModule} from "ngjs-core";
import {RouterModule} from "ngjs-core/router";
import {NgbNavModule} from "ngb-js/nav";
import { NgbCollapseModule } from "ngb-js/collapse";

import {routes} from "@/features/nav/nav.routes";
import {AlternativeNavComponent} from "@/features/nav/components/alternative-nav/alternative-nav.component";
import {CustomNavComponent} from "@/features/nav/components/custom-nav/custom-nav.component";
import {DynamicNavComponent} from "@/features/nav/components/dynamic-nav/dynamic-nav.component";
import {KeepContentNavComponent} from "@/features/nav/components/keep-content-nav/keep-content-nav.component";
import {NavGlobalComponent} from "@/features/nav/components/nav-global/nav-global.component";
import {SelectingNavComponent} from "@/features/nav/components/selecting-nav/selecting-nav.component";
import {SimpleNavComponent} from "@/features/nav/components/simple-nav/simple-nav.component";
import {VerticalNavComponent} from "@/features/nav/components/vertical-nav/vertical-nav.component";

@NgModule({
    id: "docs.nav",
    declarations: [
        AlternativeNavComponent,
        CustomNavComponent,
        DynamicNavComponent,
        KeepContentNavComponent,
        NavGlobalComponent,
        SelectingNavComponent,
        SimpleNavComponent,
        VerticalNavComponent,
    ],
    imports: [
        NgbCollapseModule,
        NgbNavModule,
        RouterModule.forChild(routes),
    ],
})
export class NavModule {}
