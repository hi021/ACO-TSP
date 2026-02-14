import { GraphEdge } from '../GraphEdge.js';
import { AbstractTsp } from './AbstractTsp.js';
import { GraphNode } from '../GraphNode.js';

export class BruteForceTsp extends AbstractTsp {
	public reset(): void {
		this.bestRoute = this.currentRoute = { route: [], distance: Infinity };
	}

	public run(): GraphEdge[] {
		const nodes = [...this.nodes.values()];
		if (nodes.length <= 1) return [];

		const startNode = nodes[0];
		const remainingNodes = nodes.slice(1);
		const permutations = remainingNodes.slice();

		this.evaluateRoute(startNode, permutations);
		const c = new Array(permutations.length).fill(0);
		let i = 0;

		while (i < permutations.length) {
			if (c[i] >= i) {
				c[i++] = 0;
				continue;
			}

			if (i % 2 === 0) {
				// swap perm[0] and perm[i]
				[permutations[0], permutations[i]] = [permutations[i], permutations[0]];
			} else {
				// swap perm[c[i]] and perm[i]
				[permutations[c[i]], permutations[i]] = [permutations[i], permutations[c[i]]];
			}

			this.evaluateRoute(startNode, permutations);
			++c[i];

			i = 0;
		}

		return this.bestRoute.route;
	}

	private evaluateRoute(start: GraphNode, perm: GraphNode[]) {
		let totalDistance = 0;
		let prev = start;

		for (let i = 0; i < perm.length; ++i) {
			const next = perm[i];
			totalDistance += this.distanceCalculator.getDistanceBetween(prev, next);
			prev = next;

			if (totalDistance >= this.bestRoute.distance) return;
		}

		totalDistance += this.distanceCalculator.getDistanceBetween(prev, start);
		if (totalDistance >= this.bestRoute.distance) return;

		const routeEdges: GraphEdge[] = [];
		prev = start;
		for (let i = 0; i < perm.length; i++) {
			const next = perm[i];
			routeEdges.push(new GraphEdge(i.toString(), prev, next));
			prev = next;
		}
		// Closing edge
		routeEdges.push(new GraphEdge(perm.length.toString(), prev, start));

		this.bestRoute = {
			route: routeEdges,
			distance: totalDistance
		};
	}
}
