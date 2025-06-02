import { AbstractDistanceCalculator } from "../distance/AbstractDistanceCalculator.js";
import { GraphNode } from "../GraphNode.js";
import { Utils } from "../util/Utils.js";
import { BasicAcoParameters } from "./AbstractAco.js";

export class Ant {
    route: Set<GraphNode>;
    distance: number;

    constructor(nodes: GraphNode[]) {
        this.route = new Set<GraphNode>();
        this.distance = 0;
        this.visitRandomNode(nodes);
    }

    get startNode() {
        return Utils.getSetElementByIndex(this.route, 0);
    }
    get currentNode() {
        return Utils.getSetElementByIndex(this.route, this.route.size - 1);
    }
    get previousNode() {
        return Utils.getSetElementByIndex(this.route, this.route.size - 2);
    }

    get closedRoute() {
        return [...this.route, this.startNode];
    }
    public getClosedDistance(distanceCalculator: AbstractDistanceCalculator) {
        return this.distance + distanceCalculator.getDistanceBetween(this.currentNode, this.startNode);
    }

    public hasVisited(node: GraphNode) {
        return this.route.has(node);
    }

    public visitNode(node: GraphNode, distance?: number) {
        this.route.add(node);
        if(distance) this.distance += distance;
        return node;
    }

    public visitRandomNode(nodes: GraphNode[]) {
        for(let i = 0; i < nodes.length * 12; i++) {
            const node = Utils.randomFromArray(nodes);
            if(!this.hasVisited(node)) {
                this.visitNode(node);
                return true;
            }
        }

        return false;
    }

    public pickAndVisitNode(nodes: Map<string, GraphNode>, pheromoneMatrix: number[][], inverseDistanceMatrix: number[][], parameters: BasicAcoParameters) {
        const sourceId = this.currentNode.numericId;
        const unvisitedNodeCount = nodes.size - this.route.size;
        if(unvisitedNodeCount <= 0) return null;

        const probabilityMatrix = this.calculateProbabilityMatrix(sourceId, nodes, pheromoneMatrix, inverseDistanceMatrix, parameters);

        let currentProbability = 0;
        const probabilityThreshold = Math.random();
        for(const i in probabilityMatrix) {
            currentProbability += probabilityMatrix[i];
            if(currentProbability >= probabilityThreshold) {
                const targetId = (Number(i) + 1).toString()
                const targetNode = nodes.get(targetId);
                const distance = 1 / inverseDistanceMatrix[sourceId][i];

                this.visitNode(targetNode, distance);
                return targetNode;
            }
        }

        console.warn(probabilityMatrix, "currentProbability: " + currentProbability, "probabilityThreshold: " + probabilityThreshold);
        throw new Error("Failed to pick ant target node.")
    }

    public depositPheromones(pheromoneMatrix: number[][], inverseDistanceMatrix: number[][], pheromoneDepositRate: number) {
        const sourceId = this.previousNode.numericId;
        const targetId = this.currentNode.numericId;
        const desirability = inverseDistanceMatrix[sourceId][targetId];
        pheromoneMatrix[sourceId][targetId] += pheromoneDepositRate * desirability;
    }

    private calculateProbabilityMatrix(sourceId: number, nodes: Map<string, GraphNode>, pheromoneMatrix: number[][], inverseDistanceMatrix: number[][], parameters: BasicAcoParameters) {
        let probabilitySum = 0;
        const probabilityMatrix = new Array<number>(nodes.size).fill(0);

        for(let i = 0; i < probabilityMatrix.length; ++i) {
            const targetId = (i + 1).toString()
            const targetNode = nodes.get(targetId);
            if(targetNode.numericId == sourceId || this.hasVisited(targetNode)) continue;

            const desirability = inverseDistanceMatrix[sourceId][i];
            const pheromoneIntensity = pheromoneMatrix[sourceId][i];

            const probability = (desirability ** parameters.distancePriority * pheromoneIntensity ** parameters.pheromoneImportance);

            probabilityMatrix[i] = probability;
            probabilitySum += probability;
        }

        for(let i = 0; i < probabilityMatrix.length; ++i)
            probabilityMatrix[i] /= probabilitySum;

        return probabilityMatrix;
    }
}
