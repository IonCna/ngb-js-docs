import { AppComponent } from "@/app.component"

import { CoreModule } from "@/core/core.module"
import { HomeModule } from "@/features/home/home.module"
import {NgModule} from "ngjs-core";

// import { SharedModule } from "@/shared/shared.module"
// import { FeaturesModule } from "@/features/features.module"
import { routes } from "@/app.routes"
import {RouterModule} from "ngjs-core/router";

@NgModule({
    controllerAs: "$",
    declarations: [AppComponent],
    imports: [
        CoreModule,
        HomeModule,
        RouterModule.forRoot(routes)
    ],
    bootstrap: [AppComponent]
})

export class RootModule { }
