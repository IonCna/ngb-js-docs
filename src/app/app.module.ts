import router from "@uirouter/angularjs"
import { NgbModule } from "ngb-js";
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
        NgbModule,
        NgCoreModule,
        CoreModule,
        SharedModule,
        FeaturesModule,
        // `lib.routes.ts` declara `title`/`tabs`/`externalLinks` en la ruta padre
        // (`components/x`) y las rutas hoja (`examples`/`api`/...) los leen vía
        // `ActivatedRoute.data` — necesita `'always'` (default de Angular es
        // `'emptyOnly'`, que no hereda a través de paths no vacíos).
        RouterModule.forRoot(routes, withRouterConfig({ paramsInheritanceStrategy: "always" })),
    ],
    bootstrap: [AppComponent]
})

export class RootModule { }
