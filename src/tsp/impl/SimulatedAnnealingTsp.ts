import { GraphEdge } from '../../GraphEdge.js';
import { GraphNode } from '../../GraphNode.js';
import { AbstractTsp, BasicTspParameters } from './AbstractTsp.js';

export interface SimulatedAnnealingParameters {
	initialTemp: number;
	minTemp: number;
	coolRate: number;
	iterationsPerStep: number;
}

export class SimulatedAnnealingTsp extends AbstractTsp {
	private initialTemp: number;
	private minTemp: number;
	private coolRate: number;
	private iterationsPerStep: number;

	constructor(parameters: BasicTspParameters & SimulatedAnnealingParameters) {
		super(parameters);
		this.initialTemp = parameters.initialTemp;
		this.minTemp = parameters.minTemp;
		this.coolRate = parameters.coolRate;
		this.iterationsPerStep = parameters.iterationsPerStep;
	}

	public reset() {
		this.bestRoute = this.currentRoute = { route: [], distance: Infinity };
	}

	public async run() {
		const nodes = Array.from(this.nodes.values());
		if (nodes.length <= 1) return [];

		let currentOrder = nodes.slice();
		let currentDistance = this.computeRouteDistance(currentOrder);
		this.updateBestRoute(currentOrder, currentDistance);

		let temperature = this.initialTemp;

		while (temperature > this.minTemp) {
			for (let i = 0; i < this.iterationsPerStep; ++i) {
				const neighborOrder = this.generateNeighbor(currentOrder);
				const neighborDistance = this.computeRouteDistance(neighborOrder);

				if (this.acceptanceProbability(currentDistance, neighborDistance, temperature) > Math.random()) {
					currentOrder = neighborOrder;
					currentDistance = neighborDistance;

					if (neighborDistance < this.bestRoute.distance) this.updateBestRoute(neighborOrder, neighborDistance);
				}
			}
			temperature *= this.coolRate;
		}

		return this.bestRoute.route;
	}

	private computeRouteDistance(order: GraphNode[]) {
		if (order.length <= 1) return 0;

		let total = 0;
		for (let i = 0; i < order.length - 1; ++i)
			total += this.distanceCalculator.getDistanceBetween(order[i], order[i + 1]);

		// close route
		total += this.distanceCalculator.getDistanceBetween(order[order.length - 1], order[0]);
		return total;
	}

	private generateNeighbor(order: GraphNode[]) {
		// 2-opt
		const n = order.length;
		const i = 1 + Math.floor(Math.random() * (n - 1));
		let j = 1 + Math.floor(Math.random() * (n - 1));
		if (i == j) j = (j % (n - 1)) + 1;

		const a = Math.min(i, j);
		const b = Math.max(i, j);

		const neighbor = order.slice();
		for (let left = a, right = b; left < right; left++, right--) {
			const tmp = neighbor[left];
			neighbor[left] = neighbor[right];
			neighbor[right] = tmp;
		}
		return neighbor;
	}

	private acceptanceProbability(current: number, next: number, temperature: number) {
		if (next < current) return 1;
		const delta = next - current;
		return Math.exp(-delta / temperature);
	}

	private updateBestRoute(order: GraphNode[], distance: number) {
		const edges: GraphEdge[] = [];
		let i = 0;
		for (; i < order.length - 1; ++i) edges.push(new GraphEdge(i.toString(), order[i], order[i + 1]));

		edges.push(new GraphEdge(i.toString(), order[order.length - 1], order[0]));

		this.bestRoute = {
			route: edges,
			distance
		};
	}
}
