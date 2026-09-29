import { NgModule } from "ngjs-core";
import { RouterModule } from "ngjs-core/router";
import { NgbTypeaheadModule } from "ngb-js/typeahead";
import { NgbScrollSpyModule } from "ngb-js/scrollspy";
import { NgbNavModule } from "ngb-js/nav";
import { NgbCollapseModule } from "ngb-js/collapse";
import { routes } from "@/features/typeahead/typeahead.routes";
import { ExactTypeaheadComponent } from "@/features/typeahead/components/exact-typeahead/exact-typeahead.component";
import { FocusTypeaheadComponent } from "@/features/typeahead/components/focus-typeahead/focus-typeahead.component";
import { FormattedTypeaheadComponent } from "@/features/typeahead/components/formatted-typeahead/formatted-typeahead.component";
import { NonEditableTypeaheadComponent } from "@/features/typeahead/components/non-editable-typeahead/non-editable-typeahead.component";
import { SimpleTypeaheadComponent } from "@/features/typeahead/components/simple-typeahead/simple-typeahead.component";
import { TemplateResultsTypeaheadComponent } from "@/features/typeahead/components/template-results-typeahead/template-results-typeahead.component";
import { TypeaheadGlobalComponent } from "@/features/typeahead/components/typeahead-global/typeahead-global.component";
import { WikipediaSearchService, WikipediaTypeaheadComponent } from "@/features/typeahead/components/wikipedia-typeahead/wikipedia-typeahead.component";

@NgModule({ id: "docs.typeahead", declarations: [ExactTypeaheadComponent, FocusTypeaheadComponent, FormattedTypeaheadComponent, NonEditableTypeaheadComponent, SimpleTypeaheadComponent, TemplateResultsTypeaheadComponent, TypeaheadGlobalComponent, WikipediaTypeaheadComponent], providers: [WikipediaSearchService], imports: [NgbTypeaheadModule, NgbScrollSpyModule, NgbNavModule, NgbCollapseModule, RouterModule.forChild(routes)] })
export class TypeaheadModule {}
