import {NgModule} from "ngjs-core";
import {RouterModule} from "ngjs-core/router";
import {routes} from "@/features/alert/alert.routes";

import { AlertCloseableComponent } from "@/features/alert/components/alert-closeable/alert-closeable.component"
import { AlertCustomComponent } from "@/features/alert/components/alert-custom/alert-custom.component"
import { AlertGlobalComponent } from "@/features/alert/components/alert-global/alert-global.component"
import { SelfClosingAlertComponent } from "@/features/alert/components/self-closing-alert/self-closing-alert.component"

import { NgbAlertModule } from "ngb-js/alert"
import { NgbNavModule } from "ngb-js/nav"
import { NgbCollapseModule } from "ngb-js/collapse"
import {SimpleAlertComponent} from "@/features/alert/components/simple-alert/simple-alert.component.ts";

@NgModule({
    id: "docs.alert",
    declarations: [
        AlertCloseableComponent,
        AlertCustomComponent,
        AlertGlobalComponent,
        SelfClosingAlertComponent,
        SimpleAlertComponent,
    ],
    imports: [
        NgbAlertModule,
        NgbNavModule,
        NgbCollapseModule,
        RouterModule.forChild(routes),
    ]
})
export class AlertModule {}