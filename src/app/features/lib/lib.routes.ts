import type { Routes } from "ngjs-core/router";
import { MenuAbstractPageComponent } from "@/core/layouts/pages/menu-abstract-page/menu-abstract-page.component";

export const routes: Routes = [
    {
        path: "components/alert",
        component: MenuAbstractPageComponent,
        data: {
            title: "Alert",
            tabs: [
                { name: "Examples", to: "/components/alert/examples" },
                { name: "Api", to: "/components/alert/api" },
            ],
            externalLinks: {
                bootstrap: "components/alerts/",
                ngBootstrap: "components/alert/overview",
            },
        },
        children: [
            { path: "", pathMatch: "full", redirectTo: "examples" },
            {
                path: "examples",
                data: {
                    sections: [
                        { id: "simple-alert", name: "Simple alert" },
                        { id: "alert-closeable", name: "Closeable alerts" },
                        { id: "self-closing-alert", name: "Self-closing alert" },
                        { id: "alert-custom", name: "Custom alert" },
                        { id: "alert-global", name: "Global configuration" },
                    ],
                },
                loadComponent: () =>
                    import("@/features/lib/pages/alert-examples-page/alert-examples-page.component").then(m => m.AlertExamplesPageComponent),
            },
            {
                path: "api",
                data: {
                    sections: [
                        { id: "ngb-alert", name: "NgbAlert" },
                        { id: "ngb-alert-config", name: "NgbAlertConfig" },
                    ],
                },
                loadComponent: () =>
                    import("@/features/lib/pages/alert-api-page/alert-api-page.component").then(m => m.AlertApiPageComponent),
            },
        ],
    },
    {
        path: "components/accordion",
        component: MenuAbstractPageComponent,
        data: {
            title: "Accordion",
            tabs: [
                { name: "Examples", to: "/components/accordion/examples" },
                { name: "Api", to: "/components/accordion/api" },
            ],
            externalLinks: {
                bootstrap: "components/accordion/",
                ngBootstrap: "components/accordion/overview",
            },
        },
        children: [
            { path: "", pathMatch: "full", redirectTo: "examples" },
            {
                path: "examples",
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
                loadComponent: () =>
                    import("@/features/lib/pages/accordion-examples-page/accordion-examples-page.component").then(m => m.AccordionExamplesPageComponent),
            },
            {
                path: "api",
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
                loadComponent: () =>
                    import("@/features/lib/pages/accordion-api-page/accordion-api-page.component").then(m => m.AccordionApiPageComponent),
            },
        ],
    },
    {
        path: "components/carousel",
        component: MenuAbstractPageComponent,
        data: {
            title: "Carousel",
            tabs: [
                { name: "Examples", to: "/components/carousel/examples" },
                { name: "Api", to: "/components/carousel/api" },
            ],
            externalLinks: {
                bootstrap: "components/carousel/",
                ngBootstrap: "components/carousel/overview",
            },
        },
        children: [
            { path: "", pathMatch: "full", redirectTo: "examples" },
            {
                path: "examples",
                data: {
                    sections: [
                        { id: "carousel-simple", name: "Simple carousel" },
                        { id: "carousel-keyboard", name: "Keyboard navigation" },
                        { id: "carousel-controls", name: "Pause controls" },
                        { id: "carousel-global", name: "Global configuration" },
                    ],
                },
                loadComponent: () =>
                    import("@/features/lib/pages/carousel-examples-page/carousel-examples-page.component").then(m => m.CarouselExamplesPageComponent),
            },
            {
                path: "api",
                data: {
                    sections: [
                        { id: "ngb-carousel", name: "NgbCarousel" },
                        { id: "ngb-slide", name: "NgbSlide" },
                        { id: "ngb-carousel-config", name: "NgbCarouselConfig" },
                    ],
                },
                loadComponent: () =>
                    import("@/features/lib/pages/carousel-api-page/carousel-api-page.component").then(m => m.CarouselApiPageComponent),
            },
        ],
    },
    {
        path: "components/collapse",
        component: MenuAbstractPageComponent,
        data: {
            title: "Collapse",
            tabs: [
                { name: "Examples", to: "/components/collapse/examples" },
                { name: "Api", to: "/components/collapse/api" },
            ],
            externalLinks: {
                bootstrap: "components/collapse/",
                ngBootstrap: "components/collapse/overview",
            },
        },
        children: [
            { path: "", pathMatch: "full", redirectTo: "examples" },
            {
                path: "examples",
                data: {
                    sections: [
                        { id: "simple-collapse", name: "Simple collapse" },
                        { id: "horizontal-collapse", name: "Horizontal collapse" },
                        { id: "navbar-collapse", name: "Responsive navbar" },
                    ],
                },
                loadComponent: () =>
                    import("@/features/lib/pages/collapse-examples-page/collapse-examples-page.component").then(m => m.CollapseExamplesPageComponent),
            },
            {
                path: "api",
                data: {
                    sections: [
                        { id: "ngb-collapse", name: "NgbCollapse" },
                        { id: "ngb-collapse-config", name: "NgbCollapseConfig" },
                    ],
                },
                loadComponent: () =>
                    import("@/features/lib/pages/collapse-api-page/collapse-api-page.component").then(m => m.CollapseApiPageComponent),
            },
        ],
    },
    {
        path: "components/datepicker",
        component: MenuAbstractPageComponent,
        data: {
            title: "Datepicker",
            tabs: [
                { name: "Examples", to: "/components/datepicker/examples" },
                { name: "Api", to: "/components/datepicker/api" },
                { name: "Calendars", to: "/components/datepicker/calendars" },
            ],
            externalLinks: {
                ngBootstrap: "components/datepicker/overview",
            },
        },
        children: [
            { path: "", pathMatch: "full", redirectTo: "examples" },
            {
                path: "examples",
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
                loadComponent: () =>
                    import("@/features/lib/pages/datepicker-examples-page/datepicker-examples-page.component").then(m => m.DatepickerExamplesPageComponent),
            },
            {
                path: "api",
                data: {
                    sections: [
                        { id: "ngb-datepicker", name: "NgbDatepicker" },
                        { id: "ngb-input-datepicker", name: "NgbInputDatepicker" },
                        { id: "ngb-datepicker-config", name: "NgbDatepickerConfig" },
                        { id: "ngb-input-datepicker-config", name: "NgbInputDatepickerConfig" },
                        { id: "ngb-datepicker-extension-contracts", name: "Extension contracts" },
                    ],
                },
                loadComponent: () =>
                    import("@/features/lib/pages/datepicker-api-page/datepicker-api-page.component").then(m => m.DatepickerApiPageComponent),
            },
            {
                path: "calendars",
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
                loadComponent: () =>
                    import("@/features/lib/pages/datepicker-calendars-page/datepicker-calendars-page.component").then(m => m.DatepickerCalendarsPageComponent),
            },
        ],
    },
    {
        path: "components/dropdown",
        component: MenuAbstractPageComponent,
        data: {
            title: "Dropdown",
            tabs: [
                { name: "Examples", to: "/components/dropdown/examples" },
                { name: "Api", to: "/components/dropdown/api" },
            ],
            externalLinks: {
                bootstrap: "components/dropdowns/",
                ngBootstrap: "components/dropdown/overview",
            },
        },
        children: [
            { path: "", pathMatch: "full", redirectTo: "examples" },
            {
                path: "examples",
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
                loadComponent: () =>
                    import("@/features/lib/pages/dropdown-examples-page/dropdown-examples-page.component").then(m => m.DropdownExamplesPageComponent),
            },
            {
                path: "api",
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
                loadComponent: () =>
                    import("@/features/lib/pages/dropdown-api-page/dropdown-api-page.component").then(m => m.DropdownApiPageComponent),
            },
        ],
    },
    {
        path: "components/modal",
        component: MenuAbstractPageComponent,
        data: {
            title: "Modal",
            tabs: [
                { name: "Examples", to: "/components/modal/examples" },
                { name: "Api", to: "/components/modal/api" },
            ],
            externalLinks: {
                bootstrap: "components/modal/",
                ngBootstrap: "components/modal/overview",
            },
        },
        children: [
            { path: "", pathMatch: "full", redirectTo: "examples" },
            {
                path: "examples",
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
                loadComponent: () =>
                    import("@/features/lib/pages/modal-examples-page/modal-examples-page.component").then(m => m.ModalExamplesPageComponent),
            },
            {
                path: "api",
                data: {
                    sections: [
                        { id: "ngb-modal", name: "NgbModal" },
                        { id: "ngb-modal-ref", name: "NgbModalRef" },
                        { id: "ngb-active-modal", name: "NgbActiveModal" },
                        { id: "ngb-modal-config", name: "NgbModalConfig" },
                    ],
                },
                loadComponent: () =>
                    import("@/features/lib/pages/modal-api-page/modal-api-page.component").then(m => m.ModalApiPageComponent),
            },
        ],
    },
    {
        path: "components/nav",
        component: MenuAbstractPageComponent,
        data: {
            title: "Nav",
            tabs: [
                { name: "Examples", to: "/components/nav/examples" },
                { name: "Api", to: "/components/nav/api" },
            ],
            externalLinks: {
                bootstrap: "components/navs-tabs/",
                ngBootstrap: "components/nav/overview",
            },
        },
        children: [
            { path: "", pathMatch: "full", redirectTo: "examples" },
            {
                path: "examples",
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
                loadComponent: () =>
                    import("@/features/lib/pages/nav-examples-page/nav-examples-page.component").then(m => m.NavExamplesPageComponent),
            },
            {
                path: "api",
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
                loadComponent: () =>
                    import("@/features/lib/pages/nav-api-page/nav-api-page.component").then(m => m.NavApiPageComponent),
            },
        ],
    },
    {
        path: "components/offcanvas",
        component: MenuAbstractPageComponent,
        data: {
            title: "Offcanvas",
            tabs: [
                { name: "Examples", to: "/components/offcanvas/examples" },
                { name: "Api", to: "/components/offcanvas/api" },
            ],
            externalLinks: {
                bootstrap: "components/offcanvas/",
                ngBootstrap: "components/offcanvas/overview",
            },
        },
        children: [
            { path: "", pathMatch: "full", redirectTo: "examples" },
            {
                path: "examples",
                data: {
                    sections: [
                        { id: "offcanvas-default", name: "Default options" },
                        { id: "offcanvas-component-content", name: "Component content" },
                        { id: "offcanvas-focus", name: "Focus management" },
                        { id: "offcanvas-options", name: "Offcanvas options" },
                        { id: "offcanvas-global", name: "Global configuration" },
                    ],
                },
                loadComponent: () =>
                    import("@/features/lib/pages/offcanvas-examples-page/offcanvas-examples-page.component").then(m => m.OffcanvasExamplesPageComponent),
            },
            {
                path: "api",
                data: {
                    sections: [
                        { id: "ngb-offcanvas", name: "NgbOffcanvas" },
                        { id: "ngb-offcanvas-ref", name: "NgbOffcanvasRef" },
                        { id: "ngb-active-offcanvas", name: "NgbActiveOffcanvas" },
                        { id: "ngb-offcanvas-config", name: "NgbOffcanvasConfig" },
                    ],
                },
                loadComponent: () =>
                    import("@/features/lib/pages/offcanvas-api-page/offcanvas-api-page.component").then(m => m.OffcanvasApiPageComponent),
            },
        ],
    },
    {
        path: "components/pagination",
        component: MenuAbstractPageComponent,
        data: {
            title: "Pagination",
            tabs: [
                { name: "Examples", to: "/components/pagination/examples" },
                { name: "Api", to: "/components/pagination/api" },
            ],
            externalLinks: {
                bootstrap: "components/pagination/",
                ngBootstrap: "components/pagination/overview",
            },
        },
        children: [
            { path: "", pathMatch: "full", redirectTo: "examples" },
            {
                path: "examples",
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
                loadComponent: () =>
                    import("@/features/lib/pages/pagination-examples-page/pagination-examples-page.component").then(m => m.PaginationExamplesPageComponent),
            },
            {
                path: "api",
                data: {
                    sections: [
                        { id: "ngb-pagination", name: "NgbPagination" },
                        { id: "ngb-pagination-config", name: "NgbPaginationConfig" },
                    ],
                },
                loadComponent: () =>
                    import("@/features/lib/pages/pagination-api-page/pagination-api-page.component").then(m => m.PaginationApiPageComponent),
            },
        ],
    },
    {
        path: "components/popover",
        component: MenuAbstractPageComponent,
        data: {
            title: "Popover",
            tabs: [
                { name: "Examples", to: "/components/popover/examples" },
                { name: "Api", to: "/components/popover/api" },
            ],
            externalLinks: {
                bootstrap: "components/popovers/",
                ngBootstrap: "components/popover/overview",
            },
        },
        children: [
            { path: "", pathMatch: "full", redirectTo: "examples" },
            {
                path: "examples",
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
                loadComponent: () =>
                    import("@/features/lib/pages/popover-examples-page/popover-examples-page.component").then(m => m.PopoverExamplesPageComponent),
            },
            {
                path: "api",
                data: {
                    sections: [
                        { id: "ngb-popover", name: "NgbPopover" },
                        { id: "ngb-popover-config", name: "NgbPopoverConfig" },
                    ],
                },
                loadComponent: () =>
                    import("@/features/lib/pages/popover-api-page/popover-api-page.component").then(m => m.PopoverApiPageComponent),
            },
        ],
    },
    {
        path: "components/progressbar",
        component: MenuAbstractPageComponent,
        data: {
            title: "Progress bar",
            tabs: [
                { name: "Examples", to: "/components/progressbar/examples" },
                { name: "Api", to: "/components/progressbar/api" },
            ],
            externalLinks: {
                bootstrap: "components/progress/",
                ngBootstrap: "components/progressbar/overview",
            },
        },
        children: [
            { path: "", pathMatch: "full", redirectTo: "examples" },
            {
                path: "examples",
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
                loadComponent: () =>
                    import("@/features/lib/pages/progressbar-examples-page/progressbar-examples-page.component").then(m => m.ProgressbarExamplesPageComponent),
            },
            {
                path: "api",
                data: {
                    sections: [
                        { id: "ngb-progressbar", name: "NgbProgressbar" },
                        { id: "ngb-progressbar-stacked", name: "NgbProgressbarStacked" },
                        { id: "ngb-progressbar-config", name: "NgbProgressbarConfig" },
                    ],
                },
                loadComponent: () =>
                    import("@/features/lib/pages/progressbar-api-page/progressbar-api-page.component").then(m => m.ProgressbarApiPageComponent),
            },
        ],
    },
    {
        path: "components/rating",
        component: MenuAbstractPageComponent,
        data: {
            title: "Rating",
            tabs: [
                { name: "Examples", to: "/components/rating/examples" },
                { name: "Api", to: "/components/rating/api" },
            ],
            externalLinks: {
                ngBootstrap: "components/rating/overview",
            },
        },
        children: [
            { path: "", pathMatch: "full", redirectTo: "examples" },
            {
                path: "examples",
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
                loadComponent: () =>
                    import("@/features/lib/pages/rating-examples-page/rating-examples-page.component").then(m => m.RatingExamplesPageComponent),
            },
            {
                path: "api",
                data: {
                    sections: [
                        { id: "ngb-rating", name: "NgbRating" },
                        { id: "ngb-rating-config", name: "NgbRatingConfig" },
                    ],
                },
                loadComponent: () =>
                    import("@/features/lib/pages/rating-api-page/rating-api-page.component").then(m => m.RatingApiPageComponent),
            },
        ],
    },
    {
        path: "components/scrollspy",
        component: MenuAbstractPageComponent,
        data: {
            title: "Scrollspy",
            tabs: [
                { name: "Examples", to: "/components/scrollspy/examples" },
                { name: "Api", to: "/components/scrollspy/api" },
            ],
            externalLinks: {
                bootstrap: "components/scrollspy/",
                ngBootstrap: "components/scrollspy/overview",
            },
        },
        children: [
            { path: "", pathMatch: "full", redirectTo: "examples" },
            {
                path: "examples",
                data: {
                    sections: [
                        { id: "basic-scrollspy", name: "Basic" },
                        { id: "scrollspy-menu-items", name: "Menu items" },
                        { id: "nested-scrollspy", name: "Nested items" },
                        { id: "navbar-scrollspy", name: "Navbar" },
                        { id: "scrollspy-service", name: "Using the service" },
                    ],
                },
                loadComponent: () =>
                    import("@/features/lib/pages/scrollspy-examples-page/scrollspy-examples-page.component").then(m => m.ScrollspyExamplesPageComponent),
            },
            {
                path: "api",
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
                loadComponent: () =>
                    import("@/features/lib/pages/scrollspy-api-page/scrollspy-api-page.component").then(m => m.ScrollspyApiPageComponent),
            },
        ],
    },
    {
        path: "components/timepicker",
        component: MenuAbstractPageComponent,
        data: {
            title: "Timepicker",
            tabs: [
                { name: "Examples", to: "/components/timepicker/examples" },
                { name: "Api", to: "/components/timepicker/api" },
            ],
            externalLinks: {
                ngBootstrap: "components/timepicker/overview",
            },
        },
        children: [
            { path: "", pathMatch: "full", redirectTo: "examples" },
            {
                path: "examples",
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
                loadComponent: () =>
                    import("@/features/lib/pages/timepicker-examples-page/timepicker-examples-page.component").then(m => m.TimepickerExamplesPageComponent),
            },
            {
                path: "api",
                data: {
                    sections: [
                        { id: "ngb-timepicker", name: "NgbTimepicker" },
                        { id: "ngb-timepicker-config", name: "NgbTimepickerConfig" },
                        { id: "ngb-time-adapter", name: "NgbTimeAdapter" },
                        { id: "ngb-timepicker-i18n", name: "NgbTimepickerI18n" },
                    ],
                },
                loadComponent: () =>
                    import("@/features/lib/pages/timepicker-api-page/timepicker-api-page.component").then(m => m.TimepickerApiPageComponent),
            },
        ],
    },
    {
        path: "components/toast",
        component: MenuAbstractPageComponent,
        data: {
            title: "Toast",
            tabs: [
                { name: "Examples", to: "/components/toast/examples" },
                { name: "Api", to: "/components/toast/api" },
            ],
            externalLinks: {
                bootstrap: "components/toasts/",
                ngBootstrap: "components/toast/overview",
            },
        },
        children: [
            { path: "", pathMatch: "full", redirectTo: "examples" },
            {
                path: "examples",
                data: {
                    sections: [
                        { id: "inline-toast", name: "Declarative inline usage" },
                        { id: "template-header-toast", name: "Template header" },
                        { id: "closeable-toast", name: "Closeable toast" },
                        { id: "prevent-autohide-toast", name: "Prevent autohide" },
                        { id: "toast-management", name: "Management service" },
                    ],
                },
                loadComponent: () =>
                    import("@/features/lib/pages/toast-examples-page/toast-examples-page.component").then(m => m.ToastExamplesPageComponent),
            },
            {
                path: "api",
                data: {
                    sections: [
                        { id: "ngb-toast", name: "NgbToast" },
                        { id: "ngb-toast-header", name: "NgbToastHeader" },
                        { id: "ngb-toast-config", name: "NgbToastConfig" },
                    ],
                },
                loadComponent: () =>
                    import("@/features/lib/pages/toast-api-page/toast-api-page.component").then(m => m.ToastApiPageComponent),
            },
        ],
    },
    {
        path: "components/tooltip",
        component: MenuAbstractPageComponent,
        data: {
            title: "Tooltip",
            tabs: [
                { name: "Examples", to: "/components/tooltip/examples" },
                { name: "Api", to: "/components/tooltip/api" },
            ],
            externalLinks: {
                bootstrap: "components/tooltips/",
                ngBootstrap: "components/tooltip/overview",
            },
        },
        children: [
            { path: "", pathMatch: "full", redirectTo: "examples" },
            {
                path: "examples",
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
                loadComponent: () =>
                    import("@/features/lib/pages/tooltip-examples-page/tooltip-examples-page.component").then(m => m.TooltipExamplesPageComponent),
            },
            {
                path: "api",
                data: {
                    sections: [
                        { id: "ngb-tooltip", name: "NgbTooltip" },
                        { id: "ngb-tooltip-config", name: "NgbTooltipConfig" },
                    ],
                },
                loadComponent: () =>
                    import("@/features/lib/pages/tooltip-api-page/tooltip-api-page.component").then(m => m.TooltipApiPageComponent),
            },
        ],
    },
    {
        path: "components/typeahead",
        component: MenuAbstractPageComponent,
        data: {
            title: "Typeahead",
            tabs: [
                { name: "Examples", to: "/components/typeahead/examples" },
                { name: "Api", to: "/components/typeahead/api" },
            ],
            externalLinks: {
                ngBootstrap: "components/typeahead/overview",
            },
        },
        children: [
            { path: "", pathMatch: "full", redirectTo: "examples" },
            {
                path: "examples",
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
                loadComponent: () =>
                    import("@/features/lib/pages/typeahead-examples-page/typeahead-examples-page.component").then(m => m.TypeaheadExamplesPageComponent),
            },
            {
                path: "api",
                data: {
                    sections: [
                        { id: "ngb-typeahead", name: "NgbTypeahead" },
                        { id: "ngb-highlight", name: "NgbHighlight" },
                        { id: "ngb-typeahead-config", name: "NgbTypeaheadConfig" },
                    ],
                },
                loadComponent: () =>
                    import("@/features/lib/pages/typeahead-api-page/typeahead-api-page.component").then(m => m.TypeaheadApiPageComponent),
            },
        ],
    },
];
