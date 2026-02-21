import { GraphNode } from './GraphNode.js';
import { Point } from './util/Point.js';

export type NodeAsObject = {
	id: string;
	position: { native: Point; displayed: Point };
	color?: string;
};
export type EdgeAsObject = {
	id: string;
	source: NodeAsObject;
	target: NodeAsObject;
	pheromoneIntensity?: number;
	datasetId?: number;
	color?: string;
};

export class GraphEdge {
	id: string;
	source: GraphNode;
	target: GraphNode;
	pheromoneIntensity = 0;
	datasetId = 0;
	color?: string;

	constructor(id: string, source: GraphNode, target: GraphNode, datasetId = 0) {
		this.id = id;
		this.source = source;
		this.target = target;
		this.datasetId = datasetId;
	}

	public static buildGraph(nodes: GraphNode[], datasetId?: number) {
		const edges = new Array<GraphEdge>(nodes.length - 1);
		for (let i = 1; i < nodes.length; ++i)
			edges[i - 1] = new GraphEdge(i.toString(), nodes[i - 1], nodes[i], datasetId);
		return edges;
	}

	public static buildEdgeArray(array: EdgeAsObject[], datasetId?: number) {
		for (let i = 0; i < array.length; ++i) {
			const element = array[i];
			const source = new GraphNode(
				element.target.id,
				element.target.position.native.x,
				element.target.position.native.y
			);
			const target = new GraphNode(
				element.source.id,
				element.source.position.native.x,
				element.source.position.native.y
			);

			const edge = new GraphEdge(element.id, source, target, datasetId);
			edge.source.setPosition(element.source.position.displayed.x, element.source.position.displayed.y);
			edge.target.setPosition(element.target.position.displayed.x, element.target.position.displayed.y);

			array[i] = edge;
		}
		return array as GraphEdge[];
	}
}
