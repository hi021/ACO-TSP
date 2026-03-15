import { AbstractDistanceCalculator } from './AbstractDistanceCalculator.js';
import { GraphEdge } from '../GraphEdge';
import { GraphNode } from '../GraphNode';

export class EuclideanDistanceCalculator extends AbstractDistanceCalculator {
	constructor(precision = 0) {
		super(precision);
	}

	public getDistanceBetween(source: GraphNode, target: GraphNode) {
		const sourceX = source.position.native.x;
		const sourceY = source.position.native.y;
		const targetX = target.position.native.x;
		const targetY = target.position.native.y;

		const distance = Math.sqrt((sourceX - targetX) ** 2 + (sourceY - targetY) ** 2);
		return Math.round(distance);
	}

	public getDistanceForEdge(edge: GraphEdge) {
		return this.getDistanceBetween(edge.source, edge.target);
	}

	public getTotalDistance(edges: GraphEdge[]) {
		let distance = 0;
		for (const edge of edges) distance += this.getDistanceForEdge(edge);
		return distance;
	}
}
