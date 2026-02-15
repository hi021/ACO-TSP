import { AbstractDistanceCalculator } from './AbstractDistanceCalculator.js';
import { GraphEdge } from '../GraphEdge.js';
import { GraphNode } from '../GraphNode.js';

export class GeographicalDistanceCalculator extends AbstractDistanceCalculator {
	public static PI = 3.141592;
	public static EARTH_RADIUS = 6378.388;

	constructor(precision = 0) {
		super(precision);
	}

	public getDistanceBetween(source: GraphNode, target: GraphNode) {
		const sourceX = source.position.native.x;
		const sourceY = source.position.native.y;
		const targetX = target.position.native.x;
		const targetY = target.position.native.y;

		const sourceLat = this.calculateCoordinate(sourceX);
		const sourceLon = this.calculateCoordinate(sourceY);
		const targetLat = this.calculateCoordinate(targetX);
		const targetLon = this.calculateCoordinate(targetY);

		const q1 = Math.cos(sourceLon - targetLon);
		const q2 = Math.cos(sourceLat - targetLat);
		const q3 = Math.cos(sourceLat + targetLat);

		const distance = ~~(
			GeographicalDistanceCalculator.EARTH_RADIUS * Math.acos(0.5 * ((1 + q1) * q2 - (1 - q1) * q3)) +
			1
		);
		return this.precision ? Number(distance.toFixed(this.precision)) : distance;
	}

	public getDistanceForEdge(edge: GraphEdge) {
		return this.getDistanceBetween(edge.source, edge.target);
	}

	public getTotalDistance(edges: GraphEdge[]) {
		let distance = 0;
		for (const edge of edges) distance += this.getDistanceForEdge(edge);
		return distance;
	}

	private calculateCoordinate(coordinate: number) {
		const deg = ~~coordinate;
		const min = coordinate - deg;
		return (GeographicalDistanceCalculator.PI * (deg + (5 * min) / 3)) / 180;
	}
}
