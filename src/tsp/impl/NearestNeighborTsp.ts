import { GraphEdge } from '../../GraphEdge.js';
import { GraphNode } from '../../GraphNode.js';
import { AbstractTsp } from './AbstractTsp.js';

export class NearestNeighborTsp extends AbstractTsp {
	public reset() {
		this.bestRoute = this.currentRoute = { route: [], distance: Infinity };
	}

	public async run() {
		const nodes = Array.from(this.nodes.values());
		if (nodes.length <= 1) return [];

		const startIndex = Math.floor(Math.random() * nodes.length);
		const start = nodes[startIndex];
		const unvisited = new Set(nodes.slice(0, startIndex).concat(nodes.slice(startIndex + 1)));

		let current = start;
		let totalDistance = 0;
		const edges = new Array<GraphEdge>();

		for (let i = 0; i < nodes.length - 1; ++i) {
			const next = this.findNearest(current, unvisited);
			totalDistance += this.distanceCalculator.getDistanceBetween(current, next);
			edges.push(new GraphEdge(i.toString(), current, next));

			unvisited.delete(next);
			current = next;
		}

		// close the route
		totalDistance += this.distanceCalculator.getDistanceBetween(current, start);
		edges.push(new GraphEdge((unvisited.size + 1).toString(), current, start));

		this.bestRoute = {
			route: edges,
			distance: totalDistance
		};

		return edges;
	}

	private findNearest(current: GraphNode, unvisited: Set<GraphNode>) {
		let bestNode: GraphNode;
		let bestDist: number;

		for (const node of unvisited) {
			const dist = this.distanceCalculator.getDistanceBetween(current, node);
			if (!bestNode || dist < bestDist) {
				bestDist = dist;
				bestNode = node;
			}
		}

		return bestNode;
	}
}
