import{r as e,t}from"./decorate-U3LoYfOr.js";var n=`<label class="form-label" for="exact-typeahead">Search for a state</label>\r
<input id="exact-typeahead" type="text" class="form-control" ng-model="example.model" ngb-typeahead="example.search" input-formatter="example.formatter" result-formatter="example.formatter" select-on-exact="true" placeholder="Try California">\r
<pre class="mt-3 mb-0">Model: {{ example.model | json }}</pre>\r
`,r=`import { Component } from "ngjs-core";\r
import { debounceTime, map, type OperatorFunction } from "rxjs";\r
\r
interface State { name: string }\r
const STATES: State[] = ["Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut", "Delaware", "Florida", "Georgia", "Hawaii"].map(name => ({ name }));\r
\r
@Component({\r
    selector: "docs-exact-typeahead",\r
    controllerAs: "example",\r
    templateUrl: "./exact-typeahead.component.html",\r
    styleUrl: "./exact-typeahead.component.css",\r
})\r
export class ExactTypeaheadComponent {\r
    public model?: State;\r
    public readonly formatter = (state: State): string => state.name;\r
    public readonly search: OperatorFunction<string, State[]> = text$ => text$.pipe(\r
        debounceTime(200),\r
        map(term => term ? STATES.filter(state => state.name.toLowerCase().includes(term.toLowerCase())) : []),\r
    );\r
}\r
`,i=`<label class="form-label" for="focus-typeahead">Search for a state</label>\r
<input id="focus-typeahead" type="text" class="form-control" ng-model="example.model" ngb-typeahead="example.search" ng-focus="example.focus$.next($event.target.value)" placeholder="Focus to see suggestions">\r
<p class="small text-body-secondary mt-2 mb-0">Model: <strong>{{ example.model || 'empty' }}</strong></p>\r
`,a=`import { Component, type OnDestroy } from "ngjs-core";\r
import { debounceTime, distinctUntilChanged, map, merge, type OperatorFunction, Subject } from "rxjs";\r
\r
const STATES = ["Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut", "Delaware", "Florida", "Georgia", "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan", "Minnesota", "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire", "New Jersey", "New Mexico", "New York", "North Carolina", "North Dakota", "Ohio", "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island", "South Carolina", "South Dakota", "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington", "West Virginia", "Wisconsin", "Wyoming"];\r
\r
@Component({\r
    selector: "docs-focus-typeahead",\r
    controllerAs: "example",\r
    templateUrl: "./focus-typeahead.component.html",\r
    styleUrl: "./focus-typeahead.component.css",\r
})\r
export class FocusTypeaheadComponent implements OnDestroy {\r
    public model = "";\r
    public readonly focus$ = new Subject<string>();\r
    public readonly search: OperatorFunction<string, string[]> = text$ => merge(\r
        text$.pipe(debounceTime(200), distinctUntilChanged()),\r
        this.focus$,\r
    ).pipe(\r
        map(term => (term ? STATES.filter(state => state.toLowerCase().includes(term.toLowerCase())) : STATES).slice(0, 10)),\r
    );\r
    public ngOnDestroy(): void { this.focus$.complete(); }\r
}\r
`,o=`<label class="form-label" for="formatted-typeahead">Search for a state</label>\r
<input id="formatted-typeahead" type="text" class="form-control" ng-model="example.model" ngb-typeahead="example.search" result-formatter="example.formatter" placeholder="Results are formatted in uppercase">\r
<p class="small text-body-secondary mt-2 mb-0">Model: <strong>{{ example.model || 'empty' }}</strong></p>\r
`,s=`import { Component } from "ngjs-core";\r
import { debounceTime, distinctUntilChanged, map, type OperatorFunction } from "rxjs";\r
\r
const STATES = ["Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut", "Delaware", "Florida", "Georgia", "Hawaii"];\r
\r
@Component({\r
    selector: "docs-formatted-typeahead",\r
    controllerAs: "example",\r
    templateUrl: "./formatted-typeahead.component.html",\r
    styleUrl: "./formatted-typeahead.component.css",\r
})\r
export class FormattedTypeaheadComponent {\r
    public model = "";\r
    public readonly formatter = (result: string): string => result.toUpperCase();\r
    public readonly search: OperatorFunction<string, string[]> = text$ => text$.pipe(\r
        debounceTime(200),\r
        distinctUntilChanged(),\r
        map(term => term ? STATES.filter(state => state.toLowerCase().includes(term.toLowerCase())) : []),\r
    );\r
}\r
`,c=`<div class="alert alert-light border d-flex gap-3 align-items-start" role="note">\r
    <i class="bi bi-gear text-primary mt-1" aria-hidden="true"></i>\r
    <div>\r
        <p class="fw-semibold mb-1">Global defaults used by this example</p>\r
        <p class="small text-body-secondary mb-0">Hint completion, exact-match selection and a popup appended to body.</p>\r
    </div>\r
</div>\r
\r
<label class="form-label" for="global-typeahead">Search for a state</label>\r
<input id="global-typeahead" type="text" class="form-control" ng-model="example.model" ngb-typeahead="example.search" placeholder="Try Cal">\r
`,l=`import { Component, Inject, type AfterViewInit, type OnDestroy } from "ngjs-core";\r
import { NgbTypeaheadConfig, NGB_TYPEAHEAD_CONFIG } from "ngb-js/typeahead";\r
import { debounceTime, distinctUntilChanged, map, type OperatorFunction } from "rxjs";\r
\r
const STATES = ["Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut", "Delaware", "Florida", "Georgia", "Hawaii"];\r
\r
@Component({\r
    selector: "docs-typeahead-global",\r
    controllerAs: "example",\r
    templateUrl: "./typeahead-global.component.html",\r
    styleUrl: "./typeahead-global.component.css",\r
})\r
export class TypeaheadGlobalComponent implements AfterViewInit, OnDestroy {\r
    public model = "";\r
    private readonly initialConfig: Pick<NgbTypeaheadConfig, "container" | "selectOnExact" | "showHint">;\r
\r
    constructor(@Inject(NGB_TYPEAHEAD_CONFIG) private readonly config: NgbTypeaheadConfig) {\r
        this.initialConfig = {\r
            container: config.container,\r
            selectOnExact: config.selectOnExact,\r
            showHint: config.showHint,\r
        };\r
        config.container = "body";\r
        config.selectOnExact = true;\r
        config.showHint = true;\r
    }\r
\r
    public readonly search: OperatorFunction<string, string[]> = text$ => text$.pipe(\r
        debounceTime(200),\r
        distinctUntilChanged(),\r
        map(term => term.length < 2 ? [] : STATES.filter(state => state.toLowerCase().startsWith(term.toLowerCase()))),\r
    );\r
\r
    public ngAfterViewInit(): void { this.restoreConfig(); }\r
    public ngOnDestroy(): void { this.restoreConfig(); }\r
    private restoreConfig(): void {\r
        this.config.container = this.initialConfig.container;\r
        this.config.selectOnExact = this.initialConfig.selectOnExact;\r
        this.config.showHint = this.initialConfig.showHint;\r
    }\r
}\r
`,u=`<p>Manual text is not accepted; the model changes only after selecting a suggestion.</p>\r
<label class="form-label" for="non-editable-typeahead">Search for a state</label>\r
<input id="non-editable-typeahead" type="text" class="form-control" ng-model="example.model" ngb-typeahead="example.search" input-formatter="example.formatter" result-formatter="example.formatter" editable="false" placeholder="Type at least two characters">\r
<pre class="mt-3 mb-0">Model: {{ example.model | json }}</pre>\r
`,d=`import { Component } from "ngjs-core";\r
import { debounceTime, distinctUntilChanged, map, type OperatorFunction } from "rxjs";\r
\r
interface State { id: number; name: string }\r
const STATES: State[] = ["Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut", "Delaware", "Florida", "Georgia", "Hawaii"].map((name, id) => ({ id, name }));\r
\r
@Component({\r
    selector: "docs-non-editable-typeahead",\r
    controllerAs: "example",\r
    templateUrl: "./non-editable-typeahead.component.html",\r
    styleUrl: "./non-editable-typeahead.component.css",\r
})\r
export class NonEditableTypeaheadComponent {\r
    public model: State | null = null;\r
    public readonly formatter = (state: State): string => state.name;\r
    public readonly search: OperatorFunction<string, State[]> = text$ => text$.pipe(\r
        debounceTime(200),\r
        distinctUntilChanged(),\r
        map(term => term.length < 2 ? [] : STATES.filter(state => state.name.toLowerCase().includes(term.toLowerCase()))),\r
    );\r
}\r
`,f=`<label class="form-label" for="simple-typeahead">Search for a state</label>\r
<input id="simple-typeahead" type="text" class="form-control" ng-model="example.model" ngb-typeahead="example.search" placeholder="Type at least two characters">\r
<p class="small text-body-secondary mt-2 mb-0">Model: <strong>{{ example.model || 'empty' }}</strong></p>\r
`,p=`import { Component } from "ngjs-core";\r
import { debounceTime, distinctUntilChanged, map, type OperatorFunction } from "rxjs";\r
\r
const STATES = ["Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut", "Delaware", "Florida", "Georgia", "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan", "Minnesota", "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire", "New Jersey", "New Mexico", "New York", "North Carolina", "North Dakota", "Ohio", "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island", "South Carolina", "South Dakota", "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington", "West Virginia", "Wisconsin", "Wyoming"];\r
\r
@Component({\r
    selector: "docs-simple-typeahead",\r
    controllerAs: "example",\r
    templateUrl: "./simple-typeahead.component.html",\r
    styleUrl: "./simple-typeahead.component.css",\r
})\r
export class SimpleTypeaheadComponent {\r
    public model = "";\r
    public readonly search: OperatorFunction<string, string[]> = text$ => text$.pipe(\r
        debounceTime(200),\r
        distinctUntilChanged(),\r
        map(term => term.length < 2 ? [] : STATES.filter(state => state.toLowerCase().includes(term.toLowerCase())).slice(0, 10)),\r
    );\r
}\r
`,m=`<ng-template ng-ref="example.resultTemplate" let-result="result" let-term="term">\r
    <span class="d-flex align-items-center gap-2">\r
        <span class="fs-5" aria-hidden="true">{{ result.flag }}</span>\r
        <span class="flex-grow-1"><ngb-highlight result="result.name" term="term"></ngb-highlight></span>\r
        <small class="text-body-secondary">{{ result.region }}</small>\r
    </span>\r
</ng-template>\r
\r
<label class="form-label" for="template-results-typeahead">Search for a country</label>\r
<input id="template-results-typeahead" type="text" class="form-control" ng-model="example.model" ngb-typeahead="example.search" result-template="example.resultTemplate" input-formatter="example.formatter" placeholder="Try Mexico">\r
<pre class="mt-3 mb-0">Model: {{ example.model | json }}</pre>\r
`,h=`import { Component, type TemplateRef } from "ngjs-core";\r
import { debounceTime, map, type OperatorFunction } from "rxjs";\r
\r
interface Country { name: string; flag: string; region: string }\r
const COUNTRIES: Country[] = [\r
    { name: "Mexico", flag: "🇲🇽", region: "North America" },\r
    { name: "Argentina", flag: "🇦🇷", region: "South America" },\r
    { name: "Brazil", flag: "🇧🇷", region: "South America" },\r
    { name: "Canada", flag: "🇨🇦", region: "North America" },\r
    { name: "Colombia", flag: "🇨🇴", region: "South America" },\r
    { name: "Germany", flag: "🇩🇪", region: "Europe" },\r
    { name: "Japan", flag: "🇯🇵", region: "Asia" },\r
    { name: "Spain", flag: "🇪🇸", region: "Europe" },\r
];\r
\r
@Component({\r
    selector: "docs-template-results-typeahead",\r
    controllerAs: "example",\r
    templateUrl: "./template-results-typeahead.component.html",\r
    styleUrl: "./template-results-typeahead.component.css",\r
})\r
export class TemplateResultsTypeaheadComponent {\r
    public model?: Country;\r
    public resultTemplate?: TemplateRef<unknown>;\r
    public readonly formatter = (country: Country): string => country.name;\r
    public readonly search: OperatorFunction<string, Country[]> = text$ => text$.pipe(\r
        debounceTime(200),\r
        map(term => term ? COUNTRIES.filter(country => country.name.toLowerCase().includes(term.toLowerCase())).slice(0, 8) : []),\r
    );\r
}\r
`,g=`<label class="form-label" for="wikipedia-typeahead">Search for a Wikipedia page</label>\r
<input id="wikipedia-typeahead" type="text" class="form-control" ng-class="{ 'is-invalid': example.searchFailed }" ng-model="example.model" ngb-typeahead="example.search" placeholder="Wikipedia search">\r
<div class="form-text" ng-if="example.searching">Searching…</div>\r
<div class="invalid-feedback" ng-if="example.searchFailed">Suggestions could not be loaded.</div>\r
<p class="small text-body-secondary mt-2 mb-0">Model: <strong>{{ example.model || 'empty' }}</strong></p>\r
`,_=`import { Component, Injectable } from "ngjs-core";\r
import { HttpClient, HttpParams } from "ngjs-core/common/http";\r
import { catchError, debounceTime, distinctUntilChanged, map, type OperatorFunction, of, switchMap, tap } from "rxjs";\r
\r
const WIKI_URL = "https://en.wikipedia.org/w/api.php";\r
type WikiResponse = [string, string[], string[], string[]];\r
\r
@Injectable({ id: "docs.wikipedia.search.service" })\r
export class WikipediaSearchService {\r
    constructor(private readonly http: HttpClient) {}\r
\r
    public search(term: string) {\r
        if (!term) return of([] as string[]);\r
        return this.http.get<WikiResponse>(WIKI_URL, {\r
            params: new HttpParams({ action: "opensearch", format: "json", origin: "*", search: term }),\r
        }).pipe(map(response => response[1]));\r
    }\r
}\r
\r
@Component({\r
    selector: "docs-wikipedia-typeahead",\r
    controllerAs: "example",\r
    templateUrl: "./wikipedia-typeahead.component.html",\r
    styleUrl: "./wikipedia-typeahead.component.css",\r
})\r
export class WikipediaTypeaheadComponent {\r
    public model = "";\r
    public searching = false;\r
    public searchFailed = false;\r
\r
    constructor(private readonly wikipedia: WikipediaSearchService) {}\r
\r
    public readonly search: OperatorFunction<string, string[]> = text$ => text$.pipe(\r
        debounceTime(300),\r
        distinctUntilChanged(),\r
        tap(() => this.searching = true),\r
        switchMap(term => this.wikipedia.search(term).pipe(\r
            tap(() => this.searchFailed = false),\r
            catchError(() => {\r
                this.searchFailed = true;\r
                return of([] as string[]);\r
            }),\r
        )),\r
        tap(() => this.searching = false),\r
    );\r
}\r
`,v=class{examples={simple:{html:f,typescript:p},focus:{html:i,typescript:a},formatted:{html:o,typescript:s},exact:{html:n,typescript:r},wikipedia:{html:g,typescript:_},templateResults:{html:m,typescript:h},nonEditable:{html:u,typescript:d},global:{html:c,typescript:l}}};v=t([e({selector:`docs-typeahead-examples-page`,controllerAs:`$`,templateUrl:`/ngb-js-docs/templates/typeahead-examples-page.component-7069d402.html`,styleUrl:`./typeahead-examples-page.component.css`})],v);export{v as TypeaheadExamplesPageComponent};