// imports
import {BreakpointsDefinition} from "./types";


// types
interface ILatticeDefaults {
    breakpoints: BreakpointsDefinition;
    namespacePrefix: string;
}
interface ILatticeConstants {
    defaults: ILatticeDefaults;
}


// exports
export const Constants: ILatticeConstants = {
    defaults: {
        breakpoints: {
            xs: 0,
            sm: 600,
            md: 960,
            lg: 1280,
            xl: 1920
        },
        namespacePrefix: "nd_"
    }
};
