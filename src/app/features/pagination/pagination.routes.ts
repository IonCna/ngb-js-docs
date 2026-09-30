import type {Routes} from "ngjs-core/router";

export const routes: Routes = [
    {
        path: "",
        data: {
            title: "Pagination",
            tabs: [
                {name: "Examples", to: "/components/pagination/examples"},
                {name: "Api", to: "/components/pagination/api"},
            ],
            externalLinks: {
                bootstrap: "components/pagination/",
                ngBootstrap: "components/pagination/overview",
            },
        },
        children: [
            {path: "", pathMatch: "full", redirectTo: "examples"},
            {
                path: "examples",
                data: {
                    sections: [
                        {id: "basic-pagination", name: "Basic pagination"},
                        {id: "advanced-pagination", name: "Advanced pagination"},
                        {id: "custom-pagination", name: "Custom links and pages"},
                        {id: "pagination-size", name: "Pagination size"},
                        {id: "pagination-alignment", name: "Pagination alignment"},
                        {id: "disabled-pagination", name: "Disabled pagination"},
                        {id: "pagination-global", name: "Global configuration"},
                    ],
                },
                loadComponent: () =>
                    import("@/features/pagination/pages/pagination-examples-page/pagination-examples-page.component").then(m => m.PaginationExamplesPageComponent),
            },
            {
                path: "api",
                data: {
                    sections: [
                        {id: "ngb-pagination", name: "NgbPagination"},
                        {id: "ngb-pagination-config", name: "NgbPaginationConfig"},
                    ],
                },
                loadComponent: () =>
                    import("@/features/pagination/pages/pagination-api-page/pagination-api-page.component").then(m => m.PaginationApiPageComponent),
            },
        ],
    },
];
