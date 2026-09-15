import { NgModule } from "ngjs-core";
import { RouterModule } from "ngjs-core/router"
import { routes } from "@/features/lib/lib.routes"

import { BasicRatingComponent } from "@/features/lib/components/basic-rating/basic-rating.component"
import { RatingCustomTemplateComponent } from "@/features/lib/components/rating-custom-template/rating-custom-template.component"
import { RatingDecimalComponent } from "@/features/lib/components/rating-decimal/rating-decimal.component"
import { RatingEventsComponent } from "@/features/lib/components/rating-events/rating-events.component"
import { RatingFormComponent } from "@/features/lib/components/rating-form/rating-form.component"
import { RatingGlobalComponent } from "@/features/lib/components/rating-global/rating-global.component"
import { BasicScrollspyComponent } from "@/features/lib/components/basic-scrollspy/basic-scrollspy.component"
import { NavbarScrollspyComponent } from "@/features/lib/components/navbar-scrollspy/navbar-scrollspy.component"
import { NestedScrollspyComponent } from "@/features/lib/components/nested-scrollspy/nested-scrollspy.component"
import { ScrollspyMenuItemsComponent } from "@/features/lib/components/scrollspy-menu-items/scrollspy-menu-items.component"
import { ScrollspyServiceDemoComponent } from "@/features/lib/components/scrollspy-service-demo/scrollspy-service-demo.component"
import { BasicTimepickerComponent } from "@/features/lib/components/basic-timepicker/basic-timepicker.component"
import { MeridianTimepickerComponent } from "@/features/lib/components/meridian-timepicker/meridian-timepicker.component"
import { SecondsTimepickerComponent } from "@/features/lib/components/seconds-timepicker/seconds-timepicker.component"
import { SpinnersTimepickerComponent } from "@/features/lib/components/spinners-timepicker/spinners-timepicker.component"
import { TimepickerCustomAdapterComponent } from "@/features/lib/components/timepicker-custom-adapter/timepicker-custom-adapter.component"
import { TimepickerCustomStepsComponent } from "@/features/lib/components/timepicker-custom-steps/timepicker-custom-steps.component"
import { GreekTimepickerI18n, TimepickerI18nComponent } from "@/features/lib/components/timepicker-i18n/timepicker-i18n.component"
import { TimepickerValidationComponent, TimepickerLunchValidatorDirective } from "@/features/lib/components/timepicker-validation/timepicker-validation.component"
import { CloseableToastComponent } from "@/features/lib/components/closeable-toast/closeable-toast.component"
import { InlineToastComponent } from "@/features/lib/components/inline-toast/inline-toast.component"
import { PreventAutohideToastComponent } from "@/features/lib/components/prevent-autohide-toast/prevent-autohide-toast.component"
import { TemplateHeaderToastComponent } from "@/features/lib/components/template-header-toast/template-header-toast.component"
import { DocsToastService, ToastManagementComponent } from "@/features/lib/components/toast-management/toast-management.component"
import { TooltipAutocloseComponent } from "@/features/lib/components/tooltip-autoclose/tooltip-autoclose.component"
import { TooltipBodyComponent } from "@/features/lib/components/tooltip-body/tooltip-body.component"
import { TooltipContextComponent } from "@/features/lib/components/tooltip-context/tooltip-context.component"
import { TooltipCustomClassComponent } from "@/features/lib/components/tooltip-custom-class/tooltip-custom-class.component"
import { TooltipCustomTargetComponent } from "@/features/lib/components/tooltip-custom-target/tooltip-custom-target.component"
import { TooltipDelaysComponent } from "@/features/lib/components/tooltip-delays/tooltip-delays.component"
import { TooltipGlobalComponent } from "@/features/lib/components/tooltip-global/tooltip-global.component"
import { TooltipPlacementsComponent } from "@/features/lib/components/tooltip-placements/tooltip-placements.component"
import { TooltipTemplateComponent } from "@/features/lib/components/tooltip-template/tooltip-template.component"
import { TooltipTriggersComponent } from "@/features/lib/components/tooltip-triggers/tooltip-triggers.component"
import { ExactTypeaheadComponent } from "@/features/lib/components/exact-typeahead/exact-typeahead.component"
import { FocusTypeaheadComponent } from "@/features/lib/components/focus-typeahead/focus-typeahead.component"
import { FormattedTypeaheadComponent } from "@/features/lib/components/formatted-typeahead/formatted-typeahead.component"
import { NonEditableTypeaheadComponent } from "@/features/lib/components/non-editable-typeahead/non-editable-typeahead.component"
import { SimpleTypeaheadComponent } from "@/features/lib/components/simple-typeahead/simple-typeahead.component"
import { TemplateResultsTypeaheadComponent } from "@/features/lib/components/template-results-typeahead/template-results-typeahead.component"
import { TypeaheadGlobalComponent } from "@/features/lib/components/typeahead-global/typeahead-global.component"
import { WikipediaSearchService, WikipediaTypeaheadComponent } from "@/features/lib/components/wikipedia-typeahead/wikipedia-typeahead.component"

@NgModule({
    id: "docs.lib",
    controllerAs: "example",
    imports: [
        RouterModule.forChild(routes),
    ],
    providers: [
        DocsToastService,
        WikipediaSearchService,
        GreekTimepickerI18n,
    ],
    declarations: [
        BasicRatingComponent,
        RatingCustomTemplateComponent,
        RatingDecimalComponent,
        RatingEventsComponent,
        RatingFormComponent,
        RatingGlobalComponent,
        BasicScrollspyComponent,
        NavbarScrollspyComponent,
        NestedScrollspyComponent,
        ScrollspyMenuItemsComponent,
        ScrollspyServiceDemoComponent,
        BasicTimepickerComponent,
        MeridianTimepickerComponent,
        SecondsTimepickerComponent,
        SpinnersTimepickerComponent,
        TimepickerCustomAdapterComponent,
        TimepickerCustomStepsComponent,
        TimepickerI18nComponent,
        TimepickerValidationComponent,
        TimepickerLunchValidatorDirective,
        CloseableToastComponent,
        InlineToastComponent,
        PreventAutohideToastComponent,
        TemplateHeaderToastComponent,
        ToastManagementComponent,
        TooltipAutocloseComponent,
        TooltipBodyComponent,
        TooltipContextComponent,
        TooltipCustomClassComponent,
        TooltipCustomTargetComponent,
        TooltipDelaysComponent,
        TooltipGlobalComponent,
        TooltipPlacementsComponent,
        TooltipTemplateComponent,
        TooltipTriggersComponent,
        ExactTypeaheadComponent,
        FocusTypeaheadComponent,
        FormattedTypeaheadComponent,
        NonEditableTypeaheadComponent,
        SimpleTypeaheadComponent,
        TemplateResultsTypeaheadComponent,
        TypeaheadGlobalComponent,
        WikipediaTypeaheadComponent,
    ],
})
export class LibModule {}
