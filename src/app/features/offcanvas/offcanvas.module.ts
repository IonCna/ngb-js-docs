import {NgModule} from "ngjs-core";
import {RouterModule} from "ngjs-core/router";
import {NgbOffcanvasModule} from "ngb-js/offcanvas";

import { NgbNavModule } from "ngb-js/nav";
import { NgbCollapseModule } from "ngb-js/collapse";

import {routes} from "@/features/offcanvas/offcanvas.routes";
import {OffcanvasComponentContentComponent} from "@/features/offcanvas/components/offcanvas-component-content/offcanvas-component-content.component";
import {OffcanvasDefaultComponent} from "@/features/offcanvas/components/offcanvas-default/offcanvas-default.component";
import {OffcanvasDemoContentComponent} from "@/features/offcanvas/components/offcanvas-demo-content/offcanvas-demo-content.component";
import {OffcanvasFocusComponent} from "@/features/offcanvas/components/offcanvas-focus/offcanvas-focus.component";
import {OffcanvasFocusContentComponent} from "@/features/offcanvas/components/offcanvas-focus-content/offcanvas-focus-content.component";
import {OffcanvasGlobalComponent} from "@/features/offcanvas/components/offcanvas-global/offcanvas-global.component";
import {OffcanvasOptionsComponent} from "@/features/offcanvas/components/offcanvas-options/offcanvas-options.component";

@NgModule({
    id: "docs.offcanvas",
    declarations: [
        OffcanvasComponentContentComponent,
        OffcanvasDefaultComponent,
        OffcanvasDemoContentComponent,
        OffcanvasFocusComponent,
        OffcanvasFocusContentComponent,
        OffcanvasGlobalComponent,
        OffcanvasOptionsComponent,
    ],
    imports: [
        NgbOffcanvasModule,
        NgbNavModule,
        NgbCollapseModule,
        RouterModule.forChild(routes),
    ],
})
export class OffcanvasModule {}
