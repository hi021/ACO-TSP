import { GraphNode } from "./GraphNode.js";

export class GraphEdge {
    id: string;
    source: GraphNode;
    target: GraphNode;
    pheromoneIntensity = 0;

    constructor(id: string, source: GraphNode, target: GraphNode) {
        this.id = id;
        this.source = source;
        this.target = target;
    }

    public static buildGraph(nodes: GraphNode[]) {
        const edges = new Array<GraphEdge>(nodes.length - 1);
        for(let i = 1; i < nodes.length; ++i)
            edges[i - 1] = new GraphEdge(i.toString(), nodes[i - 1], nodes[i]);
        return edges;
    }
}
