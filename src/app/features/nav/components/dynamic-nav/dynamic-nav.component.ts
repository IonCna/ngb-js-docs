import { Component } from "ngjs-core";

interface DynamicNavItem {
    id: string;
    title: string;
}

@Component({
    selector: "docs-dynamic-nav",
    controllerAs: "example",
    templateUrl: "./dynamic-nav.component.html",
    styleUrl: "./dynamic-nav.component.css",
})
export class DynamicNavComponent {
    public items: DynamicNavItem[] = [
        { id: "dynamic-1", title: "Tab 1" },
        { id: "dynamic-2", title: "Tab 2" },
        { id: "dynamic-3", title: "Tab 3" },
    ];
    public activeId = "dynamic-1";
    private nextId = 4;

    public add() {
        const item = {
            id: `dynamic-${this.nextId}`,
            title: `Tab ${this.nextId}`,
        };

        this.nextId++;
        this.items.push(item);
        this.activeId = item.id;
    }

    public removeActive() {
        if (this.items.length === 1) return;

        const activeIndex = this.items.findIndex(({ id }) => id === this.activeId);
        const replacement = this.items[activeIndex === 0 ? 1 : activeIndex - 1];

        this.activeId = replacement.id;
        this.items = this.items.filter(({ id }) => id !== this.items[activeIndex].id);
    }
}
