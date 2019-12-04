// imports
import {BreakpointsDefinition} from "./types";


// types
interface ILatticeDefaults {
    breakpoints: BreakpointsDefinition;
    namespacePrefix: string;
}


// exports
export const LatticeDefaults: ILatticeDefaults = {
    breakpoints: {
        xs: 0,
        sm: 600,
        md: 960,
        lg: 1280,
        xl: 1920
    },
    namespacePrefix: "nd_"
};
