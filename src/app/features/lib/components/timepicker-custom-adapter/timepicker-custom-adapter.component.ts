import type { IComponentController, IComponentOptions } from "angular";
import { NgbTimeAdapter, type NgbTimeStruct } from "ngb-js/timepicker";

const pad = (value: number): string => value.toString().padStart(2, "0");

export class NgbTimeStringAdapter extends NgbTimeAdapter<string> {
    public fromModel(value: string | null): NgbTimeStruct | null {
        if (!value) return null;
        const [hour, minute, second] = value.split(":").map(Number);
        return { hour, minute, second };
    }

    public toModel(time: NgbTimeStruct | null): string | null {
        return time ? `${pad(time.hour)}:${pad(time.minute)}:${pad(time.second ?? 0)}` : null;
    }
}

// Register once in your application module:
// AppModule.service(NgbTimeAdapter.$name, NgbTimeStringAdapter);

export class TimepickerCustomAdapterComponent implements IComponentController {
    public readonly adapter = new NgbTimeStringAdapter();
    public time = this.adapter.fromModel("13:30:00");
    public model = "13:30:00";

    public $doCheck(): void {
        this.model = this.adapter.toModel(this.time) ?? "";
    }

    static get $name() { return "docsTimepickerCustomAdapter" }
    static get $factory(): IComponentOptions {
        return { controller: TimepickerCustomAdapterComponent, controllerAs: "example", templateUrl: "./timepicker-custom-adapter.component.html", styleUrl: "./timepicker-custom-adapter.component.css" }
    }
}
