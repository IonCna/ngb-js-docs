import { NgModule } from "ngjs-core";
import { RouterModule } from "ngjs-core/router"
import { routes } from "@/features/lib/lib.routes"


import { AccordionContentComponent } from "@/features/lib/components/accordion-content/accordion-content.component"
import { AccordionCustomHeaderComponent } from "@/features/lib/components/accordion-custom-header/accordion-custom-header.component"
import { AccordionGlobalComponent } from "@/features/lib/components/accordion-global/accordion-global.component"
import { AccordionSimpleComponent } from "@/features/lib/components/accordion-simple/accordion-simple.component"
import { AccordionTogglePanelsComponent } from "@/features/lib/components/accordion-toggle-panels/accordion-toggle-panels.component"
import { OnePanelAccordionComponent } from "@/features/lib/components/one-panel-accordion/one-panel-accordion.component"
import { SelfClosingAlertComponent } from "@/features/lib/components/self-closing-alert/self-closing-alert.component"
import { SimpleAlertComponent } from "@/features/lib/components/simple-alert/simple-alert.component"
import { CarouselControlsComponent } from "@/features/lib/components/carousel-controls/carousel-controls.component"
import { CarouselGlobalComponent } from "@/features/lib/components/carousel-global/carousel-global.component"
import { CarouselKeyboardComponent } from "@/features/lib/components/carousel-keyboard/carousel-keyboard.component"
import { CarouselSimpleComponent } from "@/features/lib/components/carousel-simple/carousel-simple.component"
import { HorizontalCollapseComponent } from "@/features/lib/components/horizontal-collapse/horizontal-collapse.component"
import { NavbarCollapseComponent } from "@/features/lib/components/navbar-collapse/navbar-collapse.component"
import { SimpleCollapseComponent } from "@/features/lib/components/simple-collapse/simple-collapse.component"
import { DropdownBodyComponent } from "@/features/lib/components/dropdown-body/dropdown-body.component"
import { DropdownButtonGroupsComponent } from "@/features/lib/components/dropdown-button-groups/dropdown-button-groups.component"
import { DropdownDisabledItemsComponent } from "@/features/lib/components/dropdown-disabled-items/dropdown-disabled-items.component"
import { DropdownFormComponent } from "@/features/lib/components/dropdown-form/dropdown-form.component"
import { DropdownGlobalComponent } from "@/features/lib/components/dropdown-global/dropdown-global.component"
import { DropdownNavbarComponent } from "@/features/lib/components/dropdown-navbar/dropdown-navbar.component"
import { ManualDropdownComponent } from "@/features/lib/components/manual-dropdown/manual-dropdown.component"
import { SimpleDropdownComponent } from "@/features/lib/components/simple-dropdown/simple-dropdown.component"
import { ModalComponentContentComponent } from "@/features/lib/components/modal-component-content/modal-component-content.component"
import { ModalDefaultComponent } from "@/features/lib/components/modal-default/modal-default.component"
import { ModalDemoContentComponent } from "@/features/lib/components/modal-demo-content/modal-demo-content.component"
import { ModalFocusComponent } from "@/features/lib/components/modal-focus/modal-focus.component"
import { ModalFocusContentComponent } from "@/features/lib/components/modal-focus-content/modal-focus-content.component"
import { ModalGlobalComponent } from "@/features/lib/components/modal-global/modal-global.component"
import { ModalOptionsComponent } from "@/features/lib/components/modal-options/modal-options.component"
import { ModalStackedComponent } from "@/features/lib/components/modal-stacked/modal-stacked.component"
import { ModalStackedContentComponent } from "@/features/lib/components/modal-stacked-content/modal-stacked-content.component"
import { ModalUpdatableComponent } from "@/features/lib/components/modal-updatable/modal-updatable.component"
import { ModalUpdatableContentComponent } from "@/features/lib/components/modal-updatable-content/modal-updatable-content.component"
import { AlternativeNavComponent } from "@/features/lib/components/alternative-nav/alternative-nav.component"
import { CustomNavComponent } from "@/features/lib/components/custom-nav/custom-nav.component"
import { DynamicNavComponent } from "@/features/lib/components/dynamic-nav/dynamic-nav.component"
import { KeepContentNavComponent } from "@/features/lib/components/keep-content-nav/keep-content-nav.component"
import { NavGlobalComponent } from "@/features/lib/components/nav-global/nav-global.component"
import { SelectingNavComponent } from "@/features/lib/components/selecting-nav/selecting-nav.component"
import { SimpleNavComponent } from "@/features/lib/components/simple-nav/simple-nav.component"
import { VerticalNavComponent } from "@/features/lib/components/vertical-nav/vertical-nav.component"
import { OffcanvasComponentContentComponent } from "@/features/lib/components/offcanvas-component-content/offcanvas-component-content.component"
import { OffcanvasDefaultComponent } from "@/features/lib/components/offcanvas-default/offcanvas-default.component"
import { OffcanvasDemoContentComponent } from "@/features/lib/components/offcanvas-demo-content/offcanvas-demo-content.component"
import { OffcanvasFocusComponent } from "@/features/lib/components/offcanvas-focus/offcanvas-focus.component"
import { OffcanvasFocusContentComponent } from "@/features/lib/components/offcanvas-focus-content/offcanvas-focus-content.component"
import { OffcanvasGlobalComponent } from "@/features/lib/components/offcanvas-global/offcanvas-global.component"
import { OffcanvasOptionsComponent } from "@/features/lib/components/offcanvas-options/offcanvas-options.component"
import { AdvancedPaginationComponent } from "@/features/lib/components/advanced-pagination/advanced-pagination.component"
import { BasicPaginationComponent } from "@/features/lib/components/basic-pagination/basic-pagination.component"
import { CustomPaginationComponent } from "@/features/lib/components/custom-pagination/custom-pagination.component"
import { DisabledPaginationComponent } from "@/features/lib/components/disabled-pagination/disabled-pagination.component"
import { PaginationAlignmentComponent } from "@/features/lib/components/pagination-alignment/pagination-alignment.component"
import { PaginationGlobalComponent } from "@/features/lib/components/pagination-global/pagination-global.component"
import { PaginationSizeComponent } from "@/features/lib/components/pagination-size/pagination-size.component"
import { BasicDatepickerComponent } from "@/features/lib/components/basic-datepicker/basic-datepicker.component"
import { DatepickerCustomAdapterComponent } from "@/features/lib/components/datepicker-custom-adapter/datepicker-custom-adapter.component"
import { DatepickerCustomDayComponent } from "@/features/lib/components/datepicker-custom-day/datepicker-custom-day.component"
import { DatepickerCustomMonthComponent } from "@/features/lib/components/datepicker-custom-month/datepicker-custom-month.component"
import { DatepickerFooterComponent } from "@/features/lib/components/datepicker-footer/datepicker-footer.component"
import { DatepickerGlobalComponent } from "@/features/lib/components/datepicker-global/datepicker-global.component"
import { DatepickerI18nComponent } from "@/features/lib/components/datepicker-i18n/datepicker-i18n.component"
import { DatepickerKeyboardComponent } from "@/features/lib/components/datepicker-keyboard/datepicker-keyboard.component"
import { DatepickerPositionTargetComponent } from "@/features/lib/components/datepicker-position-target/datepicker-position-target.component"
import { DisabledDatepickerComponent } from "@/features/lib/components/disabled-datepicker/disabled-datepicker.component"
import { MultipleMonthsDatepickerComponent } from "@/features/lib/components/multiple-months-datepicker/multiple-months-datepicker.component"
import { PopupDatepickerComponent } from "@/features/lib/components/popup-datepicker/popup-datepicker.component"
import { RangeDatepickerComponent } from "@/features/lib/components/range-datepicker/range-datepicker.component"
import { RangePopupDatepickerComponent } from "@/features/lib/components/range-popup-datepicker/range-popup-datepicker.component"
import { PopoverAutocloseComponent } from "@/features/lib/components/popover-autoclose/popover-autoclose.component"
import { PopoverBodyComponent } from "@/features/lib/components/popover-body/popover-body.component"
import { PopoverContextComponent } from "@/features/lib/components/popover-context/popover-context.component"
import { PopoverCustomClassComponent } from "@/features/lib/components/popover-custom-class/popover-custom-class.component"
import { PopoverCustomTargetComponent } from "@/features/lib/components/popover-custom-target/popover-custom-target.component"
import { PopoverDelaysComponent } from "@/features/lib/components/popover-delays/popover-delays.component"
import { PopoverEventsComponent } from "@/features/lib/components/popover-events/popover-events.component"
import { PopoverGlobalComponent } from "@/features/lib/components/popover-global/popover-global.component"
import { PopoverManualControlComponent } from "@/features/lib/components/popover-manual-control/popover-manual-control.component"
import { PopoverPlacementsComponent } from "@/features/lib/components/popover-placements/popover-placements.component"
import { PopoverTemplateComponent } from "@/features/lib/components/popover-template/popover-template.component"
import { PopoverTriggersComponent } from "@/features/lib/components/popover-triggers/popover-triggers.component"
import { ContextualTextProgressbarComponent } from "@/features/lib/components/contextual-text-progressbar/contextual-text-progressbar.component"
import { CustomLabelsProgressbarComponent } from "@/features/lib/components/custom-labels-progressbar/custom-labels-progressbar.component"
import { ProgressBarsStackedComponent } from "@/features/lib/components/progress-bars-stacked/progress-bars-stacked.component"
import { ProgressHeightComponent } from "@/features/lib/components/progress-height/progress-height.component"
import { ProgressbarGlobalComponent } from "@/features/lib/components/progressbar-global/progressbar-global.component"
import { SimpleProgressbarComponent } from "@/features/lib/components/simple-progressbar/simple-progressbar.component"
import { StripedProgressBarComponent } from "@/features/lib/components/striped-progress-bar/striped-progress-bar.component"
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
        AccordionContentComponent,
        AccordionCustomHeaderComponent,
        AccordionGlobalComponent,
        AccordionSimpleComponent,
        AccordionTogglePanelsComponent,
        OnePanelAccordionComponent,
        SelfClosingAlertComponent,
        SimpleAlertComponent,
        CarouselControlsComponent,
        CarouselGlobalComponent,
        CarouselKeyboardComponent,
        CarouselSimpleComponent,
        HorizontalCollapseComponent,
        NavbarCollapseComponent,
        SimpleCollapseComponent,
        DropdownBodyComponent,
        DropdownButtonGroupsComponent,
        DropdownDisabledItemsComponent,
        DropdownFormComponent,
        DropdownGlobalComponent,
        DropdownNavbarComponent,
        ManualDropdownComponent,
        SimpleDropdownComponent,
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
        AlternativeNavComponent,
        CustomNavComponent,
        DynamicNavComponent,
        KeepContentNavComponent,
        NavGlobalComponent,
        SelectingNavComponent,
        SimpleNavComponent,
        VerticalNavComponent,
        OffcanvasComponentContentComponent,
        OffcanvasDefaultComponent,
        OffcanvasDemoContentComponent,
        OffcanvasFocusComponent,
        OffcanvasFocusContentComponent,
        OffcanvasGlobalComponent,
        OffcanvasOptionsComponent,
        AdvancedPaginationComponent,
        BasicPaginationComponent,
        CustomPaginationComponent,
        DisabledPaginationComponent,
        PaginationAlignmentComponent,
        PaginationGlobalComponent,
        PaginationSizeComponent,
        BasicDatepickerComponent,
        DatepickerCustomAdapterComponent,
        DatepickerCustomDayComponent,
        DatepickerCustomMonthComponent,
        DatepickerFooterComponent,
        DatepickerGlobalComponent,
        DatepickerI18nComponent,
        DatepickerKeyboardComponent,
        DatepickerPositionTargetComponent,
        DisabledDatepickerComponent,
        MultipleMonthsDatepickerComponent,
        PopupDatepickerComponent,
        RangeDatepickerComponent,
        RangePopupDatepickerComponent,
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
        ContextualTextProgressbarComponent,
        CustomLabelsProgressbarComponent,
        ProgressBarsStackedComponent,
        ProgressHeightComponent,
        ProgressbarGlobalComponent,
        SimpleProgressbarComponent,
        StripedProgressBarComponent,
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
