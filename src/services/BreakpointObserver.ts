// imports
import {Scribe} from "@nascentdigital/scribe";
import {BehaviorSubject, Observable} from "rxjs";
import {filter} from "rxjs/operators";
import {MediaQueryFactory} from "./MediaQueryFactory";
import {Breakpoint, Breakpoints, BreakpointObservation, BreakpointsDefinition} from "../types";


// constants
const log = Scribe.getLog("nd-lattice:BreakpointObserver");


// type definitions
interface IBreakpointContext {
    breakpoint: Breakpoint;
    query: string;
    mediaQuery?: any;
    mediaQueryCallback?: (e: any) => void;
}


// class definition
export class BreakpointObserver {

    private readonly _contexts: IBreakpointContext[];
    private _current: BreakpointObservation;
    private _current$: BehaviorSubject<BreakpointObservation>;


    constructor(breakpoints: BreakpointsDefinition) {

        log.debug("initializing with breakpoints: ", breakpoints);

        // initialize instance variables
        this._contexts = BreakpointObserver.createContexts(breakpoints);
        this._current = null;
        this._current$ = new BehaviorSubject<BreakpointObservation>(this._current);

        // bind breakpoints
        this._contexts.forEach((context) => {

            // initialize media query callback
            const breakpoint = context.breakpoint;
            context.mediaQueryCallback = (e) => {

                log.debug(`mediaQuery callback for "${breakpoint}": `, e);

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
        const queryFactory = new MediaQueryFactory(breakpoints, {queryOnly: true});
        Breakpoints.forEach(breakpoint => {

            // create base context
            const context: IBreakpointContext = {
                breakpoint: breakpoint,
                query: queryFactory.only(breakpoint)
            };

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

        log.debug(`creating mediaQuery for "${context.breakpoint}": `, context.query);

        // bind new media query
        context.mediaQuery = window.matchMedia(context.query);
        context.mediaQuery.addListener(context.mediaQueryCallback);

        // update breakpoint if matching
        if (context.mediaQuery.matches) {
            this.setCurrent(context.breakpoint);
        }
    }
}
