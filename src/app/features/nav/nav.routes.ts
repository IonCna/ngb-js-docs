import type {Routes} from "ngjs-core/router";

export const routes: Routes = [
    {
        path: "",
        data: {
            title: "Nav",
            tabs: [
                {name: "Examples", to: "/components/nav/examples"},
                {name: "Api", to: "/components/nav/api"},
            ],
            externalLinks: {
                bootstrap: "components/navs-tabs/",
                ngBootstrap: "components/nav/overview",
            },
        },
        children: [
            {path: "", pathMatch: "full", redirectTo: "examples"},
            {
                path: "examples",
                data: {
                    sections: [
                        {id: "simple-nav", name: "Simple nav"},
                        {id: "alternative-nav", name: "Alternative markup"},
                        {id: "vertical-nav", name: "Vertical pills"},
                        {id: "selecting-nav", name: "Selecting navs"},
                        {id: "keep-content-nav", name: "Keep content"},
                        {id: "dynamic-nav", name: "Dynamic navs"},
                        {id: "custom-nav", name: "Custom style"},
                        {id: "nav-global", name: "Global configuration"},
                    ],
                },
                loadComponent: () =>
                    import("@/features/nav/pages/nav-examples-page/nav-examples-page.component").then(m => m.NavExamplesPageComponent),
            },
            {
                path: "api",
                data: {
                    sections: [
                        {id: "ngb-nav", name: "NgbNav"},
                        {id: "ngb-nav-item", name: "NgbNavItem"},
                        {id: "ngb-nav-link", name: "NgbNavLink"},
                        {id: "ngb-nav-content", name: "NgbNavContent"},
                        {id: "ngb-nav-outlet", name: "NgbNavOutlet"},
                        {id: "ngb-nav-config", name: "NgbNavConfig"},
                    ],
                },
                loadComponent: () =>
                    import("@/features/nav/pages/nav-api-page/nav-api-page.component").then(m => m.NavApiPageComponent),
            },
        ],
    },
];
