import { GraphEdge } from "../GraphEdge";
import { GraphNode } from "../GraphNode";

export abstract class AbstractDistanceCalculator {
    protected precision: number; // number of fraction digits or raw if 0

    constructor(precision = 0) {
        this.precision = precision;
    }

    public abstract getDistanceBetween(source: GraphNode, target: GraphNode): number
    public abstract getDistanceForEdge(edge: GraphEdge): number
    public abstract getTotalDistance(edges: GraphEdge[]): number
}
