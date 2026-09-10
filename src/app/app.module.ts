import angular from 'angular'
import router from "@uirouter/angularjs"
import { NgbModule } from "ngb-js/compat";
import { AppComponent } from "@/app.component"

import { CoreModule } from "@/core/core.module"
import { SharedModule } from "@/shared/shared.module"
import { FeaturesModule } from "@/features/features.module"
import {NgModule, CoreModule as NgCoreModule} from "ngjs-core";
import { routes } from "@/app.routes"
import {RouterModule} from "ngjs-core/router";

export const AppModule = angular.module('docs', [
    router,
    NgbModule.name,
    SharedModule.name
])

@NgModule({
    id: "root",
    controllerAs: "$",
    declarations: [AppComponent],
    imports: [
        AppModule,
        NgCoreModule,
        CoreModule,
        FeaturesModule,
        RouterModule.forRoot(routes),
    ],
    bootstrap: [AppComponent]
})

export class RootModule { }
