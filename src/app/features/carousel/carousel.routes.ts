import type {Routes} from "ngjs-core/router";

export const routes: Routes = [
    {
        path: "",
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
                    import("@/features/carousel/pages/carousel-examples-page/carousel-examples-page.component").then(m => m.CarouselExamplesPageComponent),
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
                    import("@/features/carousel/pages/carousel-api-page/carousel-api-page.component").then(m => m.CarouselApiPageComponent),
            },
        ],
    },
]