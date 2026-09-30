import type { Routes } from "ngjs-core/router";

export const routes: Routes = [{
    path: "",
    data: { title: "Typeahead", tabs: [{ name: "Examples", to: "/components/typeahead/examples" }, { name: "Api", to: "/components/typeahead/api" }], externalLinks: { ngBootstrap: "components/typeahead/overview" } },
    children: [
        { path: "", pathMatch: "full", redirectTo: "examples" },
        { path: "examples", data: { sections: [{ id: "simple-typeahead", name: "Simple Typeahead" }, { id: "focus-typeahead", name: "Open on focus" }, { id: "formatted-typeahead", name: "Formatted results" }, { id: "exact-typeahead", name: "Select on exact" }, { id: "wikipedia-typeahead", name: "Wikipedia search" }, { id: "template-results-typeahead", name: "Template for results" }, { id: "non-editable-typeahead", name: "Prevent manual entry" }, { id: "typeahead-global", name: "Global configuration" }] }, loadComponent: () => import("@/features/typeahead/pages/typeahead-examples-page/typeahead-examples-page.component").then(m => m.TypeaheadExamplesPageComponent) },
        { path: "api", data: { sections: [{ id: "ngb-typeahead", name: "NgbTypeahead" }, { id: "ngb-highlight", name: "NgbHighlight" }, { id: "ngb-typeahead-config", name: "NgbTypeaheadConfig" }] }, loadComponent: () => import("@/features/typeahead/pages/typeahead-api-page/typeahead-api-page.component").then(m => m.TypeaheadApiPageComponent) },
    ],
}];
