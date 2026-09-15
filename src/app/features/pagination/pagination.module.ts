import {NgModule} from "ngjs-core";
import {RouterModule} from "ngjs-core/router";
import {NgbPaginationModule} from "ngb-js/pagination";

import {routes} from "@/features/pagination/pagination.routes";
import {AdvancedPaginationComponent} from "@/features/pagination/components/advanced-pagination/advanced-pagination.component";
import {BasicPaginationComponent} from "@/features/pagination/components/basic-pagination/basic-pagination.component";
import {CustomPaginationComponent} from "@/features/pagination/components/custom-pagination/custom-pagination.component";
import {DisabledPaginationComponent} from "@/features/pagination/components/disabled-pagination/disabled-pagination.component";
import {PaginationAlignmentComponent} from "@/features/pagination/components/pagination-alignment/pagination-alignment.component";
import {PaginationGlobalComponent} from "@/features/pagination/components/pagination-global/pagination-global.component";
import {PaginationSizeComponent} from "@/features/pagination/components/pagination-size/pagination-size.component";

import { NgbCollapseModule } from "ngb-js/collapse"
import { NgbNavModule } from "ngb-js/nav"

@NgModule({
    id: "docs.pagination",
    declarations: [
        AdvancedPaginationComponent,
        BasicPaginationComponent,
        CustomPaginationComponent,
        DisabledPaginationComponent,
        PaginationAlignmentComponent,
        PaginationGlobalComponent,
        PaginationSizeComponent,
    ],
    imports: [
        NgbCollapseModule,
        NgbNavModule,
        NgbPaginationModule,
        RouterModule.forChild(routes),
    ],
})
export class PaginationModule {}
