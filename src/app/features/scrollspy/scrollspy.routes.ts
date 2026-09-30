import type { Routes } from "ngjs-core/router";

export const routes: Routes = [{
    path: "",
    data: { title: "Scrollspy", tabs: [{ name: "Examples", to: "/components/scrollspy/examples" }, { name: "Api", to: "/components/scrollspy/api" }], externalLinks: { bootstrap: "components/scrollspy/", ngBootstrap: "components/scrollspy/overview" } },
    children: [
        { path: "", pathMatch: "full", redirectTo: "examples" },
        { path: "examples", data: { sections: [{ id: "basic-scrollspy", name: "Basic" }, { id: "scrollspy-menu-items", name: "Menu items" }, { id: "nested-scrollspy", name: "Nested items" }, { id: "navbar-scrollspy", name: "Navbar" }, { id: "scrollspy-service", name: "Using the service" }] }, loadComponent: () => import("@/features/scrollspy/pages/scrollspy-examples-page/scrollspy-examples-page.component").then(m => m.ScrollspyExamplesPageComponent) },
        { path: "api", data: { sections: [{ id: "ngb-scrollspy", name: "NgbScrollSpy" }, { id: "ngb-scrollspy-fragment", name: "NgbScrollSpyFragment" }, { id: "ngb-scrollspy-menu", name: "NgbScrollSpyMenu" }, { id: "ngb-scrollspy-item", name: "NgbScrollSpyItem" }, { id: "ngb-scrollspy-service", name: "NgbScrollSpyService" }, { id: "ngb-scrollspy-config", name: "NgbScrollSpyConfig" }] }, loadComponent: () => import("@/features/scrollspy/pages/scrollspy-api-page/scrollspy-api-page.component").then(m => m.ScrollspyApiPageComponent) },
    ],
}];
