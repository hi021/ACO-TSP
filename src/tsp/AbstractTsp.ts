import { AbstractDistanceCalculator } from '../distance/AbstractDistanceCalculator';
import { GraphEdge } from '../GraphEdge.js';
import { GraphNode } from '../GraphNode.js';

export interface BasicTspParameters {
	nodes: Map<string, GraphNode>;
	distanceCalculator: AbstractDistanceCalculator;
}

export abstract class AbstractTsp {
	distanceCalculator: AbstractDistanceCalculator;
	nodes: Map<string, GraphNode>;
	currentRoute: {
		route: GraphEdge[];
		distance: number;
	};
	bestRoute: {
		route: GraphEdge[];
		distance: number;
	};

	constructor(parameters: BasicTspParameters) {
		this.distanceCalculator = parameters.distanceCalculator;
		this.nodes = parameters.nodes;
		this.reset();
	}

	public abstract reset(): void;
	public abstract run(): GraphEdge[];
}
