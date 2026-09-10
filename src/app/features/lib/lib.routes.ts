import type {StateProvider} from "@uirouter/angularjs";
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
import { MenuAbstractPageComponent } from "@/core/layouts/pages/menu-abstract-page/menu-abstract-page.component"

export const routing = ($stateProvider: StateProvider) => {
    // Estado abstracto raíz del layout con menú. lib sigue en modo UI-Router crudo,
    // así que registra acá el padre del que cuelgan todas sus rutas `docs.dashboard.*`.
    $stateProvider.state("docs.dashboard", {
        abstract: true,
        component: MenuAbstractPageComponent.$name,
    })

    $stateProvider.state("docs.dashboard.alert", {
        url: "/components/alert",
        redirectTo: "docs.dashboard.alert.examples",
        data: {
            title: "Alert",
            tabs: [
                { name: "Examples", to: "docs.dashboard.alert.examples" },
                { name: "Api", to: "docs.dashboard.alert.api" },
            ],
            externalLinks: {
                bootstrap: "components/alerts/",
                ngBootstrap: "components/alert/overview",
            },
        }
    })

    $stateProvider.state("docs.dashboard.alert.examples", {
        url: "/examples",
        data: {
            sections: [
                { id: "simple-alert", name: "Simple alert" },
                { id: "alert-closeable", name: "Closeable alerts" },
                { id: "self-closing-alert", name: "Self-closing alert" },
                { id: "alert-custom", name: "Custom alert" },
                { id: "alert-global", name: "Global configuration" },
            ],
        },
        views: {
            "$default@docs.dashboard": {
                component: AlertExamplesPageComponent.$name,
            },
        },
    })

    $stateProvider.state("docs.dashboard.alert.api", {
        url: "/api",
        data: {
            sections: [
                { id: "ngb-alert", name: "NgbAlert" },
                { id: "ngb-alert-config", name: "NgbAlertConfig" },
            ],
        },
        views: {
            "$default@docs.dashboard": {
                component: AlertApiPageComponent.$name,
            },
        },
    })

    $stateProvider.state("docs.dashboard.accordion", {
        url: "/components/accordion",
        redirectTo: "docs.dashboard.accordion.examples",
        data: {
            title: "Accordion",
            tabs: [
                { name: "Examples", to: "docs.dashboard.accordion.examples" },
                { name: "Api", to: "docs.dashboard.accordion.api" },
            ],
            externalLinks: {
                bootstrap: "components/accordion/",
                ngBootstrap: "components/accordion/overview",
            },
        }
    })

    $stateProvider.state("docs.dashboard.accordion.examples", {
        url: "/examples",
        data: {
            sections: [
                { id: "accordion-simple", name: "Basic accordion" },
                { id: "one-panel-accordion", name: "One panel at a time" },
                { id: "accordion-toggle-panels", name: "Programmatic controls" },
                { id: "accordion-custom-header", name: "Custom headers" },
                { id: "accordion-content", name: "Preserve content" },
                { id: "accordion-global", name: "Global configuration" },
            ],
        },
        views: {
            "$default@docs.dashboard": {
                component: AccordionExamplesPageComponent.$name,
            },
        },
    })

    $stateProvider.state("docs.dashboard.accordion.api", {
        url: "/api",
        data: {
            sections: [
                { id: "ngb-accordion", name: "NgbAccordion" },
                { id: "ngb-accordion-item", name: "NgbAccordionItem" },
                { id: "ngb-accordion-header", name: "NgbAccordionHeader" },
                { id: "ngb-accordion-button", name: "NgbAccordionButton" },
                { id: "ngb-accordion-toggle", name: "NgbAccordionToggle" },
                { id: "ngb-accordion-body", name: "NgbAccordionBody" },
                { id: "ngb-accordion-config", name: "NgbAccordionConfig" },
            ],
        },
        views: {
            "$default@docs.dashboard": {
                component: AccordionApiPageComponent.$name,
            },
        },
    })

    $stateProvider.state("docs.dashboard.carousel", {
        url: "/components/carousel",
        redirectTo: "docs.dashboard.carousel.examples",
        data: {
            title: "Carousel",
            tabs: [
                { name: "Examples", to: "docs.dashboard.carousel.examples" },
                { name: "Api", to: "docs.dashboard.carousel.api" },
            ],
            externalLinks: {
                bootstrap: "components/carousel/",
                ngBootstrap: "components/carousel/overview",
            },
        }
    })

    $stateProvider.state("docs.dashboard.carousel.examples", {
        url: "/examples",
        data: {
            sections: [
                { id: "carousel-simple", name: "Simple carousel" },
                { id: "carousel-keyboard", name: "Keyboard navigation" },
                { id: "carousel-controls", name: "Pause controls" },
                { id: "carousel-global", name: "Global configuration" },
            ],
        },
        views: {
            "$default@docs.dashboard": {
                component: CarouselExamplesPageComponent.$name,
            },
        },
    })

    $stateProvider.state("docs.dashboard.carousel.api", {
        url: "/api",
        data: {
            sections: [
                { id: "ngb-carousel", name: "NgbCarousel" },
                { id: "ngb-slide", name: "NgbSlide" },
                { id: "ngb-carousel-config", name: "NgbCarouselConfig" },
            ],
        },
        views: {
            "$default@docs.dashboard": {
                component: CarouselApiPageComponent.$name,
            },
        },
    })

    $stateProvider.state("docs.dashboard.collapse", {
        url: "/components/collapse",
        redirectTo: "docs.dashboard.collapse.examples",
        data: {
            title: "Collapse",
            tabs: [
                { name: "Examples", to: "docs.dashboard.collapse.examples" },
                { name: "Api", to: "docs.dashboard.collapse.api" },
            ],
            externalLinks: {
                bootstrap: "components/collapse/",
                ngBootstrap: "components/collapse/overview",
            },
        }
    })

    $stateProvider.state("docs.dashboard.collapse.examples", {
        url: "/examples",
        data: {
            sections: [
                { id: "simple-collapse", name: "Simple collapse" },
                { id: "horizontal-collapse", name: "Horizontal collapse" },
                { id: "navbar-collapse", name: "Responsive navbar" },
            ],
        },
        views: {
            "$default@docs.dashboard": {
                component: CollapseExamplesPageComponent.$name,
            },
        },
    })

    $stateProvider.state("docs.dashboard.collapse.api", {
        url: "/api",
        data: {
            sections: [
                { id: "ngb-collapse", name: "NgbCollapse" },
                { id: "ngb-collapse-config", name: "NgbCollapseConfig" },
            ],
        },
        views: {
            "$default@docs.dashboard": {
                component: CollapseApiPageComponent.$name,
            },
        },
    })

    $stateProvider.state("docs.dashboard.datepicker", {
        url: "/components/datepicker",
        redirectTo: "docs.dashboard.datepicker.examples",
        data: {
            title: "Datepicker",
            tabs: [
                { name: "Examples", to: "docs.dashboard.datepicker.examples" },
                { name: "Api", to: "docs.dashboard.datepicker.api" },
                { name: "Calendars", to: "docs.dashboard.datepicker.calendars" },
            ],
            externalLinks: {
                ngBootstrap: "components/datepicker/overview",
            },
        }
    })

    $stateProvider.state("docs.dashboard.datepicker.examples", {
        url: "/examples",
        data: {
            sections: [
                { id: "basic-datepicker", name: "Basic" },
                { id: "popup-datepicker", name: "Popup" },
                { id: "multiple-months-datepicker", name: "Multiple months" },
                { id: "range-datepicker", name: "Range selection" },
                { id: "range-popup-datepicker", name: "Range in a popup" },
                { id: "disabled-datepicker", name: "Disabled" },
                { id: "datepicker-custom-adapter", name: "Adapter and formatter" },
                { id: "datepicker-i18n", name: "Internationalization" },
                { id: "datepicker-custom-day", name: "Custom day" },
                { id: "datepicker-custom-month", name: "Custom month layout" },
                { id: "datepicker-footer", name: "Footer template" },
                { id: "datepicker-position-target", name: "Position target" },
                { id: "datepicker-keyboard", name: "Keyboard navigation" },
                { id: "datepicker-global", name: "Global configuration" },
            ],
        },
        views: {
            "$default@docs.dashboard": {
                component: DatepickerExamplesPageComponent.$name,
            },
        },
    })

    $stateProvider.state("docs.dashboard.datepicker.api", {
        url: "/api",
        data: {
            sections: [
                { id: "ngb-datepicker", name: "NgbDatepicker" },
                { id: "ngb-input-datepicker", name: "NgbInputDatepicker" },
                { id: "ngb-datepicker-config", name: "NgbDatepickerConfig" },
                { id: "ngb-input-datepicker-config", name: "NgbInputDatepickerConfig" },
                { id: "ngb-datepicker-extension-contracts", name: "Extension contracts" },
            ],
        },
        views: {
            "$default@docs.dashboard": {
                component: DatepickerApiPageComponent.$name,
            },
        },
    })

    $stateProvider.state("docs.dashboard.datepicker.calendars", {
        url: "/calendars",
        data: {
            sections: [
                { id: "calendar-hebrew", name: "Hebrew" },
                { id: "calendar-jalali", name: "Jalali" },
                { id: "calendar-islamic-civil", name: "Islamic Civil" },
                { id: "calendar-islamic-umalqura", name: "Islamic Umm al-Qura" },
                { id: "calendar-buddhist", name: "Buddhist" },
                { id: "calendar-ethiopian", name: "Ethiopian" },
                { id: "calendar-intergalactic", name: "Intergalactic Standard" },
            ],
        },
        views: {
            "$default@docs.dashboard": {
                component: DatepickerCalendarsPageComponent.$name,
            },
        },
    })

    $stateProvider.state("docs.dashboard.dropdown", {
        url: "/components/dropdown",
        redirectTo: "docs.dashboard.dropdown.examples",
        data: {
            title: "Dropdown",
            tabs: [
                { name: "Examples", to: "docs.dashboard.dropdown.examples" },
                { name: "Api", to: "docs.dashboard.dropdown.api" },
            ],
            externalLinks: {
                bootstrap: "components/dropdowns/",
                ngBootstrap: "components/dropdown/overview",
            },
        }
    })

    $stateProvider.state("docs.dashboard.dropdown.examples", {
        url: "/examples",
        data: {
            sections: [
                { id: "simple-dropdown", name: "Simple dropdown" },
                { id: "manual-dropdown", name: "Manual triggers" },
                { id: "dropdown-button-groups", name: "Button groups" },
                { id: "dropdown-disabled-items", name: "Disabled items" },
                { id: "dropdown-form", name: "Dropdown form" },
                { id: "dropdown-body", name: "Body container" },
                { id: "dropdown-navbar", name: "Navbar positioning" },
                { id: "dropdown-global", name: "Global configuration" },
            ],
        },
        views: {
            "$default@docs.dashboard": {
                component: DropdownExamplesPageComponent.$name,
            },
        },
    })

    $stateProvider.state("docs.dashboard.dropdown.api", {
        url: "/api",
        data: {
            sections: [
                { id: "ngb-dropdown", name: "NgbDropdown" },
                { id: "ngb-dropdown-anchor", name: "NgbDropdownAnchor" },
                { id: "ngb-dropdown-toggle", name: "NgbDropdownToggle" },
                { id: "ngb-dropdown-menu", name: "NgbDropdownMenu" },
                { id: "ngb-dropdown-item", name: "NgbDropdownItem" },
                { id: "ngb-dropdown-config", name: "NgbDropdownConfig" },
            ],
        },
        views: {
            "$default@docs.dashboard": {
                component: DropdownApiPageComponent.$name,
            },
        },
    })

    $stateProvider.state("docs.dashboard.modal", {
        url: "/components/modal",
        redirectTo: "docs.dashboard.modal.examples",
        data: {
            title: "Modal",
            tabs: [
                { name: "Examples", to: "docs.dashboard.modal.examples" },
                { name: "Api", to: "docs.dashboard.modal.api" },
            ],
            externalLinks: {
                bootstrap: "components/modal/",
                ngBootstrap: "components/modal/overview",
            },
        }
    })

    $stateProvider.state("docs.dashboard.modal.examples", {
        url: "/examples",
        data: {
            sections: [
                { id: "modal-default", name: "Default options" },
                { id: "modal-component-content", name: "Component content" },
                { id: "modal-focus", name: "Focus management" },
                { id: "modal-options", name: "Modal options" },
                { id: "modal-updatable", name: "Updatable options" },
                { id: "modal-stacked", name: "Stacked modals" },
                { id: "modal-global", name: "Global configuration" },
            ],
        },
        views: {
            "$default@docs.dashboard": {
                component: ModalExamplesPageComponent.$name,
            },
        },
    })

    $stateProvider.state("docs.dashboard.modal.api", {
        url: "/api",
        data: {
            sections: [
                { id: "ngb-modal", name: "NgbModal" },
                { id: "ngb-modal-ref", name: "NgbModalRef" },
                { id: "ngb-active-modal", name: "NgbActiveModal" },
                { id: "ngb-modal-config", name: "NgbModalConfig" },
            ],
        },
        views: {
            "$default@docs.dashboard": {
                component: ModalApiPageComponent.$name,
            },
        },
    })

    $stateProvider.state("docs.dashboard.nav", {
        url: "/components/nav",
        redirectTo: "docs.dashboard.nav.examples",
        data: {
            title: "Nav",
            tabs: [
                { name: "Examples", to: "docs.dashboard.nav.examples" },
                { name: "Api", to: "docs.dashboard.nav.api" },
            ],
            externalLinks: {
                bootstrap: "components/navs-tabs/",
                ngBootstrap: "components/nav/overview",
            },
        }
    })

    $stateProvider.state("docs.dashboard.nav.examples", {
        url: "/examples",
        data: {
            sections: [
                { id: "simple-nav", name: "Simple nav" },
                { id: "alternative-nav", name: "Alternative markup" },
                { id: "vertical-nav", name: "Vertical pills" },
                { id: "selecting-nav", name: "Selecting navs" },
                { id: "keep-content-nav", name: "Keep content" },
                { id: "dynamic-nav", name: "Dynamic navs" },
                { id: "custom-nav", name: "Custom style" },
                { id: "nav-global", name: "Global configuration" },
            ],
        },
        views: {
            "$default@docs.dashboard": {
                component: NavExamplesPageComponent.$name,
            },
        },
    })

    $stateProvider.state("docs.dashboard.nav.api", {
        url: "/api",
        data: {
            sections: [
                { id: "ngb-nav", name: "NgbNav" },
                { id: "ngb-nav-item", name: "NgbNavItem" },
                { id: "ngb-nav-link", name: "NgbNavLink" },
                { id: "ngb-nav-content", name: "NgbNavContent" },
                { id: "ngb-nav-outlet", name: "NgbNavOutlet" },
                { id: "ngb-nav-config", name: "NgbNavConfig" },
            ],
        },
        views: {
            "$default@docs.dashboard": {
                component: NavApiPageComponent.$name,
            },
        },
    })

    $stateProvider.state("docs.dashboard.offcanvas", {
        url: "/components/offcanvas",
        redirectTo: "docs.dashboard.offcanvas.examples",
        data: {
            title: "Offcanvas",
            tabs: [
                { name: "Examples", to: "docs.dashboard.offcanvas.examples" },
                { name: "Api", to: "docs.dashboard.offcanvas.api" },
            ],
            externalLinks: {
                bootstrap: "components/offcanvas/",
                ngBootstrap: "components/offcanvas/overview",
            },
        }
    })

    $stateProvider.state("docs.dashboard.offcanvas.examples", {
        url: "/examples",
        data: {
            sections: [
                { id: "offcanvas-default", name: "Default options" },
                { id: "offcanvas-component-content", name: "Component content" },
                { id: "offcanvas-focus", name: "Focus management" },
                { id: "offcanvas-options", name: "Offcanvas options" },
                { id: "offcanvas-global", name: "Global configuration" },
            ],
        },
        views: {
            "$default@docs.dashboard": {
                component: OffcanvasExamplesPageComponent.$name,
            },
        },
    })

    $stateProvider.state("docs.dashboard.offcanvas.api", {
        url: "/api",
        data: {
            sections: [
                { id: "ngb-offcanvas", name: "NgbOffcanvas" },
                { id: "ngb-offcanvas-ref", name: "NgbOffcanvasRef" },
                { id: "ngb-active-offcanvas", name: "NgbActiveOffcanvas" },
                { id: "ngb-offcanvas-config", name: "NgbOffcanvasConfig" },
            ],
        },
        views: {
            "$default@docs.dashboard": {
                component: OffcanvasApiPageComponent.$name,
            },
        },
    })

    $stateProvider.state("docs.dashboard.pagination", {
        url: "/components/pagination",
        redirectTo: "docs.dashboard.pagination.examples",
        data: {
            title: "Pagination",
            tabs: [
                { name: "Examples", to: "docs.dashboard.pagination.examples" },
                { name: "Api", to: "docs.dashboard.pagination.api" },
            ],
            externalLinks: {
                bootstrap: "components/pagination/",
                ngBootstrap: "components/pagination/overview",
            },
        }
    })

    $stateProvider.state("docs.dashboard.pagination.examples", {
        url: "/examples",
        data: {
            sections: [
                { id: "basic-pagination", name: "Basic pagination" },
                { id: "advanced-pagination", name: "Advanced pagination" },
                { id: "custom-pagination", name: "Custom links and pages" },
                { id: "pagination-size", name: "Pagination size" },
                { id: "pagination-alignment", name: "Pagination alignment" },
                { id: "disabled-pagination", name: "Disabled pagination" },
                { id: "pagination-global", name: "Global configuration" },
            ],
        },
        views: {
            "$default@docs.dashboard": {
                component: PaginationExamplesPageComponent.$name,
            },
        },
    })

    $stateProvider.state("docs.dashboard.pagination.api", {
        url: "/api",
        data: {
            sections: [
                { id: "ngb-pagination", name: "NgbPagination" },
                { id: "ngb-pagination-config", name: "NgbPaginationConfig" },
            ],
        },
        views: {
            "$default@docs.dashboard": {
                component: PaginationApiPageComponent.$name,
            },
        },
    })

    $stateProvider.state("docs.dashboard.popover", {
        url: "/components/popover",
        redirectTo: "docs.dashboard.popover.examples",
        data: {
            title: "Popover",
            tabs: [
                { name: "Examples", to: "docs.dashboard.popover.examples" },
                { name: "Api", to: "docs.dashboard.popover.api" },
            ],
            externalLinks: {
                bootstrap: "components/popovers/",
                ngBootstrap: "components/popover/overview",
            },
        }
    })

    $stateProvider.state("docs.dashboard.popover.examples", {
        url: "/examples",
        data: {
            sections: [
                { id: "popover-placements", name: "Quick popovers" },
                { id: "popover-template", name: "HTML and bindings" },
                { id: "popover-triggers", name: "Custom triggers" },
                { id: "popover-manual-control", name: "External controls" },
                { id: "popover-autoclose", name: "Automatic closing" },
                { id: "popover-context", name: "Template context" },
                { id: "popover-custom-target", name: "Custom target" },
                { id: "popover-delays", name: "Open and close delays" },
                { id: "popover-events", name: "Visibility events" },
                { id: "popover-body", name: "Body container" },
                { id: "popover-custom-class", name: "Custom class" },
                { id: "popover-global", name: "Global configuration" },
            ],
        },
        views: {
            "$default@docs.dashboard": {
                component: PopoverExamplesPageComponent.$name,
            },
        },
    })

    $stateProvider.state("docs.dashboard.popover.api", {
        url: "/api",
        data: {
            sections: [
                { id: "ngb-popover", name: "NgbPopover" },
                { id: "ngb-popover-config", name: "NgbPopoverConfig" },
            ],
        },
        views: {
            "$default@docs.dashboard": {
                component: PopoverApiPageComponent.$name,
            },
        },
    })

    $stateProvider.state("docs.dashboard.progressbar", {
        url: "/components/progressbar",
        redirectTo: "docs.dashboard.progressbar.examples",
        data: {
            title: "Progress bar",
            tabs: [
                { name: "Examples", to: "docs.dashboard.progressbar.examples" },
                { name: "Api", to: "docs.dashboard.progressbar.api" },
            ],
            externalLinks: {
                bootstrap: "components/progress/",
                ngBootstrap: "components/progressbar/overview",
            },
        }
    })

    $stateProvider.state("docs.dashboard.progressbar.examples", {
        url: "/examples",
        data: {
            sections: [
                { id: "simple-progressbar", name: "Simple progress bars" },
                { id: "contextual-text-progressbar", name: "Contextual text" },
                { id: "striped-progress-bar", name: "Striped bars" },
                { id: "custom-labels-progressbar", name: "Custom labels" },
                { id: "progress-height", name: "Custom height" },
                { id: "progress-bars-stacked", name: "Stacked bars" },
                { id: "progressbar-global", name: "Global configuration" },
            ],
        },
        views: {
            "$default@docs.dashboard": {
                component: ProgressbarExamplesPageComponent.$name,
            },
        },
    })

    $stateProvider.state("docs.dashboard.progressbar.api", {
        url: "/api",
        data: {
            sections: [
                { id: "ngb-progressbar", name: "NgbProgressbar" },
                { id: "ngb-progressbar-stacked", name: "NgbProgressbarStacked" },
                { id: "ngb-progressbar-config", name: "NgbProgressbarConfig" },
            ],
        },
        views: {
            "$default@docs.dashboard": {
                component: ProgressbarApiPageComponent.$name,
            },
        },
    })

    $stateProvider.state("docs.dashboard.rating", {
        url: "/components/rating",
        redirectTo: "docs.dashboard.rating.examples",
        data: {
            title: "Rating",
            tabs: [
                { name: "Examples", to: "docs.dashboard.rating.examples" },
                { name: "Api", to: "docs.dashboard.rating.api" },
            ],
            externalLinks: {
                ngBootstrap: "components/rating/overview",
            },
        }
    })

    $stateProvider.state("docs.dashboard.rating.examples", {
        url: "/examples",
        data: {
            sections: [
                { id: "basic-rating", name: "Basic demo" },
                { id: "rating-events", name: "Events and readonly" },
                { id: "rating-custom-template", name: "Custom star template" },
                { id: "rating-decimal", name: "Decimal rating" },
                { id: "rating-form", name: "Form integration" },
                { id: "rating-global", name: "Global configuration" },
            ],
        },
        views: {
            "$default@docs.dashboard": {
                component: RatingExamplesPageComponent.$name,
            },
        },
    })

    $stateProvider.state("docs.dashboard.rating.api", {
        url: "/api",
        data: {
            sections: [
                { id: "ngb-rating", name: "NgbRating" },
                { id: "ngb-rating-config", name: "NgbRatingConfig" },
            ],
        },
        views: {
            "$default@docs.dashboard": {
                component: RatingApiPageComponent.$name,
            },
        },
    })

    $stateProvider.state("docs.dashboard.scrollspy", {
        url: "/components/scrollspy",
        redirectTo: "docs.dashboard.scrollspy.examples",
        data: {
            title: "Scrollspy",
            tabs: [
                { name: "Examples", to: "docs.dashboard.scrollspy.examples" },
                { name: "Api", to: "docs.dashboard.scrollspy.api" },
            ],
            externalLinks: {
                bootstrap: "components/scrollspy/",
                ngBootstrap: "components/scrollspy/overview",
            },
        }
    })

    $stateProvider.state("docs.dashboard.scrollspy.examples", {
        url: "/examples",
        data: {
            sections: [
                { id: "basic-scrollspy", name: "Basic" },
                { id: "scrollspy-menu-items", name: "Menu items" },
                { id: "nested-scrollspy", name: "Nested items" },
                { id: "navbar-scrollspy", name: "Navbar" },
                { id: "scrollspy-service", name: "Using the service" },
            ],
        },
        views: {
            "$default@docs.dashboard": {
                component: ScrollspyExamplesPageComponent.$name,
            },
        },
    })

    $stateProvider.state("docs.dashboard.scrollspy.api", {
        url: "/api",
        data: {
            sections: [
                { id: "ngb-scrollspy", name: "NgbScrollSpy" },
                { id: "ngb-scrollspy-fragment", name: "NgbScrollSpyFragment" },
                { id: "ngb-scrollspy-menu", name: "NgbScrollSpyMenu" },
                { id: "ngb-scrollspy-item", name: "NgbScrollSpyItem" },
                { id: "ngb-scrollspy-service", name: "NgbScrollSpyService" },
                { id: "ngb-scrollspy-config", name: "NgbScrollSpyConfig" },
            ],
        },
        views: {
            "$default@docs.dashboard": {
                component: ScrollspyApiPageComponent.$name,
            },
        },
    })

    $stateProvider.state("docs.dashboard.timepicker", {
        url: "/components/timepicker",
        redirectTo: "docs.dashboard.timepicker.examples",
        data: {
            title: "Timepicker",
            tabs: [
                { name: "Examples", to: "docs.dashboard.timepicker.examples" },
                { name: "Api", to: "docs.dashboard.timepicker.api" },
            ],
            externalLinks: {
                ngBootstrap: "components/timepicker/overview",
            },
        }
    })

    $stateProvider.state("docs.dashboard.timepicker.examples", {
        url: "/examples",
        data: {
            sections: [
                { id: "basic-timepicker", name: "Basic timepicker" },
                { id: "meridian-timepicker", name: "Meridian" },
                { id: "seconds-timepicker", name: "Seconds" },
                { id: "spinners-timepicker", name: "Spinners" },
                { id: "timepicker-custom-steps", name: "Custom steps" },
                { id: "timepicker-validation", name: "Custom validation" },
                { id: "timepicker-custom-adapter", name: "Custom time adapter" },
                { id: "timepicker-i18n", name: "Internationalization" },
            ],
        },
        views: {
            "$default@docs.dashboard": {
                component: TimepickerExamplesPageComponent.$name,
            },
        },
    })

    $stateProvider.state("docs.dashboard.timepicker.api", {
        url: "/api",
        data: {
            sections: [
                { id: "ngb-timepicker", name: "NgbTimepicker" },
                { id: "ngb-timepicker-config", name: "NgbTimepickerConfig" },
                { id: "ngb-time-adapter", name: "NgbTimeAdapter" },
                { id: "ngb-timepicker-i18n", name: "NgbTimepickerI18n" },
            ],
        },
        views: {
            "$default@docs.dashboard": {
                component: TimepickerApiPageComponent.$name,
            },
        },
    })

    $stateProvider.state("docs.dashboard.toast", {
        url: "/components/toast",
        redirectTo: "docs.dashboard.toast.examples",
        data: {
            title: "Toast",
            tabs: [
                { name: "Examples", to: "docs.dashboard.toast.examples" },
                { name: "Api", to: "docs.dashboard.toast.api" },
            ],
            externalLinks: {
                bootstrap: "components/toasts/",
                ngBootstrap: "components/toast/overview",
            },
        }
    })

    $stateProvider.state("docs.dashboard.toast.examples", {
        url: "/examples",
        data: {
            sections: [
                { id: "inline-toast", name: "Declarative inline usage" },
                { id: "template-header-toast", name: "Template header" },
                { id: "closeable-toast", name: "Closeable toast" },
                { id: "prevent-autohide-toast", name: "Prevent autohide" },
                { id: "toast-management", name: "Management service" },
            ],
        },
        views: {
            "$default@docs.dashboard": {
                component: ToastExamplesPageComponent.$name,
            },
        },
    })

    $stateProvider.state("docs.dashboard.toast.api", {
        url: "/api",
        data: {
            sections: [
                { id: "ngb-toast", name: "NgbToast" },
                { id: "ngb-toast-header", name: "NgbToastHeader" },
                { id: "ngb-toast-config", name: "NgbToastConfig" },
            ],
        },
        views: {
            "$default@docs.dashboard": {
                component: ToastApiPageComponent.$name,
            },
        },
    })

    $stateProvider.state("docs.dashboard.tooltip", {
        url: "/components/tooltip",
        redirectTo: "docs.dashboard.tooltip.examples",
        data: {
            title: "Tooltip",
            tabs: [
                { name: "Examples", to: "docs.dashboard.tooltip.examples" },
                { name: "Api", to: "docs.dashboard.tooltip.api" },
            ],
            externalLinks: {
                bootstrap: "components/tooltips/",
                ngBootstrap: "components/tooltip/overview",
            },
        }
    })

    $stateProvider.state("docs.dashboard.tooltip.examples", {
        url: "/examples",
        data: {
            sections: [
                { id: "tooltip-placements", name: "Quick and easy tooltips" },
                { id: "tooltip-template", name: "HTML and bindings" },
                { id: "tooltip-triggers", name: "Custom and manual triggers" },
                { id: "tooltip-autoclose", name: "Automatic closing" },
                { id: "tooltip-context", name: "Context and manual triggers" },
                { id: "tooltip-custom-target", name: "Custom target" },
                { id: "tooltip-delays", name: "Open and close delays" },
                { id: "tooltip-body", name: "Append to body" },
                { id: "tooltip-custom-class", name: "Custom class" },
                { id: "tooltip-global", name: "Global configuration" },
            ],
        },
        views: {
            "$default@docs.dashboard": {
                component: TooltipExamplesPageComponent.$name,
            },
        },
    })

    $stateProvider.state("docs.dashboard.tooltip.api", {
        url: "/api",
        data: {
            sections: [
                { id: "ngb-tooltip", name: "NgbTooltip" },
                { id: "ngb-tooltip-config", name: "NgbTooltipConfig" },
            ],
        },
        views: {
            "$default@docs.dashboard": {
                component: TooltipApiPageComponent.$name,
            },
        },
    })

    $stateProvider.state("docs.dashboard.typeahead", {
        url: "/components/typeahead",
        redirectTo: "docs.dashboard.typeahead.examples",
        data: {
            title: "Typeahead",
            tabs: [
                { name: "Examples", to: "docs.dashboard.typeahead.examples" },
                { name: "Api", to: "docs.dashboard.typeahead.api" },
            ],
            externalLinks: {
                ngBootstrap: "components/typeahead/overview",
            },
        }
    })

    $stateProvider.state("docs.dashboard.typeahead.examples", {
        url: "/examples",
        data: {
            sections: [
                { id: "simple-typeahead", name: "Simple Typeahead" },
                { id: "focus-typeahead", name: "Open on focus" },
                { id: "formatted-typeahead", name: "Formatted results" },
                { id: "exact-typeahead", name: "Select on exact" },
                { id: "wikipedia-typeahead", name: "Wikipedia search" },
                { id: "template-results-typeahead", name: "Template for results" },
                { id: "non-editable-typeahead", name: "Prevent manual entry" },
                { id: "typeahead-global", name: "Global configuration" },
            ],
        },
        views: {
            "$default@docs.dashboard": {
                component: TypeaheadExamplesPageComponent.$name,
            },
        },
    })

    $stateProvider.state("docs.dashboard.typeahead.api", {
        url: "/api",
        data: {
            sections: [
                { id: "ngb-typeahead", name: "NgbTypeahead" },
                { id: "ngb-highlight", name: "NgbHighlight" },
                { id: "ngb-typeahead-config", name: "NgbTypeaheadConfig" },
            ],
        },
        views: {
            "$default@docs.dashboard": {
                component: TypeaheadApiPageComponent.$name,
            },
        },
    })
}

routing.$inject = ["$stateProvider"]
