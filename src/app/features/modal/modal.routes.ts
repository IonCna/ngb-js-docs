import type {Routes} from "ngjs-core/router";

export const routes: Routes = [
    {
        path: "",
        data: {
            title: "Modal",
            tabs: [
                {name: "Examples", to: "/components/modal/examples"},
                {name: "Api", to: "/components/modal/api"},
            ],
            externalLinks: {
                bootstrap: "components/modal/",
                ngBootstrap: "components/modal/overview",
            },
        },
        children: [
            {path: "", pathMatch: "full", redirectTo: "examples"},
            {
                path: "examples",
                data: {
                    sections: [
                        {id: "modal-default", name: "Default options"},
                        {id: "modal-component-content", name: "Component content"},
                        {id: "modal-focus", name: "Focus management"},
                        {id: "modal-options", name: "Modal options"},
                        {id: "modal-updatable", name: "Updatable options"},
                        {id: "modal-stacked", name: "Stacked modals"},
                        {id: "modal-global", name: "Global configuration"},
                    ],
                },
                loadComponent: () =>
                    import("@/features/modal/pages/modal-examples-page/modal-examples-page.component").then(m => m.ModalExamplesPageComponent),
            },
            {
                path: "api",
                data: {
                    sections: [
                        {id: "ngb-modal", name: "NgbModal"},
                        {id: "ngb-modal-ref", name: "NgbModalRef"},
                        {id: "ngb-active-modal", name: "NgbActiveModal"},
                        {id: "ngb-modal-config", name: "NgbModalConfig"},
                    ],
                },
                loadComponent: () =>
                    import("@/features/modal/pages/modal-api-page/modal-api-page.component").then(m => m.ModalApiPageComponent),
            },
        ],
    },
];
