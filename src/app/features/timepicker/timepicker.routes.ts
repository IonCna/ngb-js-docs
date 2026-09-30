import type { Routes } from "ngjs-core/router";

export const routes: Routes = [{
    path: "",
    data: { title: "Timepicker", tabs: [{ name: "Examples", to: "/components/timepicker/examples" }, { name: "Api", to: "/components/timepicker/api" }], externalLinks: { ngBootstrap: "components/timepicker/overview" } },
    children: [
        { path: "", pathMatch: "full", redirectTo: "examples" },
        { path: "examples", data: { sections: [{ id: "basic-timepicker", name: "Basic timepicker" }, { id: "meridian-timepicker", name: "Meridian" }, { id: "seconds-timepicker", name: "Seconds" }, { id: "spinners-timepicker", name: "Spinners" }, { id: "timepicker-custom-steps", name: "Custom steps" }, { id: "timepicker-validation", name: "Custom validation" }, { id: "timepicker-custom-adapter", name: "Custom time adapter" }, { id: "timepicker-i18n", name: "Internationalization" }] }, loadComponent: () => import("@/features/timepicker/pages/timepicker-examples-page/timepicker-examples-page.component").then(m => m.TimepickerExamplesPageComponent) },
        { path: "api", data: { sections: [{ id: "ngb-timepicker", name: "NgbTimepicker" }, { id: "ngb-timepicker-config", name: "NgbTimepickerConfig" }, { id: "ngb-time-adapter", name: "NgbTimeAdapter" }, { id: "ngb-timepicker-i18n", name: "NgbTimepickerI18n" }] }, loadComponent: () => import("@/features/timepicker/pages/timepicker-api-page/timepicker-api-page.component").then(m => m.TimepickerApiPageComponent) },
    ],
}];
