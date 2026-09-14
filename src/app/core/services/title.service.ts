import { Injectable } from "ngjs-core";
import { ReplaySubject } from "rxjs";
import { ActivatedRoute, Router } from "ngjs-core/router";
import type { HeadingData } from "@/core/models/title.model.ts";

@Injectable({ id: "docs.title.service" })
export class TitleService {
    private _transition = new ReplaySubject<HeadingData>(1)
    public transition$ = this._transition.asObservable()

    /**
     * Ruta activa. `ActivatedRoute`/`Router` de ngjs-core no exponen el
     * *nombre* del estado (solo la URL), así que acá va la URL — `title-heading`
     * compara esto contra `tabs[].to`, que ahora son paths (`/components/...`),
     * no nombres de estado UI-Router.
     */
    private _currentTab?: string

    get currentTab() {
        return this._currentTab
    }

    set currentTab(tab: string | undefined) {
        this._currentTab = tab
    }

    constructor(
        private readonly activatedRoute: ActivatedRoute,
        private readonly router: Router,
    ) {
        this.activatedRoute.data.subscribe(data => {
            this._currentTab = this.router.url
            this._transition.next({
                title: data.title as string,
                header: (data.header ?? true) as boolean,
                tabs: (data.tabs ?? []) as HeadingData["tabs"],
                sections: data.sections as HeadingData["sections"],
                externalLinks: data.externalLinks as HeadingData["externalLinks"],
            })
        })
    }
}
