import angular from "angular";

import { AlertCloseableComponent } from "@/features/lib/components/alert-closeable/alert-closeable.component"
import { AlertCustomComponent } from "@/features/lib/components/alert-custom/alert-custom.component"
import { AlertGlobalComponent } from "@/features/lib/components/alert-global/alert-global.component"
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
import { TimepickerValidationComponent, timepickerLunchValidator } from "@/features/lib/components/timepicker-validation/timepicker-validation.component"
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
import { AlertApiPageComponent } from "@/features/lib/pages/alert-api-page/alert-api-page.component"
import { AlertExamplesPageComponent } from "@/features/lib/pages/alert-examples-page/alert-examples-page.component"
import { AccordionApiPageComponent } from "@/features/lib/pages/accordion-api-page/accordion-api-page.component"
import { AccordionExamplesPageComponent } from "@/features/lib/pages/accordion-examples-page/accordion-examples-page.component"
import { CarouselApiPageComponent } from "@/features/lib/pages/carousel-api-page/carousel-api-page.component"
import { CarouselExamplesPageComponent } from "@/features/lib/pages/carousel-examples-page/carousel-examples-page.component"
import { CollapseApiPageComponent } from "@/features/lib/pages/collapse-api-page/collapse-api-page.component"
import { CollapseExamplesPageComponent } from "@/features/lib/pages/collapse-examples-page/collapse-examples-page.component"
import { DatepickerApiPageComponent } from "@/features/lib/pages/datepicker-api-page/datepicker-api-page.component"
import { DatepickerCalendarsPageComponent } from "@/features/lib/pages/datepicker-calendars-page/datepicker-calendars-page.component"
import { DatepickerExamplesPageComponent } from "@/features/lib/pages/datepicker-examples-page/datepicker-examples-page.component"
import { DropdownApiPageComponent } from "@/features/lib/pages/dropdown-api-page/dropdown-api-page.component"
import { DropdownExamplesPageComponent } from "@/features/lib/pages/dropdown-examples-page/dropdown-examples-page.component"
import { ModalApiPageComponent } from "@/features/lib/pages/modal-api-page/modal-api-page.component"
import { ModalExamplesPageComponent } from "@/features/lib/pages/modal-examples-page/modal-examples-page.component"
import { NavApiPageComponent } from "@/features/lib/pages/nav-api-page/nav-api-page.component"
import { NavExamplesPageComponent } from "@/features/lib/pages/nav-examples-page/nav-examples-page.component"
import { OffcanvasApiPageComponent } from "@/features/lib/pages/offcanvas-api-page/offcanvas-api-page.component"
import { OffcanvasExamplesPageComponent } from "@/features/lib/pages/offcanvas-examples-page/offcanvas-examples-page.component"
import { PaginationApiPageComponent } from "@/features/lib/pages/pagination-api-page/pagination-api-page.component"
import { PaginationExamplesPageComponent } from "@/features/lib/pages/pagination-examples-page/pagination-examples-page.component"
import { PopoverApiPageComponent } from "@/features/lib/pages/popover-api-page/popover-api-page.component"
import { PopoverExamplesPageComponent } from "@/features/lib/pages/popover-examples-page/popover-examples-page.component"
import { ProgressbarApiPageComponent } from "@/features/lib/pages/progressbar-api-page/progressbar-api-page.component"
import { ProgressbarExamplesPageComponent } from "@/features/lib/pages/progressbar-examples-page/progressbar-examples-page.component"
import { RatingApiPageComponent } from "@/features/lib/pages/rating-api-page/rating-api-page.component"
import { RatingExamplesPageComponent } from "@/features/lib/pages/rating-examples-page/rating-examples-page.component"
import { ScrollspyApiPageComponent } from "@/features/lib/pages/scrollspy-api-page/scrollspy-api-page.component"
import { ScrollspyExamplesPageComponent } from "@/features/lib/pages/scrollspy-examples-page/scrollspy-examples-page.component"
import { TimepickerApiPageComponent } from "@/features/lib/pages/timepicker-api-page/timepicker-api-page.component"
import { TimepickerExamplesPageComponent } from "@/features/lib/pages/timepicker-examples-page/timepicker-examples-page.component"
import { ToastApiPageComponent } from "@/features/lib/pages/toast-api-page/toast-api-page.component"
import { ToastExamplesPageComponent } from "@/features/lib/pages/toast-examples-page/toast-examples-page.component"
import { TooltipApiPageComponent } from "@/features/lib/pages/tooltip-api-page/tooltip-api-page.component"
import { TooltipExamplesPageComponent } from "@/features/lib/pages/tooltip-examples-page/tooltip-examples-page.component"
import { TypeaheadApiPageComponent } from "@/features/lib/pages/typeahead-api-page/typeahead-api-page.component"
import { TypeaheadExamplesPageComponent } from "@/features/lib/pages/typeahead-examples-page/typeahead-examples-page.component"
import { routing } from "@/features/lib/lib.routes"

