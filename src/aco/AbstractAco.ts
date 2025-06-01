import { AbstractDistanceCalculator } from "../distance/AbstractDistanceCalculator";
import { GraphEdge } from "../GraphEdge";
import { GraphNode } from "../GraphNode";
import { Ant } from "./Ant";

export interface BasicAcoParameters {
    pheromoneImportance: number;
    distancePriority: number;
    evaporationRate: number;
}

export abstract class AbstractAco {
    parameters: BasicAcoParameters & { maxIterations: number; depositRate: number; }
    currentIteration: number;
    pheromoneMatrix: number[][];
    nodes: Map<string, GraphNode>;
    ants: Ant[];
    currentRoute: {
        route: GraphEdge[];
        distance: number;
    }
    bestRoute: {
        route: GraphEdge[];
        distance: number;
    }
    distanceCalculator: AbstractDistanceCalculator;
    distanceHistory: number[];

    public abstract reset(): void;
    public abstract run(): GraphEdge[];
}
