import { GraphEdge } from './GraphEdge.js';
import { GraphNode } from './GraphNode.js';
import { TspAlgorithmEnum } from './tsp/TspAlgorithmEnum.js';
import { Point } from './util/Point.js';

export class GraphCanvas {
	#element: HTMLCanvasElement;
	#graph: CanvasRenderingContext2D;
	#nodes: Map<string, GraphNode> = new Map();
	datasets = new Array<GraphEdge[]>(Object.keys(TspAlgorithmEnum).length);

	#showLabels = true;
	#size = 750;
	padding = 10;
	nodeRadius = 5;
	edgeThickness = 3;
	#colors = {
		node: ['oklch(45.2% 0.211 324.591)'],
		highlightedNode: ['oklch(45.2% 0.211 324.591)'],
		label: '#e5e5e5',
		edge: [
			'oklch(52.5% 0.223 3.958 /0.6)',
			'oklch(58.8% 0.158 241.966 /0.6)',
			'oklch(54.1% 0.281 293.009 /0.6)',
			'oklch(59.6% 0.145 163.225 /0.6)'
		],
		shadow: 'rgba(0,0,0,0.3)'
	};

	constructor(element: HTMLCanvasElement) {
		this.#element = element;
		this.#graph = this.#element.getContext('2d');
	}

	set nodes(nodes: GraphNode[]) {
		this.#nodes = GraphNode.toMap(nodes);
		const centerPaddingY = -(this.#size - GraphNode.getMaxY(nodes)) / 2;
		this.#graph.resetTransform();
		this.#graph.translate(0, centerPaddingY);
	}

	set displayLabels(displayLabels: boolean) {
		if (displayLabels == this.#showLabels) return;
		this.#showLabels = displayLabels;
		this.redraw();
	}

	get datasetCount() {
		return this.datasets.length;
	}

	get element() {
		return this.#element;
	}

	public getNodeColor(datasetId = 0) {
		return this.#colors.node[datasetId % this.#colors.node.length];
	}
	public getHighlightedNodeColor(datasetId = 0) {
		return this.#colors.highlightedNode[datasetId % this.#colors.highlightedNode.length];
	}
	public getEdgeColor(datasetId = 0) {
		return this.#colors.edge[datasetId % this.#colors.edge.length];
	}

	public getTransformedNodePosition(node: GraphNode) {
		return new Point(node.x + this.padding, this.#size - node.y - this.padding);
	}

	public erase() {
		this.#graph.clearRect(0, 0, this.#size, this.#size);
	}
	public eraseAllDatasets() {
		this.clearAllDatasets();
		this.erase();
		this.drawNodes();
	}
	public clearDataset(datasetId: number) {
		this.datasets[datasetId] = [];
	}
	public clearAllDatasets() {
		for (let i = 0; i < this.datasetCount; ++i) this.datasets[i] = [];
	}
	public clear() {
		this.clearAllDatasets();
		this.#nodes = new Map();
		this.erase();
	}

	public drawDataset(datasetId: number) {
		const dataset = this.datasets[datasetId];
		for (let i = 0; i < dataset.length; ++i) this.drawEdge(dataset[i]);
	}
	public drawAllDatasets() {
		for (let i = 0; i < this.datasetCount; ++i) this.drawDataset(i);
	}
	public drawNodes(datasetId = 0) {
		for (const node of this.#nodes.values()) this.drawNode(node, this.#showLabels, true, datasetId);
	}

	public redraw() {
		this.erase();
		this.draw();
	}
	public redrawNodes(nodes: GraphNode[]) {
		this.clear();
		this.nodes = nodes;
		this.drawNodes();
	}
	public draw() {
		this.drawAllDatasets();
		this.drawNodes();
	}

	public findAndHighlightOriginNode(route: GraphEdge[], unhighlightPrevious = true) {
		if (unhighlightPrevious) this.unhighlightOriginNode(false);

		const originNodeId = route[0].source.id;
		const originNode = this.#nodes.get(originNodeId);
		originNode.color = this.getHighlightedNodeColor(route[0].datasetId);
		this.#nodes.set(originNodeId, originNode);

		this.redraw();
	}

	public unhighlightOriginNode(redraw = true) {
		for (const [_, v] of this.#nodes) {
			if (v.color) {
				delete v.color;
				return;
			}
		}

		if (redraw) this.redraw();
	}

	private drawEdge(edge: GraphEdge, withShadow = true) {
		const sourcePosition = this.getTransformedNodePosition(edge.source);
		const targetPosition = this.getTransformedNodePosition(edge.target);

		if (withShadow) {
			this.#graph.shadowColor = this.#colors.shadow;
			this.#graph.shadowOffsetX = 1;
			this.#graph.shadowOffsetY = 1;
			this.#graph.shadowBlur = 4;
		} else {
			this.#graph.shadowColor = 'rgba(0,0,0,0)';
		}

		this.#graph.strokeStyle = edge.color ?? this.getEdgeColor(edge.datasetId);
		this.#graph.lineWidth = this.edgeThickness;
		this.#graph.beginPath();
		this.#graph.moveTo(sourcePosition.x, sourcePosition.y);
		this.#graph.lineTo(targetPosition.x, targetPosition.y);
		this.#graph.stroke();
	}

	private drawNode(node: GraphNode, withLabel: boolean, withShadow = true, datasetId = 0) {
		if (!this.#graph) throw new Error('Attempted to render uninitialized graph.');

		const position = this.getTransformedNodePosition(node);
		this.#graph.fillStyle = node.color ?? this.getNodeColor(datasetId);
		this.#graph.beginPath();
		this.#graph.arc(position.x, position.y, this.nodeRadius, 0, 2 * Math.PI, false);

		if (withShadow) {
			this.#graph.shadowColor = this.#colors.shadow;
			this.#graph.shadowOffsetX = 1;
			this.#graph.shadowOffsetY = 1;
			this.#graph.shadowBlur = 4;
		} else {
			this.#graph.shadowColor = 'rgba(0,0,0,0)';
		}

		this.#graph.fill();

		if (withLabel) {
			this.#graph.fillStyle = this.#colors.label;
			this.#graph.fillText(node.id, position.x - 1, position.y - 5);
		}
	}
}
