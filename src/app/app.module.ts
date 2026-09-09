import angular from 'angular'
import router from "@uirouter/angularjs"
import { NgbModule } from "ngb-js";
import { CoreModule as NgJsCoreModule } from "ngjs-core"
import { AppComponent } from "@/app.component"
import { routing } from "@/app.routes"

import { CoreModule } from "@/core/core.module"
import { SharedModule } from "@/shared/shared.module"
import { FeaturesModule } from "@/features/features.module"

export const AppModule = angular.module('docs', [
    router,
    CoreModule.name,
    NgJsCoreModule.name,
    NgbModule.name,
    SharedModule.name,
    FeaturesModule.name,
])

AppModule.component(AppComponent.$name, AppComponent.$factory)
AppModule.config(routing)
