// imports
import {BehaviorSubject, Observable} from "rxjs";
import {filter} from "rxjs/operators";
import {Breakpoint, Breakpoints, BreakpointObservation, BreakpointsDefinition} from "../types";


// type definitions
interface IBreakpointContext {
    breakpoint: Breakpoint;
    start: number;
    end?: number;
    mediaQuery?: any;
    mediaQueryCallback?: (e: any) => void;
}

// class definition
export class BreakpointObserver {

    private readonly _contexts: IBreakpointContext[];
    private _current: BreakpointObservation;
    private _current$: BehaviorSubject<BreakpointObservation>;


    constructor(breakpoints: BreakpointsDefinition) {

        // initialize instance variables
        this._contexts = BreakpointObserver.createContexts(breakpoints);
        this._current = null;
        this._current$ = new BehaviorSubject<BreakpointObservation>(this._current);

        // bind breakpoints
        this._contexts.forEach((context) => {

            // initialize media query callback
            const breakpoint = context.breakpoint;
            context.mediaQueryCallback = (e) => {

                // update if matches and not current
                if (e.matches) {
                    this.setCurrent(breakpoint);
                }
            };

            // bind breakpoint (indirectly updates to matching breakpoint)
            this.bindBreakpoint(context);
        });
    }

    public dispose() {
        this._contexts.forEach((context) =>
            context.mediaQuery.removeListener(context.mediaQueryCallback));
    }

    private static createContexts(breakpoints: BreakpointsDefinition): IBreakpointContext[] {

        // create contexts
        const contexts: IBreakpointContext[] = [];

        // iterate over breakpoints
        Breakpoints.forEach((breakpoint: Breakpoint, breakpointIndex: number) => {

            // create base context
            const breakpointWidth = breakpoints[breakpoint];
            const context: IBreakpointContext = {
                breakpoint: breakpoint,
                start: breakpointWidth
            };

            // special handling for upper breakpoint
            if (breakpointIndex + 1 < Breakpoints.length) {

                // resolve next breakpoint
                const endBreakpoint = Breakpoints[breakpointIndex + 1];
                const endBreakpointWidth = breakpoints[endBreakpoint];

                // update context
                context.end = endBreakpointWidth - 1;
            }

            // add context
            contexts.push(context);
        });

        // return contexts
        return contexts;
    }

    get current(): BreakpointObservation {
        return this._current;
    }

    get current$(): Observable<BreakpointObservation> {
        return this._current$
            .pipe(filter((breakpoint: any) => breakpoint !== null));
    }

    private setCurrent(breakpoint: Breakpoint) {
        if (this._current !== breakpoint) {
            this._current = breakpoint;
            this._current$.next(breakpoint);
        }
    }

    private bindBreakpoint(context: IBreakpointContext) {

        // unbind previous media query (if any)
        if (context.mediaQuery !== undefined) {
            context.mediaQuery.removeEventListener(context.mediaQueryCallback);
        }

        // create last breakpoint query
        let mediaQuery;
        if (context.end === undefined) {
            mediaQuery = `(min-width: ${context.start}px)`;
        }

        // or create first breakpoint query
        else if (context.start === 0) {
            mediaQuery = `(max-width: ${context.end}px)`;
        }

        // or create bounded breakpoint query
        else {
            mediaQuery = `(min-width: ${context.start}px) and (max-width: ${context.end - 1}px)`;
        }

        // bind new media query
        context.mediaQuery = window.matchMedia(mediaQuery);
        context.mediaQuery.addListener(context.mediaQueryCallback);

        // update breakpoint if matching
        if (context.mediaQuery.matches) {
            this.setCurrent(context.breakpoint);
        }
    }
}
