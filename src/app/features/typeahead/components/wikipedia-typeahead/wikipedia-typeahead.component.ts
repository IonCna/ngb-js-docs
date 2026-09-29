import { Component, Injectable } from "ngjs-core";
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
