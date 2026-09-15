import router from "@uirouter/angularjs"
import { AppComponent } from "@/app.component"

import { CoreModule } from "@/core/core.module"
import { SharedModule } from "@/shared/shared.module"
import { FeaturesModule } from "@/features/features.module"
import {NgModule, CoreModule as NgCoreModule} from "ngjs-core";
import { routes } from "@/app.routes"
import {RouterModule, withRouterConfig} from "ngjs-core/router";

@NgModule({
    id: "root",
    controllerAs: "$",
    declarations: [AppComponent],
    imports: [
        router,
        NgCoreModule,
        CoreModule,
        SharedModule,
        FeaturesModule,
        RouterModule.forRoot(routes, withRouterConfig({ paramsInheritanceStrategy: "always" })),
    ],
    bootstrap: [AppComponent]
})

export class RootModule { }
