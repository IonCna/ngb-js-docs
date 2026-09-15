import {NgModule} from "ngjs-core";
import {RouterModule} from "ngjs-core/router";
import {routes} from "@/features/alert/alert.routes";

import { AlertCloseableComponent } from "@/features/alert/components/alert-closeable/alert-closeable.component"
import { AlertCustomComponent } from "@/features/alert/components/alert-custom/alert-custom.component"
import { AlertGlobalComponent } from "@/features/alert/components/alert-global/alert-global.component"

import { NgbAlertModule } from "ngb-js/alert"
import { NgbNavModule } from "ngb-js/nav"
import { NgbCollapseModule } from "ngb-js/collapse"

@NgModule({
    id: "docs.alert",
    declarations: [
        AlertCloseableComponent,
        AlertCustomComponent,
        AlertGlobalComponent,
    ],
    imports: [
        NgbAlertModule,
        NgbNavModule,
        NgbCollapseModule,
        RouterModule.forChild(routes),
    ]
})
export class AlertModule {}