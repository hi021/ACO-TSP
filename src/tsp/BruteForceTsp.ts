import { GraphEdge } from '../GraphEdge.js';
import { GraphNode } from '../GraphNode.js';
import { AbstractTsp } from './AbstractTsp.js';

declare const Go: new () => any;
declare const runBruteForce: (nodeArgs: string) => string;

export class BruteForceTsp extends AbstractTsp {
	public reset(): void {
		this.bestRoute = this.currentRoute = { route: [], distance: Infinity };
	}

	public async run() {
		console.log([...this.nodes.values()])
		console.log(JSON.stringify([...this.nodes.values()]))
		const go = new Go();
		const wasm = await WebAssembly.instantiateStreaming(fetch('/go-src/brute-force.wasm'), go.importObject);
		go.run(wasm.instance);

		const resultJson = runBruteForce(JSON.stringify([...this.nodes.values()]));
		const result = JSON.parse(resultJson) as { route: GraphEdge[]; distance: number };

		console.log(result);

		// TODO convert from plain object!
		this.bestRoute = result;

		return result.route;
	}

	// public run(): GraphEdge[] {
	// 	const nodes = [...this.nodes.values()];
	// 	if (nodes.length <= 1) return [];

	// 	const startNode = nodes[0];
	// 	const remainingNodes = nodes.slice(1);
	// 	const permutations = remainingNodes.slice();

	// 	this.evaluateRoute(startNode, permutations);
	// 	const c = new Array(permutations.length).fill(0);
	// 	let i = 0;

	// 	let prevPermutationCount = 0;
	// 	let permutationCount = 0;
	// 	let startPerf = performance.now();

	// 	while (i < permutations.length) {
	// 		if (c[i] >= i) {
	// 			c[i++] = 0;
	// 			continue;
	// 		}

	// 		if (i % 2 === 0) [permutations[0], permutations[i]] = [permutations[i], permutations[0]];
	// 		else [permutations[c[i]], permutations[i]] = [permutations[i], permutations[c[i]]];

	// 		this.evaluateRoute(startNode, permutations);
	// 		++c[i];

	// 		++permutationCount;
	// 		const curPerf = performance.now();
	// 		const sincePerf = curPerf - startPerf;
	// 		if (sincePerf >= 1000) {
	// 			const permsPerSecond = (permutationCount - prevPermutationCount) / (sincePerf / 1000);
	// 			console.debug(`${permutationCount} total, ${permsPerSecond}/s`);
	// 			startPerf = curPerf;
	// 			prevPermutationCount = permutationCount;
	// 		}

	// 		i = 0;
	// 	}

	// 	return this.bestRoute.route;
	// }

	// private evaluateRoute(start: GraphNode, perm: GraphNode[]) {
	// 	let totalDistance = 0;
	// 	let prev = start;

	// 	for (let i = 0; i < perm.length; ++i) {
	// 		const next = perm[i];
	// 		totalDistance += this.distanceCalculator.getDistanceBetween(prev, next);
	// 		prev = next;

	// 		if (totalDistance >= this.bestRoute.distance) return;
	// 	}

	// 	totalDistance += this.distanceCalculator.getDistanceBetween(prev, start);
	// 	if (totalDistance >= this.bestRoute.distance) return;

	// 	const routeEdges: GraphEdge[] = [];
	// 	prev = start;
	// 	for (let i = 0; i < perm.length; i++) {
	// 		const next = perm[i];
	// 		routeEdges.push(new GraphEdge(i.toString(), prev, next));
	// 		prev = next;
	// 	}
	// 	// Closing edge
	// 	routeEdges.push(new GraphEdge(perm.length.toString(), prev, start));

	// 	this.bestRoute = {
	// 		route: routeEdges,
	// 		distance: totalDistance
	// 	};
	// }
}
