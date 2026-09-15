import {NgModule} from "ngjs-core";
import {RouterModule} from "ngjs-core/router";
import {NgbPopoverModule} from "ngb-js/popover";

import { NgbCollapseModule } from "ngb-js/collapse";
import { NgbNavModule } from "ngb-js/nav";

import {routes} from "@/features/popover/popover.routes";
import {PopoverAutocloseComponent} from "@/features/popover/components/popover-autoclose/popover-autoclose.component";
import {PopoverBodyComponent} from "@/features/popover/components/popover-body/popover-body.component";
import {PopoverContextComponent} from "@/features/popover/components/popover-context/popover-context.component";
import {PopoverCustomClassComponent} from "@/features/popover/components/popover-custom-class/popover-custom-class.component";
import {PopoverCustomTargetComponent} from "@/features/popover/components/popover-custom-target/popover-custom-target.component";
import {PopoverDelaysComponent} from "@/features/popover/components/popover-delays/popover-delays.component";
import {PopoverEventsComponent} from "@/features/popover/components/popover-events/popover-events.component";
import {PopoverGlobalComponent} from "@/features/popover/components/popover-global/popover-global.component";
import {PopoverManualControlComponent} from "@/features/popover/components/popover-manual-control/popover-manual-control.component";
import {PopoverPlacementsComponent} from "@/features/popover/components/popover-placements/popover-placements.component";
import {PopoverTemplateComponent} from "@/features/popover/components/popover-template/popover-template.component";
import {PopoverTriggersComponent} from "@/features/popover/components/popover-triggers/popover-triggers.component";

@NgModule({
    id: "docs.popover",
    declarations: [
        PopoverAutocloseComponent,
        PopoverBodyComponent,
        PopoverContextComponent,
        PopoverCustomClassComponent,
        PopoverCustomTargetComponent,
        PopoverDelaysComponent,
        PopoverEventsComponent,
        PopoverGlobalComponent,
        PopoverManualControlComponent,
        PopoverPlacementsComponent,
        PopoverTemplateComponent,
        PopoverTriggersComponent,
    ],
    imports: [
        NgbCollapseModule,
        NgbNavModule,
        NgbPopoverModule,
        RouterModule.forChild(routes),
    ],
})
export class PopoverModule {}
