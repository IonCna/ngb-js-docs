import {NgModule} from "ngjs-core";

import { NgbAccordionModule } from "ngb-js/accordion"
import { NgbCollapseModule } from "ngb-js/collapse"
import { NgbNavModule } from "ngb-js/nav"
import { NgbTooltipModule } from "ngb-js/tooltip"

import { RouterModule } from "ngjs-core/router"

import { AccordionContentComponent } from "@/features/accordion/components/accordion-content/accordion-content.component"
import { AccordionCustomHeaderComponent } from "@/features/accordion/components/accordion-custom-header/accordion-custom-header.component"
import { AccordionGlobalComponent } from "@/features/accordion/components/accordion-global/accordion-global.component"
import { AccordionSimpleComponent } from "@/features/accordion/components/accordion-simple/accordion-simple.component"
import { AccordionTogglePanelsComponent } from "@/features/accordion/components/accordion-toggle-panels/accordion-toggle-panels.component"
import { OnePanelAccordionComponent } from "@/features/accordion/components/one-panel-accordion/one-panel-accordion.component"

import {routes} from "@/features/accordion/accordion.routes.ts";

@NgModule({
    id: "docs.accordion",
    declarations: [
        AccordionContentComponent,
        AccordionCustomHeaderComponent,
        AccordionGlobalComponent,
        AccordionSimpleComponent,
        AccordionTogglePanelsComponent,
        OnePanelAccordionComponent,
    ],
    imports: [
        NgbAccordionModule,
        NgbTooltipModule,
        NgbCollapseModule,
        NgbNavModule,
        RouterModule.forChild(routes)
    ],
})

export class AccordionModule { }