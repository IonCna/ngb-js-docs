import { Inject, Injectable } from "ngjs-core";
import { Subject } from "rxjs";

import { NgbOffcanvas, NGB_OFFCANVAS } from "ngb-js/offcanvas/compat"
import { MenuComponent } from "@/core/layouts/components/menu/menu.component"

@Injectable({ id: "core.menu.service" })
export class MenuService {
    static readonly $name = "core.menu.service";

    private _isOpen = false;
    private _change = new Subject<boolean>();
    public onChange$ = this._change.asObservable();

    constructor(@Inject(NGB_OFFCANVAS) private offCanvasService: NgbOffcanvas) {}

    public toggleMenu() {
        if (this._isOpen || this.offCanvasService.hasOpenOffcanvas()) {
            return
        }

        this._setOpenState(true)

        this.offCanvasService.open(MenuComponent.$name, {
            bindings: { mode: "mobile" },
            ariaLabelledBy: "docs-mobile-menu-title",
            animation: true,
            backdrop: true,
            keyboard: true,
            panelClass: "border-0 shadow",
            position: "start",
            scroll: false,
        }).then((offcanvasRef) => {
            offcanvasRef.result?.finally(() => this._setOpenState(false))
        }, () => {
            this._setOpenState(false)
        })
    }

    private _setOpenState(isOpen: boolean) {
        this._isOpen = isOpen
        this._change.next(this._isOpen)
    }
}
