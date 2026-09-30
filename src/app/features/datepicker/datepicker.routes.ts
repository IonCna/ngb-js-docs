import type {Route} from "ngjs-core/router";

export const routes: Route[] = [
    {
        path: "",
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
                    import("@/features/datepicker/pages/datepicker-examples-page/datepicker-examples-page.component").then(m => m.DatepickerExamplesPageComponent),
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
                    import("@/features/datepicker/pages/datepicker-api-page/datepicker-api-page.component").then(m => m.DatepickerApiPageComponent),
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
                    import("@/features/datepicker/pages/datepicker-calendars-page/datepicker-calendars-page.component").then(m => m.DatepickerCalendarsPageComponent),
            },
        ],
    },
]