// imports
import {Breakpoint, Breakpoints, BreakpointsDefinition} from "../types";


// constants
const MediaQueryPrefix = "@media";
const BreakpointDelta = 0.05;


// types
interface MediaQueryOptions {
    queryOnly?: boolean;
}


// class
export class MediaQueryFactory {

    public readonly breakpoints: BreakpointsDefinition;
    private readonly prefix: string;


    constructor(breakpoints: BreakpointsDefinition, options: MediaQueryOptions = {}) {
        this.breakpoints = breakpoints;
        this.prefix = options.queryOnly ? "" : `${MediaQueryPrefix} `;
    }


    public up(start: Breakpoint) {
        return `${this.prefix}screen and (min-width: ${this.breakpoints[start]}px)`;
    }

    public down(end: Breakpoint) {
        return end === "xl"
            ? this.up("xs")
            : `${this.prefix}screen and (max-width: ${this.upperWidth(end)}px)`;
    }

    public between(start: Breakpoint, end: Breakpoint) {
        return end === "xl"
            ? this.up(start)
            : `${this.up(start)} and (max-width: ${this.upperWidth(end)}px)`;
    }

    public only(breakpoint: Breakpoint) {
        return this.between(breakpoint, breakpoint);
    }

    public width(breakpoint: Breakpoint) {
        return this.breakpoints[breakpoint];
    }

    private upperWidth(breakpoint: Breakpoint) {

        // throw if breakpoint is xl
        if (breakpoint === "xl") {
            throw new Error(`Breakpoint "xl" has no upper limit.`);
        }

        breakpoint = Breakpoints[Breakpoints.indexOf(breakpoint) + 1];
        return this.breakpoints[breakpoint] - BreakpointDelta;
    }
}