export const LibModule = angular.module("docs.lib", []);

LibModule.component(AlertCloseableComponent.$name, AlertCloseableComponent.$factory)
LibModule.component(AlertCustomComponent.$name, AlertCustomComponent.$factory)
LibModule.component(AlertGlobalComponent.$name, AlertGlobalComponent.$factory)
LibModule.component(AccordionContentComponent.$name, AccordionContentComponent.$factory)
LibModule.component(AccordionCustomHeaderComponent.$name, AccordionCustomHeaderComponent.$factory)
LibModule.component(AccordionGlobalComponent.$name, AccordionGlobalComponent.$factory)
LibModule.component(AccordionSimpleComponent.$name, AccordionSimpleComponent.$factory)
LibModule.component(AccordionTogglePanelsComponent.$name, AccordionTogglePanelsComponent.$factory)
LibModule.component(OnePanelAccordionComponent.$name, OnePanelAccordionComponent.$factory)
LibModule.component(SelfClosingAlertComponent.$name, SelfClosingAlertComponent.$factory)
LibModule.component(SimpleAlertComponent.$name, SimpleAlertComponent.$factory)
LibModule.component(CarouselControlsComponent.$name, CarouselControlsComponent.$factory)
LibModule.component(CarouselGlobalComponent.$name, CarouselGlobalComponent.$factory)
LibModule.component(CarouselKeyboardComponent.$name, CarouselKeyboardComponent.$factory)
LibModule.component(CarouselSimpleComponent.$name, CarouselSimpleComponent.$factory)
LibModule.component(HorizontalCollapseComponent.$name, HorizontalCollapseComponent.$factory)
LibModule.component(NavbarCollapseComponent.$name, NavbarCollapseComponent.$factory)
LibModule.component(SimpleCollapseComponent.$name, SimpleCollapseComponent.$factory)
LibModule.component(DropdownBodyComponent.$name, DropdownBodyComponent.$factory)
LibModule.component(DropdownButtonGroupsComponent.$name, DropdownButtonGroupsComponent.$factory)
LibModule.component(DropdownDisabledItemsComponent.$name, DropdownDisabledItemsComponent.$factory)
LibModule.component(DropdownFormComponent.$name, DropdownFormComponent.$factory)
LibModule.component(DropdownGlobalComponent.$name, DropdownGlobalComponent.$factory)
LibModule.component(DropdownNavbarComponent.$name, DropdownNavbarComponent.$factory)
LibModule.component(ManualDropdownComponent.$name, ManualDropdownComponent.$factory)
LibModule.component(SimpleDropdownComponent.$name, SimpleDropdownComponent.$factory)
LibModule.component(ModalComponentContentComponent.$name, ModalComponentContentComponent.$factory)
LibModule.component(ModalDefaultComponent.$name, ModalDefaultComponent.$factory)
LibModule.component(ModalDemoContentComponent.$name, ModalDemoContentComponent.$factory)
LibModule.component(ModalFocusComponent.$name, ModalFocusComponent.$factory)
LibModule.component(ModalFocusContentComponent.$name, ModalFocusContentComponent.$factory)
LibModule.component(ModalGlobalComponent.$name, ModalGlobalComponent.$factory)
LibModule.component(ModalOptionsComponent.$name, ModalOptionsComponent.$factory)
LibModule.component(ModalStackedComponent.$name, ModalStackedComponent.$factory)
LibModule.component(ModalStackedContentComponent.$name, ModalStackedContentComponent.$factory)
LibModule.component(ModalUpdatableComponent.$name, ModalUpdatableComponent.$factory)
LibModule.component(ModalUpdatableContentComponent.$name, ModalUpdatableContentComponent.$factory)
LibModule.component(AlternativeNavComponent.$name, AlternativeNavComponent.$factory)
LibModule.component(CustomNavComponent.$name, CustomNavComponent.$factory)
LibModule.component(DynamicNavComponent.$name, DynamicNavComponent.$factory)
LibModule.component(KeepContentNavComponent.$name, KeepContentNavComponent.$factory)
LibModule.component(NavGlobalComponent.$name, NavGlobalComponent.$factory)
LibModule.component(SelectingNavComponent.$name, SelectingNavComponent.$factory)
LibModule.component(SimpleNavComponent.$name, SimpleNavComponent.$factory)
LibModule.component(VerticalNavComponent.$name, VerticalNavComponent.$factory)
LibModule.component(OffcanvasComponentContentComponent.$name, OffcanvasComponentContentComponent.$factory)
LibModule.component(OffcanvasDefaultComponent.$name, OffcanvasDefaultComponent.$factory)
LibModule.component(OffcanvasDemoContentComponent.$name, OffcanvasDemoContentComponent.$factory)
LibModule.component(OffcanvasFocusComponent.$name, OffcanvasFocusComponent.$factory)
LibModule.component(OffcanvasFocusContentComponent.$name, OffcanvasFocusContentComponent.$factory)
LibModule.component(OffcanvasGlobalComponent.$name, OffcanvasGlobalComponent.$factory)
LibModule.component(OffcanvasOptionsComponent.$name, OffcanvasOptionsComponent.$factory)
LibModule.component(AdvancedPaginationComponent.$name, AdvancedPaginationComponent.$factory)
LibModule.component(BasicPaginationComponent.$name, BasicPaginationComponent.$factory)
LibModule.component(CustomPaginationComponent.$name, CustomPaginationComponent.$factory)
LibModule.component(DisabledPaginationComponent.$name, DisabledPaginationComponent.$factory)
LibModule.component(PaginationAlignmentComponent.$name, PaginationAlignmentComponent.$factory)
LibModule.component(PaginationGlobalComponent.$name, PaginationGlobalComponent.$factory)
LibModule.component(PaginationSizeComponent.$name, PaginationSizeComponent.$factory)
LibModule.component(BasicDatepickerComponent.$name, BasicDatepickerComponent.$factory)
LibModule.component(DatepickerCustomAdapterComponent.$name, DatepickerCustomAdapterComponent.$factory)
LibModule.component(DatepickerCustomDayComponent.$name, DatepickerCustomDayComponent.$factory)
LibModule.component(DatepickerCustomMonthComponent.$name, DatepickerCustomMonthComponent.$factory)
LibModule.component(DatepickerFooterComponent.$name, DatepickerFooterComponent.$factory)
LibModule.component(DatepickerGlobalComponent.$name, DatepickerGlobalComponent.$factory)
LibModule.component(DatepickerI18nComponent.$name, DatepickerI18nComponent.$factory)
LibModule.component(DatepickerKeyboardComponent.$name, DatepickerKeyboardComponent.$factory)
LibModule.component(DatepickerPositionTargetComponent.$name, DatepickerPositionTargetComponent.$factory)
LibModule.component(DisabledDatepickerComponent.$name, DisabledDatepickerComponent.$factory)
LibModule.component(MultipleMonthsDatepickerComponent.$name, MultipleMonthsDatepickerComponent.$factory)
LibModule.component(PopupDatepickerComponent.$name, PopupDatepickerComponent.$factory)
LibModule.component(RangeDatepickerComponent.$name, RangeDatepickerComponent.$factory)
LibModule.component(RangePopupDatepickerComponent.$name, RangePopupDatepickerComponent.$factory)
LibModule.component(PopoverAutocloseComponent.$name, PopoverAutocloseComponent.$factory)
LibModule.component(PopoverBodyComponent.$name, PopoverBodyComponent.$factory)
LibModule.component(PopoverContextComponent.$name, PopoverContextComponent.$factory)
LibModule.component(PopoverCustomClassComponent.$name, PopoverCustomClassComponent.$factory)
LibModule.component(PopoverCustomTargetComponent.$name, PopoverCustomTargetComponent.$factory)
LibModule.component(PopoverDelaysComponent.$name, PopoverDelaysComponent.$factory)
LibModule.component(PopoverEventsComponent.$name, PopoverEventsComponent.$factory)
LibModule.component(PopoverGlobalComponent.$name, PopoverGlobalComponent.$factory)
LibModule.component(PopoverManualControlComponent.$name, PopoverManualControlComponent.$factory)
LibModule.component(PopoverPlacementsComponent.$name, PopoverPlacementsComponent.$factory)
LibModule.component(PopoverTemplateComponent.$name, PopoverTemplateComponent.$factory)
LibModule.component(PopoverTriggersComponent.$name, PopoverTriggersComponent.$factory)
LibModule.component(ContextualTextProgressbarComponent.$name, ContextualTextProgressbarComponent.$factory)
LibModule.component(CustomLabelsProgressbarComponent.$name, CustomLabelsProgressbarComponent.$factory)
LibModule.component(ProgressBarsStackedComponent.$name, ProgressBarsStackedComponent.$factory)
LibModule.component(ProgressHeightComponent.$name, ProgressHeightComponent.$factory)
LibModule.component(ProgressbarGlobalComponent.$name, ProgressbarGlobalComponent.$factory)
LibModule.component(SimpleProgressbarComponent.$name, SimpleProgressbarComponent.$factory)
LibModule.component(StripedProgressBarComponent.$name, StripedProgressBarComponent.$factory)
LibModule.component(BasicRatingComponent.$name, BasicRatingComponent.$factory)
LibModule.component(RatingCustomTemplateComponent.$name, RatingCustomTemplateComponent.$factory)
LibModule.component(RatingDecimalComponent.$name, RatingDecimalComponent.$factory)
LibModule.component(RatingEventsComponent.$name, RatingEventsComponent.$factory)
LibModule.component(RatingFormComponent.$name, RatingFormComponent.$factory)
LibModule.component(RatingGlobalComponent.$name, RatingGlobalComponent.$factory)
LibModule.component(BasicScrollspyComponent.$name, BasicScrollspyComponent.$factory)
LibModule.component(NavbarScrollspyComponent.$name, NavbarScrollspyComponent.$factory)
LibModule.component(NestedScrollspyComponent.$name, NestedScrollspyComponent.$factory)
LibModule.component(ScrollspyMenuItemsComponent.$name, ScrollspyMenuItemsComponent.$factory)
LibModule.component(ScrollspyServiceDemoComponent.$name, ScrollspyServiceDemoComponent.$factory)
LibModule.component(BasicTimepickerComponent.$name, BasicTimepickerComponent.$factory)
LibModule.component(MeridianTimepickerComponent.$name, MeridianTimepickerComponent.$factory)
LibModule.component(SecondsTimepickerComponent.$name, SecondsTimepickerComponent.$factory)
LibModule.component(SpinnersTimepickerComponent.$name, SpinnersTimepickerComponent.$factory)
LibModule.component(TimepickerCustomAdapterComponent.$name, TimepickerCustomAdapterComponent.$factory)
LibModule.component(TimepickerCustomStepsComponent.$name, TimepickerCustomStepsComponent.$factory)
LibModule.service("NgbTimepickerI18n", GreekTimepickerI18n)
LibModule.component(TimepickerI18nComponent.$name, TimepickerI18nComponent.$factory)
LibModule.component(TimepickerValidationComponent.$name, TimepickerValidationComponent.$factory)
LibModule.directive("docsTimepickerLunchValidator", timepickerLunchValidator)
LibModule.component(CloseableToastComponent.$name, CloseableToastComponent.$factory)
LibModule.component(InlineToastComponent.$name, InlineToastComponent.$factory)
LibModule.component(PreventAutohideToastComponent.$name, PreventAutohideToastComponent.$factory)
LibModule.component(TemplateHeaderToastComponent.$name, TemplateHeaderToastComponent.$factory)
LibModule.service(DocsToastService.$name, DocsToastService)
LibModule.component(ToastManagementComponent.$name, ToastManagementComponent.$factory)
LibModule.component(TooltipAutocloseComponent.$name, TooltipAutocloseComponent.$factory)
LibModule.component(TooltipBodyComponent.$name, TooltipBodyComponent.$factory)
LibModule.component(TooltipContextComponent.$name, TooltipContextComponent.$factory)
LibModule.component(TooltipCustomClassComponent.$name, TooltipCustomClassComponent.$factory)
LibModule.component(TooltipCustomTargetComponent.$name, TooltipCustomTargetComponent.$factory)
LibModule.component(TooltipDelaysComponent.$name, TooltipDelaysComponent.$factory)
LibModule.component(TooltipGlobalComponent.$name, TooltipGlobalComponent.$factory)
LibModule.component(TooltipPlacementsComponent.$name, TooltipPlacementsComponent.$factory)
LibModule.component(TooltipTemplateComponent.$name, TooltipTemplateComponent.$factory)
LibModule.component(TooltipTriggersComponent.$name, TooltipTriggersComponent.$factory)
LibModule.component(ExactTypeaheadComponent.$name, ExactTypeaheadComponent.$factory)
LibModule.component(FocusTypeaheadComponent.$name, FocusTypeaheadComponent.$factory)
LibModule.component(FormattedTypeaheadComponent.$name, FormattedTypeaheadComponent.$factory)
LibModule.component(NonEditableTypeaheadComponent.$name, NonEditableTypeaheadComponent.$factory)
LibModule.component(SimpleTypeaheadComponent.$name, SimpleTypeaheadComponent.$factory)
LibModule.component(TemplateResultsTypeaheadComponent.$name, TemplateResultsTypeaheadComponent.$factory)
LibModule.component(TypeaheadGlobalComponent.$name, TypeaheadGlobalComponent.$factory)
LibModule.service(WikipediaSearchService.$name, WikipediaSearchService)
LibModule.component(WikipediaTypeaheadComponent.$name, WikipediaTypeaheadComponent.$factory)
LibModule.component(AlertApiPageComponent.$name, AlertApiPageComponent.$factory)
LibModule.component(AlertExamplesPageComponent.$name, AlertExamplesPageComponent.$factory)
LibModule.component(AccordionApiPageComponent.$name, AccordionApiPageComponent.$factory)
LibModule.component(AccordionExamplesPageComponent.$name, AccordionExamplesPageComponent.$factory)
LibModule.component(CarouselApiPageComponent.$name, CarouselApiPageComponent.$factory)
LibModule.component(CarouselExamplesPageComponent.$name, CarouselExamplesPageComponent.$factory)
LibModule.component(CollapseApiPageComponent.$name, CollapseApiPageComponent.$factory)
LibModule.component(CollapseExamplesPageComponent.$name, CollapseExamplesPageComponent.$factory)
LibModule.component(DatepickerApiPageComponent.$name, DatepickerApiPageComponent.$factory)
LibModule.component(DatepickerCalendarsPageComponent.$name, DatepickerCalendarsPageComponent.$factory)
LibModule.component(DatepickerExamplesPageComponent.$name, DatepickerExamplesPageComponent.$factory)
LibModule.component(DropdownApiPageComponent.$name, DropdownApiPageComponent.$factory)
LibModule.component(DropdownExamplesPageComponent.$name, DropdownExamplesPageComponent.$factory)
LibModule.component(ModalApiPageComponent.$name, ModalApiPageComponent.$factory)
LibModule.component(ModalExamplesPageComponent.$name, ModalExamplesPageComponent.$factory)
LibModule.component(NavApiPageComponent.$name, NavApiPageComponent.$factory)
LibModule.component(NavExamplesPageComponent.$name, NavExamplesPageComponent.$factory)
LibModule.component(OffcanvasApiPageComponent.$name, OffcanvasApiPageComponent.$factory)
LibModule.component(OffcanvasExamplesPageComponent.$name, OffcanvasExamplesPageComponent.$factory)
LibModule.component(PaginationApiPageComponent.$name, PaginationApiPageComponent.$factory)
LibModule.component(PaginationExamplesPageComponent.$name, PaginationExamplesPageComponent.$factory)
LibModule.component(PopoverApiPageComponent.$name, PopoverApiPageComponent.$factory)
LibModule.component(PopoverExamplesPageComponent.$name, PopoverExamplesPageComponent.$factory)
LibModule.component(ProgressbarApiPageComponent.$name, ProgressbarApiPageComponent.$factory)
LibModule.component(ProgressbarExamplesPageComponent.$name, ProgressbarExamplesPageComponent.$factory)
LibModule.component(RatingApiPageComponent.$name, RatingApiPageComponent.$factory)
LibModule.component(RatingExamplesPageComponent.$name, RatingExamplesPageComponent.$factory)
LibModule.component(ScrollspyApiPageComponent.$name, ScrollspyApiPageComponent.$factory)
LibModule.component(ScrollspyExamplesPageComponent.$name, ScrollspyExamplesPageComponent.$factory)
LibModule.component(TimepickerApiPageComponent.$name, TimepickerApiPageComponent.$factory)
LibModule.component(TimepickerExamplesPageComponent.$name, TimepickerExamplesPageComponent.$factory)
LibModule.component(ToastApiPageComponent.$name, ToastApiPageComponent.$factory)
LibModule.component(ToastExamplesPageComponent.$name, ToastExamplesPageComponent.$factory)
LibModule.component(TooltipApiPageComponent.$name, TooltipApiPageComponent.$factory)
LibModule.component(TooltipExamplesPageComponent.$name, TooltipExamplesPageComponent.$factory)
LibModule.component(TypeaheadApiPageComponent.$name, TypeaheadApiPageComponent.$factory)
LibModule.component(TypeaheadExamplesPageComponent.$name, TypeaheadExamplesPageComponent.$factory)
LibModule.config(routing)
