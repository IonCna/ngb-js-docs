import { Component } from "ngjs-core";
import advancedPaginationHtml from "@/features/lib/components/advanced-pagination/advanced-pagination.component.html?raw"
import advancedPaginationTs from "@/features/lib/components/advanced-pagination/advanced-pagination.component.ts?raw"
import basicPaginationHtml from "@/features/lib/components/basic-pagination/basic-pagination.component.html?raw"
import basicPaginationTs from "@/features/lib/components/basic-pagination/basic-pagination.component.ts?raw"
import customPaginationHtml from "@/features/lib/components/custom-pagination/custom-pagination.component.html?raw"
import customPaginationTs from "@/features/lib/components/custom-pagination/custom-pagination.component.ts?raw"
import disabledPaginationHtml from "@/features/lib/components/disabled-pagination/disabled-pagination.component.html?raw"
import disabledPaginationTs from "@/features/lib/components/disabled-pagination/disabled-pagination.component.ts?raw"
import paginationAlignmentHtml from "@/features/lib/components/pagination-alignment/pagination-alignment.component.html?raw"
import paginationAlignmentTs from "@/features/lib/components/pagination-alignment/pagination-alignment.component.ts?raw"
import paginationGlobalHtml from "@/features/lib/components/pagination-global/pagination-global.component.html?raw"
import paginationGlobalTs from "@/features/lib/components/pagination-global/pagination-global.component.ts?raw"
import paginationSizeHtml from "@/features/lib/components/pagination-size/pagination-size.component.html?raw"
import paginationSizeTs from "@/features/lib/components/pagination-size/pagination-size.component.ts?raw"

@Component({
    selector: "docs-pagination-examples-page",
    controllerAs: "$",
    templateUrl: "./pagination-examples-page.component.html",
    styleUrl: "./pagination-examples-page.component.css",
})
export class PaginationExamplesPageComponent {
    public readonly examples = {
        basic: { html: basicPaginationHtml, typescript: basicPaginationTs },
        advanced: { html: advancedPaginationHtml, typescript: advancedPaginationTs },
        custom: { html: customPaginationHtml, typescript: customPaginationTs },
        size: { html: paginationSizeHtml, typescript: paginationSizeTs },
        alignment: { html: paginationAlignmentHtml, typescript: paginationAlignmentTs },
        disabled: { html: disabledPaginationHtml, typescript: disabledPaginationTs },
        global: { html: paginationGlobalHtml, typescript: paginationGlobalTs },
    }
}
