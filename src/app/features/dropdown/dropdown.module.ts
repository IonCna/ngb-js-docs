import {NgModule} from "ngjs-core";
import {RouterModule} from "ngjs-core/router";
import {NgbDropdownModule} from "ngb-js/dropdown";

import { NgbCollapseModule } from "ngb-js/collapse";
import { NgbNavModule } from "ngb-js/nav";


import {routes} from "@/features/dropdown/dropdown.routes";
import {DropdownBodyComponent} from "@/features/dropdown/components/dropdown-body/dropdown-body.component";
import {DropdownButtonGroupsComponent} from "@/features/dropdown/components/dropdown-button-groups/dropdown-button-groups.component";
import {DropdownDisabledItemsComponent} from "@/features/dropdown/components/dropdown-disabled-items/dropdown-disabled-items.component";
import {DropdownFormComponent} from "@/features/dropdown/components/dropdown-form/dropdown-form.component";
import {DropdownGlobalComponent} from "@/features/dropdown/components/dropdown-global/dropdown-global.component";
import {DropdownNavbarComponent} from "@/features/dropdown/components/dropdown-navbar/dropdown-navbar.component";
import {ManualDropdownComponent} from "@/features/dropdown/components/manual-dropdown/manual-dropdown.component";
import {SimpleDropdownComponent} from "@/features/dropdown/components/simple-dropdown/simple-dropdown.component";

@NgModule({
    id: "docs.dropdown",
    declarations: [
        DropdownBodyComponent,
        DropdownButtonGroupsComponent,
        DropdownDisabledItemsComponent,
        DropdownFormComponent,
        DropdownGlobalComponent,
        DropdownNavbarComponent,
        ManualDropdownComponent,
        SimpleDropdownComponent,
    ],
    imports: [
        NgbCollapseModule,
        NgbNavModule,
        NgbDropdownModule,
        RouterModule.forChild(routes),
    ],
})
export class DropdownModule {}
