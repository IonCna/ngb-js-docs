import{d as e,f as t}from"./index-PqXhwIf1.js";var n=`<label class="form-label" for="exact-typeahead">Search for a state</label>
<input id="exact-typeahead" type="text" class="form-control" ng-model="example.model" ngb-typeahead="example.search" input-formatter="example.formatter" result-formatter="example.formatter" select-on-exact="true" placeholder="Try California">
<pre class="mt-3 mb-0">Model: {{ example.model | json }}</pre>
`,r=`import { Component } from "ngjs-core";
import { debounceTime, map, type OperatorFunction } from "rxjs";

interface State { name: string }
const STATES: State[] = ["Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut", "Delaware", "Florida", "Georgia", "Hawaii"].map(name => ({ name }));

@Component({
    selector: "docs-exact-typeahead",
    controllerAs: "example",
    templateUrl: "./exact-typeahead.component.html",
    styleUrl: "./exact-typeahead.component.css",
})
export class ExactTypeaheadComponent {
    public model?: State;
    public readonly formatter = (state: State): string => state.name;
    public readonly search: OperatorFunction<string, State[]> = text$ => text$.pipe(
        debounceTime(200),
        map(term => term ? STATES.filter(state => state.name.toLowerCase().includes(term.toLowerCase())) : []),
    );
}
`,i=`<label class="form-label" for="focus-typeahead">Search for a state</label>
<input id="focus-typeahead" type="text" class="form-control" ng-model="example.model" ngb-typeahead="example.search" ng-focus="example.focus$.next($event.target.value)" placeholder="Focus to see suggestions">
<p class="small text-body-secondary mt-2 mb-0">Model: <strong>{{ example.model || 'empty' }}</strong></p>
`,a=`import { Component, type OnDestroy } from "ngjs-core";
import { debounceTime, distinctUntilChanged, map, merge, type OperatorFunction, Subject } from "rxjs";

const STATES = ["Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut", "Delaware", "Florida", "Georgia", "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan", "Minnesota", "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire", "New Jersey", "New Mexico", "New York", "North Carolina", "North Dakota", "Ohio", "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island", "South Carolina", "South Dakota", "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington", "West Virginia", "Wisconsin", "Wyoming"];

@Component({
    selector: "docs-focus-typeahead",
    controllerAs: "example",
    templateUrl: "./focus-typeahead.component.html",
    styleUrl: "./focus-typeahead.component.css",
})
export class FocusTypeaheadComponent implements OnDestroy {
    public model = "";
    public readonly focus$ = new Subject<string>();
    public readonly search: OperatorFunction<string, string[]> = text$ => merge(
        text$.pipe(debounceTime(200), distinctUntilChanged()),
        this.focus$,
    ).pipe(
        map(term => (term ? STATES.filter(state => state.toLowerCase().includes(term.toLowerCase())) : STATES).slice(0, 10)),
    );
    public ngOnDestroy(): void { this.focus$.complete(); }
}
`,o=`<label class="form-label" for="formatted-typeahead">Search for a state</label>
<input id="formatted-typeahead" type="text" class="form-control" ng-model="example.model" ngb-typeahead="example.search" result-formatter="example.formatter" placeholder="Results are formatted in uppercase">
<p class="small text-body-secondary mt-2 mb-0">Model: <strong>{{ example.model || 'empty' }}</strong></p>
`,s=`import { Component } from "ngjs-core";
import { debounceTime, distinctUntilChanged, map, type OperatorFunction } from "rxjs";

const STATES = ["Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut", "Delaware", "Florida", "Georgia", "Hawaii"];

@Component({
    selector: "docs-formatted-typeahead",
    controllerAs: "example",
    templateUrl: "./formatted-typeahead.component.html",
    styleUrl: "./formatted-typeahead.component.css",
})
export class FormattedTypeaheadComponent {
    public model = "";
    public readonly formatter = (result: string): string => result.toUpperCase();
    public readonly search: OperatorFunction<string, string[]> = text$ => text$.pipe(
        debounceTime(200),
        distinctUntilChanged(),
        map(term => term ? STATES.filter(state => state.toLowerCase().includes(term.toLowerCase())) : []),
    );
}
`,c=`<div class="alert alert-light border d-flex gap-3 align-items-start" role="note">
    <i class="bi bi-gear text-primary mt-1" aria-hidden="true"></i>
    <div>
        <p class="fw-semibold mb-1">Global defaults used by this example</p>
        <p class="small text-body-secondary mb-0">Hint completion, exact-match selection and a popup appended to body.</p>
    </div>
</div>

<label class="form-label" for="global-typeahead">Search for a state</label>
<input id="global-typeahead" type="text" class="form-control" ng-model="example.model" ngb-typeahead="example.search" placeholder="Try Cal">
`,l=`import { Component, Inject, type AfterViewInit, type OnDestroy } from "ngjs-core";
import { NgbTypeaheadConfig, NGB_TYPEAHEAD_CONFIG } from "ngb-js/typeahead";
import { debounceTime, distinctUntilChanged, map, type OperatorFunction } from "rxjs";

const STATES = ["Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut", "Delaware", "Florida", "Georgia", "Hawaii"];

@Component({
    selector: "docs-typeahead-global",
    controllerAs: "example",
    templateUrl: "./typeahead-global.component.html",
    styleUrl: "./typeahead-global.component.css",
})
export class TypeaheadGlobalComponent implements AfterViewInit, OnDestroy {
    public model = "";
    private readonly initialConfig: Pick<NgbTypeaheadConfig, "container" | "selectOnExact" | "showHint">;

    constructor(@Inject(NGB_TYPEAHEAD_CONFIG) private readonly config: NgbTypeaheadConfig) {
        this.initialConfig = {
            container: config.container,
            selectOnExact: config.selectOnExact,
            showHint: config.showHint,
        };
        config.container = "body";
        config.selectOnExact = true;
        config.showHint = true;
    }

    public readonly search: OperatorFunction<string, string[]> = text$ => text$.pipe(
        debounceTime(200),
        distinctUntilChanged(),
        map(term => term.length < 2 ? [] : STATES.filter(state => state.toLowerCase().startsWith(term.toLowerCase()))),
    );

    public ngAfterViewInit(): void { this.restoreConfig(); }
    public ngOnDestroy(): void { this.restoreConfig(); }
    private restoreConfig(): void {
        this.config.container = this.initialConfig.container;
        this.config.selectOnExact = this.initialConfig.selectOnExact;
        this.config.showHint = this.initialConfig.showHint;
    }
}
`,u=`<p>Manual text is not accepted; the model changes only after selecting a suggestion.</p>
<label class="form-label" for="non-editable-typeahead">Search for a state</label>
<input id="non-editable-typeahead" type="text" class="form-control" ng-model="example.model" ngb-typeahead="example.search" input-formatter="example.formatter" result-formatter="example.formatter" editable="false" placeholder="Type at least two characters">
<pre class="mt-3 mb-0">Model: {{ example.model | json }}</pre>
`,d=`import { Component } from "ngjs-core";
import { debounceTime, distinctUntilChanged, map, type OperatorFunction } from "rxjs";

interface State { id: number; name: string }
const STATES: State[] = ["Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut", "Delaware", "Florida", "Georgia", "Hawaii"].map((name, id) => ({ id, name }));

@Component({
    selector: "docs-non-editable-typeahead",
    controllerAs: "example",
    templateUrl: "./non-editable-typeahead.component.html",
    styleUrl: "./non-editable-typeahead.component.css",
})
export class NonEditableTypeaheadComponent {
    public model: State | null = null;
    public readonly formatter = (state: State): string => state.name;
    public readonly search: OperatorFunction<string, State[]> = text$ => text$.pipe(
        debounceTime(200),
        distinctUntilChanged(),
        map(term => term.length < 2 ? [] : STATES.filter(state => state.name.toLowerCase().includes(term.toLowerCase()))),
    );
}
`,f=`<label class="form-label" for="simple-typeahead">Search for a state</label>
<input id="simple-typeahead" type="text" class="form-control" ng-model="example.model" ngb-typeahead="example.search" placeholder="Type at least two characters">
<p class="small text-body-secondary mt-2 mb-0">Model: <strong>{{ example.model || 'empty' }}</strong></p>
`,p=`import { Component } from "ngjs-core";
import { debounceTime, distinctUntilChanged, map, type OperatorFunction } from "rxjs";

const STATES = ["Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut", "Delaware", "Florida", "Georgia", "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan", "Minnesota", "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire", "New Jersey", "New Mexico", "New York", "North Carolina", "North Dakota", "Ohio", "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island", "South Carolina", "South Dakota", "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington", "West Virginia", "Wisconsin", "Wyoming"];

@Component({
    selector: "docs-simple-typeahead",
    controllerAs: "example",
    templateUrl: "./simple-typeahead.component.html",
    styleUrl: "./simple-typeahead.component.css",
})
export class SimpleTypeaheadComponent {
    public model = "";
    public readonly search: OperatorFunction<string, string[]> = text$ => text$.pipe(
        debounceTime(200),
        distinctUntilChanged(),
        map(term => term.length < 2 ? [] : STATES.filter(state => state.toLowerCase().includes(term.toLowerCase())).slice(0, 10)),
    );
}
`,m=`<ng-template ng-ref="example.resultTemplate" let-result="result" let-term="term">
    <span class="d-flex align-items-center gap-2">
        <span class="fs-5" aria-hidden="true">{{ result.flag }}</span>
        <span class="flex-grow-1"><ngb-highlight result="result.name" term="term"></ngb-highlight></span>
        <small class="text-body-secondary">{{ result.region }}</small>
    </span>
</ng-template>

<label class="form-label" for="template-results-typeahead">Search for a country</label>
<input id="template-results-typeahead" type="text" class="form-control" ng-model="example.model" ngb-typeahead="example.search" result-template="example.resultTemplate" input-formatter="example.formatter" placeholder="Try Mexico">
<pre class="mt-3 mb-0">Model: {{ example.model | json }}</pre>
`,h=`import { Component, type TemplateRef } from "ngjs-core";
import { debounceTime, map, type OperatorFunction } from "rxjs";

interface Country { name: string; flag: string; region: string }
const COUNTRIES: Country[] = [
    { name: "Mexico", flag: "🇲🇽", region: "North America" },
    { name: "Argentina", flag: "🇦🇷", region: "South America" },
    { name: "Brazil", flag: "🇧🇷", region: "South America" },
    { name: "Canada", flag: "🇨🇦", region: "North America" },
    { name: "Colombia", flag: "🇨🇴", region: "South America" },
    { name: "Germany", flag: "🇩🇪", region: "Europe" },
    { name: "Japan", flag: "🇯🇵", region: "Asia" },
    { name: "Spain", flag: "🇪🇸", region: "Europe" },
];

@Component({
    selector: "docs-template-results-typeahead",
    controllerAs: "example",
    templateUrl: "./template-results-typeahead.component.html",
    styleUrl: "./template-results-typeahead.component.css",
})
export class TemplateResultsTypeaheadComponent {
    public model?: Country;
    public resultTemplate?: TemplateRef<unknown>;
    public readonly formatter = (country: Country): string => country.name;
    public readonly search: OperatorFunction<string, Country[]> = text$ => text$.pipe(
        debounceTime(200),
        map(term => term ? COUNTRIES.filter(country => country.name.toLowerCase().includes(term.toLowerCase())).slice(0, 8) : []),
    );
}
`,g=`<label class="form-label" for="wikipedia-typeahead">Search for a Wikipedia page</label>
<input id="wikipedia-typeahead" type="text" class="form-control" ng-class="{ 'is-invalid': example.searchFailed }" ng-model="example.model" ngb-typeahead="example.search" placeholder="Wikipedia search">
<div class="form-text" ng-if="example.searching">Searching…</div>
<div class="invalid-feedback" ng-if="example.searchFailed">Suggestions could not be loaded.</div>
<p class="small text-body-secondary mt-2 mb-0">Model: <strong>{{ example.model || 'empty' }}</strong></p>
`,_=`import { Component, Injectable } from "ngjs-core";
import { HttpClient, HttpParams } from "ngjs-core/common/http";
import { catchError, debounceTime, distinctUntilChanged, map, type OperatorFunction, of, switchMap, tap } from "rxjs";

const WIKI_URL = "https://en.wikipedia.org/w/api.php";
type WikiResponse = [string, string[], string[], string[]];

@Injectable({ id: "docs.wikipedia.search.service" })
export class WikipediaSearchService {
    constructor(private readonly http: HttpClient) {}

    public search(term: string) {
        if (!term) return of([] as string[]);
        return this.http.get<WikiResponse>(WIKI_URL, {
            params: new HttpParams({ action: "opensearch", format: "json", origin: "*", search: term }),
        }).pipe(map(response => response[1]));
    }
}

@Component({
    selector: "docs-wikipedia-typeahead",
    controllerAs: "example",
    templateUrl: "./wikipedia-typeahead.component.html",
    styleUrl: "./wikipedia-typeahead.component.css",
})
export class WikipediaTypeaheadComponent {
    public model = "";
    public searching = false;
    public searchFailed = false;

    constructor(private readonly wikipedia: WikipediaSearchService) {}

    public readonly search: OperatorFunction<string, string[]> = text$ => text$.pipe(
        debounceTime(300),
        distinctUntilChanged(),
        tap(() => this.searching = true),
        switchMap(term => this.wikipedia.search(term).pipe(
            tap(() => this.searchFailed = false),
            catchError(() => {
                this.searchFailed = true;
                return of([] as string[]);
            }),
        )),
        tap(() => this.searching = false),
    );
}
`,v=class{examples={simple:{html:f,typescript:p},focus:{html:i,typescript:a},formatted:{html:o,typescript:s},exact:{html:n,typescript:r},wikipedia:{html:g,typescript:_},templateResults:{html:m,typescript:h},nonEditable:{html:u,typescript:d},global:{html:c,typescript:l}}};v=e([t({selector:`docs-typeahead-examples-page`,controllerAs:`$`,templateUrl:`/ngb-js-docs/templates/typeahead-examples-page.component-1d2ad0a9.html`,styleUrl:`./typeahead-examples-page.component.css`})],v);export{v as TypeaheadExamplesPageComponent};