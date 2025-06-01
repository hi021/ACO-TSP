import { AbstractDistanceCalculator } from "../distance/AbstractDistanceCalculator.js";
import { AbstractAco, BasicAcoParameters } from "./AbstractAco";
import { GraphEdge } from "../GraphEdge.js";
import { GraphNode } from "../GraphNode.js";
import { Ant } from "./Ant.js";

export class Aco implements AbstractAco {
    parameters: BasicAcoParameters & { maxIterations: number, depositRate: number; };
    ants: Ant[];
    nodes: Map<string, GraphNode>;
    pheromoneMatrix: number[][];
    inverseDistanceMatrix: number[][];
    currentRoute: { route: GraphEdge[]; distance: number; };
    bestRoute: { route: GraphEdge[]; distance: number; };
    currentIteration: number;
    distanceCalculator: AbstractDistanceCalculator;
    distanceHistory: number[];

    constructor(parameters: BasicAcoParameters & { depositRate: number; maxIterations: number; antCount: number; nodes: Map<string, GraphNode>; distanceCalculator: AbstractDistanceCalculator }) {
        this.parameters = {
            depositRate: parameters.depositRate,
            pheromoneImportance: parameters.pheromoneImportance,
            distancePriority: parameters.distancePriority,
            evaporationRate: parameters.evaporationRate,
            maxIterations: parameters.maxIterations
        }
        this.distanceCalculator = parameters.distanceCalculator;
        this.nodes = parameters.nodes;
        this.ants = new Array<Ant>(parameters.antCount);

        this.reset();
    }

    public reset() {
        this.currentIteration = 0;
        this.distanceHistory = new Array<number>(this.parameters.maxIterations);
        this.bestRoute = this.currentRoute = { route: [], distance: Infinity };

        this.allocatePheromoneMatrix();
        this.allocateAndCalculateInverseDistanceMatrix();
    }

    public run() {
        let iterationResult: GraphEdge[], result: GraphEdge[];
        while(iterationResult = this.nextIteration()) result = iterationResult;
        return result;
    }

    private nextIteration() {
        if(this.currentIteration >= this.parameters.maxIterations) return;
        this.currentRoute = { route: [], distance: 0 };

        for(let i = 0; i < this.ants.length; ++i)
            this.ants[i] = new Ant([...this.nodes.values()]);

        for(let i = 0; i < this.nodes.size; ++i) {
            for(const ant of this.ants)
                ant.pickAndVisitNode(this.nodes, this.pheromoneMatrix, this.inverseDistanceMatrix, this.parameters);
            for(const ant of this.ants)
                ant.depositPheromones(this.pheromoneMatrix, this.inverseDistanceMatrix, this.parameters.depositRate);
        }
        this.evaporatePheromones();

        // pick best iteration route
        for(const ant of this.ants) {
            const antDistance = ant.getClosedDistance(this.distanceCalculator);
            if(!this.currentRoute.route.length || this.currentRoute.distance > antDistance)
                this.currentRoute = { route: GraphEdge.buildGraph(ant.closedRoute), distance: antDistance };
        }

        if(this.currentRoute.distance < this.bestRoute.distance)
            this.bestRoute = this.currentRoute;

        this.distanceHistory[this.currentIteration] = this.bestRoute.distance;

        ++this.currentIteration;
        return this.bestRoute.route;
    }

    private evaporatePheromones() {
        for(const i in this.pheromoneMatrix) {
            for(const j in this.pheromoneMatrix[i])
                this.pheromoneMatrix[i][j] *= this.parameters.evaporationRate;
        }
    }

    private allocatePheromoneMatrix() {
        this.pheromoneMatrix = new Array<number[]>(this.nodes.size);

        for(let i = 0; i < this.pheromoneMatrix.length; ++i)
            this.pheromoneMatrix[i] = new Array<number>(this.nodes.size).fill(1);

        return this.pheromoneMatrix;
    }

    private allocateAndCalculateInverseDistanceMatrix() {
        this.inverseDistanceMatrix = new Array<number[]>(this.nodes.size);

        for(let i = 0; i < this.inverseDistanceMatrix.length; ++i) {
            this.inverseDistanceMatrix[i] = new Array<number>(this.nodes.size);
            for(let j = 0; j < this.inverseDistanceMatrix[i].length; ++j) {
                const sourceId = (i + 1).toString();
                const targetId = (j + 1).toString();
                this.inverseDistanceMatrix[i][j] = i == j ? 0 : 1 / this.distanceCalculator.getDistanceBetween(this.nodes.get(sourceId), this.nodes.get(targetId));
            }
        }

        return this.inverseDistanceMatrix;
    }
}
