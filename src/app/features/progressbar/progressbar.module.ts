import {NgModule} from "ngjs-core";
import {RouterModule} from "ngjs-core/router";
import {NgbProgressbarModule} from "ngb-js/progressbar";

import { NgbNavModule } from "ngb-js/nav";
import { NgbCollapseModule } from "ngb-js/collapse";


import {routes} from "@/features/progressbar/progressbar.routes";
import {ContextualTextProgressbarComponent} from "@/features/progressbar/components/contextual-text-progressbar/contextual-text-progressbar.component";
import {CustomLabelsProgressbarComponent} from "@/features/progressbar/components/custom-labels-progressbar/custom-labels-progressbar.component";
import {ProgressBarsStackedComponent} from "@/features/progressbar/components/progress-bars-stacked/progress-bars-stacked.component";
import {ProgressHeightComponent} from "@/features/progressbar/components/progress-height/progress-height.component";
import {ProgressbarGlobalComponent} from "@/features/progressbar/components/progressbar-global/progressbar-global.component";
import {SimpleProgressbarComponent} from "@/features/progressbar/components/simple-progressbar/simple-progressbar.component";
import {StripedProgressBarComponent} from "@/features/progressbar/components/striped-progress-bar/striped-progress-bar.component";

@NgModule({
    id: "docs.progressbar",
    declarations: [
        ContextualTextProgressbarComponent,
        CustomLabelsProgressbarComponent,
        ProgressBarsStackedComponent,
        ProgressHeightComponent,
        ProgressbarGlobalComponent,
        SimpleProgressbarComponent,
        StripedProgressBarComponent,
    ],
    imports: [
        NgbProgressbarModule,
        NgbNavModule,
        NgbCollapseModule,
        RouterModule.forChild(routes),
    ],
})
export class ProgressbarModule {}
