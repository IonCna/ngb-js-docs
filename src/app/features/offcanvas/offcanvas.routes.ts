import type {Routes} from "ngjs-core/router";

export const routes: Routes = [
    {
        path: "",
        data: {
            title: "Offcanvas",
            tabs: [
                {name: "Examples", to: "/components/offcanvas/examples"},
                {name: "Api", to: "/components/offcanvas/api"},
            ],
            externalLinks: {
                bootstrap: "components/offcanvas/",
                ngBootstrap: "components/offcanvas/overview",
            },
        },
        children: [
            {path: "", pathMatch: "full", redirectTo: "examples"},
            {
                path: "examples",
                data: {
                    sections: [
                        {id: "offcanvas-default", name: "Default options"},
                        {id: "offcanvas-component-content", name: "Component content"},
                        {id: "offcanvas-focus", name: "Focus management"},
                        {id: "offcanvas-options", name: "Offcanvas options"},
                        {id: "offcanvas-global", name: "Global configuration"},
                    ],
                },
                loadComponent: () =>
                    import("@/features/offcanvas/pages/offcanvas-examples-page/offcanvas-examples-page.component").then(m => m.OffcanvasExamplesPageComponent),
            },
            {
                path: "api",
                data: {
                    sections: [
                        {id: "ngb-offcanvas", name: "NgbOffcanvas"},
                        {id: "ngb-offcanvas-ref", name: "NgbOffcanvasRef"},
                        {id: "ngb-active-offcanvas", name: "NgbActiveOffcanvas"},
                        {id: "ngb-offcanvas-config", name: "NgbOffcanvasConfig"},
                    ],
                },
                loadComponent: () =>
                    import("@/features/offcanvas/pages/offcanvas-api-page/offcanvas-api-page.component").then(m => m.OffcanvasApiPageComponent),
            },
        ],
    },
];
