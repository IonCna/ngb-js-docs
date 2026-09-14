import router from "@uirouter/angularjs"
import { NgbModule } from "ngb-js";
import { AppComponent } from "@/app.component"

import { CoreModule } from "@/core/core.module"
import { SharedModule } from "@/shared/shared.module"
import { FeaturesModule } from "@/features/features.module"
import {NgModule, CoreModule as NgCoreModule} from "ngjs-core";
import { routes } from "@/app.routes"
import {RouterModule} from "ngjs-core/router";

@NgModule({
    id: "root",
    controllerAs: "$",
    declarations: [AppComponent],
    imports: [
        router,
        NgbModule,
        NgCoreModule,
        CoreModule,
        SharedModule,
        FeaturesModule,
        RouterModule.forRoot(routes),
    ],
    bootstrap: [AppComponent]
})

export class RootModule { }
