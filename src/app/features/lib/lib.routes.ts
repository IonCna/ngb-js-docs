import type { Routes } from "ngjs-core/router";
import { MenuAbstractPageComponent } from "@/core/layouts/pages/menu-abstract-page/menu-abstract-page.component";

export const routes: Routes = [
    {
        path: "rating",
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
        path: "scrollspy",
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
        path: "timepicker",
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
        path: "toast",
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
        path: "tooltip",
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
        path: "typeahead",
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
