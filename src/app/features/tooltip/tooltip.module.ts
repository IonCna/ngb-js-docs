import { NgModule } from "ngjs-core";
import { RouterModule } from "ngjs-core/router";
import { NgbTooltipModule } from "ngb-js/tooltip";
import { NgbScrollSpyModule } from "ngb-js/scrollspy";
import { NgbNavModule } from "ngb-js/nav";
import { NgbCollapseModule } from "ngb-js/collapse";
import { routes } from "@/features/tooltip/tooltip.routes";
import { TooltipAutocloseComponent } from "@/features/tooltip/components/tooltip-autoclose/tooltip-autoclose.component";
import { TooltipBodyComponent } from "@/features/tooltip/components/tooltip-body/tooltip-body.component";
import { TooltipContextComponent } from "@/features/tooltip/components/tooltip-context/tooltip-context.component";
import { TooltipCustomClassComponent } from "@/features/tooltip/components/tooltip-custom-class/tooltip-custom-class.component";
import { TooltipCustomTargetComponent } from "@/features/tooltip/components/tooltip-custom-target/tooltip-custom-target.component";
import { TooltipDelaysComponent } from "@/features/tooltip/components/tooltip-delays/tooltip-delays.component";
import { TooltipGlobalComponent } from "@/features/tooltip/components/tooltip-global/tooltip-global.component";
import { TooltipPlacementsComponent } from "@/features/tooltip/components/tooltip-placements/tooltip-placements.component";
import { TooltipTemplateComponent } from "@/features/tooltip/components/tooltip-template/tooltip-template.component";
import { TooltipTriggersComponent } from "@/features/tooltip/components/tooltip-triggers/tooltip-triggers.component";

@NgModule({ declarations: [TooltipAutocloseComponent, TooltipBodyComponent, TooltipContextComponent, TooltipCustomClassComponent, TooltipCustomTargetComponent, TooltipDelaysComponent, TooltipGlobalComponent, TooltipPlacementsComponent, TooltipTemplateComponent, TooltipTriggersComponent], imports: [NgbTooltipModule, NgbScrollSpyModule, NgbNavModule, NgbCollapseModule, RouterModule.forChild(routes)] })
export class TooltipModule {}
