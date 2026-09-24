import { AppComponent } from "@/app.component"

import { CoreModule } from "@/core/core.module"
import { SharedModule } from "@/shared/shared.module"
import { FeaturesModule } from "@/features/features.module"
import {NgModule} from "ngjs-core";
import { routes } from "@/app.routes"
import {RouterModule, withRouterConfig} from "ngjs-core/router";

@NgModule({
    controllerAs: "$",
    declarations: [AppComponent],
    imports: [CoreModule],
    bootstrap: []
})

export class RootModule { }
