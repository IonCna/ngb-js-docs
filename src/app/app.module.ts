import { AppComponent } from "@/app.component"

import { CoreModule } from "@/core/core.module"
import { HomeModule } from "@/features/home/home.module"
import {NgModule} from "ngjs-core";

import { SharedModule } from "@/shared/shared.module"
import { routes } from "@/app.routes"
import { RouterModule } from "ngjs-core/router";

@NgModule({
    controllerAs: "$",
    declarations: [AppComponent],
    imports: [
        CoreModule,
        SharedModule,
        HomeModule,
        RouterModule.forRoot(routes, { useHash: true })
    ],
    bootstrap: [AppComponent]
})

export class RootModule { }
