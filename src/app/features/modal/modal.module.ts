import {NgModule} from "ngjs-core";
import {RouterModule} from "ngjs-core/router";
import {NgbModalModule} from "ngb-js/modal";
import { NgbNavModule } from "ngb-js/nav";
import { NgbCollapseModule } from "ngb-js/collapse";

import {routes} from "@/features/modal/modal.routes";
import {ModalComponentContentComponent} from "@/features/modal/components/modal-component-content/modal-component-content.component";
import {ModalDefaultComponent} from "@/features/modal/components/modal-default/modal-default.component";
import {ModalDemoContentComponent} from "@/features/modal/components/modal-demo-content/modal-demo-content.component";
import {ModalFocusComponent} from "@/features/modal/components/modal-focus/modal-focus.component";
import {ModalFocusContentComponent} from "@/features/modal/components/modal-focus-content/modal-focus-content.component";
import {ModalGlobalComponent} from "@/features/modal/components/modal-global/modal-global.component";
import {ModalOptionsComponent} from "@/features/modal/components/modal-options/modal-options.component";
import {ModalStackedComponent} from "@/features/modal/components/modal-stacked/modal-stacked.component";
import {ModalStackedContentComponent} from "@/features/modal/components/modal-stacked-content/modal-stacked-content.component";
import {ModalUpdatableComponent} from "@/features/modal/components/modal-updatable/modal-updatable.component";
import {ModalUpdatableContentComponent} from "@/features/modal/components/modal-updatable-content/modal-updatable-content.component";

@NgModule({
    id: "docs.modal",
    declarations: [
        ModalComponentContentComponent,
        ModalDefaultComponent,
        ModalDemoContentComponent,
        ModalFocusComponent,
        ModalFocusContentComponent,
        ModalGlobalComponent,
        ModalOptionsComponent,
        ModalStackedComponent,
        ModalStackedContentComponent,
        ModalUpdatableComponent,
        ModalUpdatableContentComponent,
    ],
    imports: [
        NgbModalModule,
        NgbNavModule,
        NgbCollapseModule,
        RouterModule.forChild(routes),
    ],
})
export class ModalModule {}
