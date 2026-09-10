import { Inject, Injectable } from "ngjs-core";
import type { TransitionService } from "@uirouter/angularjs";
import { ReplaySubject } from "rxjs";
import type { HeadingData } from "@/core/models/title.model.ts";

@Injectable({ id: "docs.title.service" })
export class TitleService {
    static readonly $name = "docs.title.service";

    private _transition = new ReplaySubject<HeadingData>(undefined)
    public transition$ = this._transition.asObservable()

    private _currentTab?: string

    get currentTab() {
        return this._currentTab
    }

    set currentTab(tab: string | undefined) {
        this._currentTab = tab
    }

    constructor(
        @Inject("$transitions") private transitionService: TransitionService,
    ) {}

    public observeRoute() {
        this.transitionService.onEnter({}, transition => {
            const toState = transition.to()

            const data = {
                title: toState.data?.title,
                tabs: toState.data?.tabs,
                sections: toState.data?.sections,
                externalLinks: toState.data?.externalLinks,
                header: toState.data?.header ?? true,
            }

            this._currentTab = toState.name
            this._transition.next(data)
        })
    }
}
