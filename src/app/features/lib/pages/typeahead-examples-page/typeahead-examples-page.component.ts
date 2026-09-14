import { Component } from "ngjs-core";
import exactHtml from "@/features/lib/components/exact-typeahead/exact-typeahead.component.html?raw"
import exactTs from "@/features/lib/components/exact-typeahead/exact-typeahead.component.ts?raw"
import focusHtml from "@/features/lib/components/focus-typeahead/focus-typeahead.component.html?raw"
import focusTs from "@/features/lib/components/focus-typeahead/focus-typeahead.component.ts?raw"
import formattedHtml from "@/features/lib/components/formatted-typeahead/formatted-typeahead.component.html?raw"
import formattedTs from "@/features/lib/components/formatted-typeahead/formatted-typeahead.component.ts?raw"
import globalHtml from "@/features/lib/components/typeahead-global/typeahead-global.component.html?raw"
import globalTs from "@/features/lib/components/typeahead-global/typeahead-global.component.ts?raw"
import nonEditableHtml from "@/features/lib/components/non-editable-typeahead/non-editable-typeahead.component.html?raw"
import nonEditableTs from "@/features/lib/components/non-editable-typeahead/non-editable-typeahead.component.ts?raw"
import simpleHtml from "@/features/lib/components/simple-typeahead/simple-typeahead.component.html?raw"
import simpleTs from "@/features/lib/components/simple-typeahead/simple-typeahead.component.ts?raw"
import templateResultsHtml from "@/features/lib/components/template-results-typeahead/template-results-typeahead.component.html?raw"
import templateResultsTs from "@/features/lib/components/template-results-typeahead/template-results-typeahead.component.ts?raw"
import wikipediaHtml from "@/features/lib/components/wikipedia-typeahead/wikipedia-typeahead.component.html?raw"
import wikipediaTs from "@/features/lib/components/wikipedia-typeahead/wikipedia-typeahead.component.ts?raw"

@Component({
    selector: "docs-typeahead-examples-page",
    controllerAs: "$",
    templateUrl: "./typeahead-examples-page.component.html",
    styleUrl: "./typeahead-examples-page.component.css",
})
export class TypeaheadExamplesPageComponent {
    public readonly examples = {
        simple: { html: simpleHtml, typescript: simpleTs },
        focus: { html: focusHtml, typescript: focusTs },
        formatted: { html: formattedHtml, typescript: formattedTs },
        exact: { html: exactHtml, typescript: exactTs },
        wikipedia: { html: wikipediaHtml, typescript: wikipediaTs },
        templateResults: { html: templateResultsHtml, typescript: templateResultsTs },
        nonEditable: { html: nonEditableHtml, typescript: nonEditableTs },
        global: { html: globalHtml, typescript: globalTs },
    }
}
