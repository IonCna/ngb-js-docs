import { Inject, Injectable } from "ngjs-core";
import type { TransitionService } from "@uirouter/angularjs";

@Injectable({ id: "docs.scroll.service" })
export class ScrollService {
    static readonly $name = "docs.scroll.service";

    constructor(
        @Inject("$transitions") private $transitionService: TransitionService,
    ) {}

    observeScroll() {
        this.$transitionService.onSuccess({}, () => {
            window.requestAnimationFrame(() => {
                document.getElementById("docs-content-scroll")?.scrollTo({
                    top: 0,
                    left: 0,
                    behavior: "auto",
                })
            })
        })
    }
}
