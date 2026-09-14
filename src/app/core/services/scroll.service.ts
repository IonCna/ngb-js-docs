import { Injectable } from "ngjs-core";
import { filter } from "rxjs";
import { NavigationEnd, Router } from "ngjs-core/router";

@Injectable({ id: "docs.scroll.service" })
export class ScrollService {
    constructor(private readonly router: Router) {
        this.router.events
            .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
            .subscribe(() => {
                requestAnimationFrame(() => {
                    document.getElementById("docs-content-scroll")?.scrollTo({
                        top: 0,
                        left: 0,
                        behavior: "auto",
                    })
                })
            })
    }
}
