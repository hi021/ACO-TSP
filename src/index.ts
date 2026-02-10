import { Aco } from './aco/Aco.js';
import { Canvas } from './Canvas.js';
import { ChartController } from './ChartController.js';
import { NodeParser } from './conversion/NodeParser.js';
import { AbstractDistanceCalculator } from './distance/AbstractDistanceCalculator.js';
import { AttPseudoEuclideanDistanceCalculator } from './distance/AttPseudoEuclideanDistanceCalculator.js';
import { EuclideanDistanceCalculator } from './distance/EuclideanDistanceCalculator.js';
import { GraphEdge } from './GraphEdge.js';
import { GraphNode } from './GraphNode.js';
import { InputController } from './InputController.js';
import { Utils } from './util/Utils.js';

//////////////////////////////////////////////////////////////////////////////

const dataSourcePaths = ['../data/att48.tsp', '../data/berlin52.tsp', '../data/dantzig42.tsp', '../data/att532.tsp'];

const inputController = new InputController();
const canvas = new Canvas(document.getElementById('graph-canvas') as HTMLCanvasElement);
const distanceHistoryChartController = new ChartController(
	document.getElementById('distance-chart-canvas') as HTMLCanvasElement
);
const tspWorker = new Worker(Utils.TSP_WORKER_PATH, { type: 'module' });
const parser = new NodeParser(dataSourcePaths, canvas.element.width, canvas.padding);
const datasets = await parser.parse();

inputController.labelsCheckbox.onchange = onLabelCheckboxChange;
inputController.runButton.onclick = runAco;

inputController.datasetSelect.onchange = onDatasetChange;
for (const i in datasets)
	inputController.datasetSelect.options.add(
		new Option(`[${datasets[i].NAME}] ${datasets[i].COMMENT} (${datasets[i].DIMENSION} points)`, datasets[i].NAME)
	);

let distanceCalculator: AbstractDistanceCalculator;
let selectedDataset = Object.values(datasets)[0].NAME;
let nodes: GraphNode[];

selectAndDrawDataset();

//////////////////////////////////////////////////////////////////////////////

function selectAndDrawDataset() {
	nodes = datasets[selectedDataset].DATA;
	distanceCalculator =
		datasets[selectedDataset].EDGE_WEIGHT_TYPE == 'ATT' ?
			new AttPseudoEuclideanDistanceCalculator()
		:	new EuclideanDistanceCalculator();

	inputController.updateOptimalDistanceLabel(datasets[selectedDataset].OPTIMAL_DISTANCE);
	inputController.updateDistanceLabel();
	inputController.updateExecutionTimeLabel();
	canvas.unhighlightOriginNode(false);
	canvas.redrawNodes(nodes);
}

function onDatasetChange(_: InputEvent) {
	distanceHistoryChartController.clear();
	selectedDataset = this.value;
	selectAndDrawDataset();
}

function onLabelCheckboxChange(_: InputEvent) {
	canvas.displayLabels = this.checked;
}

function runAco() {
	inputController.runButton.disabled = true;
	const perfStart = performance.now();
	const parameters = inputController.parameters;
	const acoParameters = {
		antCount: parameters.antCount,
		distancePriority: parameters.distancePriority,
		depositRate: parameters.depositRate,
		pheromoneImportance: parameters.pheromoneImportance,
		evaporationRate: 1 - parameters.evaporationRate,
		maxIterations: parameters.iterationCount,
		nodes: GraphNode.toMap(nodes),
		distanceCalculator: distanceCalculator.constructor.name
	};

	tspWorker.onmessage = (msg: MessageEvent<{ tsp: Aco; result: GraphEdge[] }>) => {
		const perfTspEnd = performance.now();
		const tsp = msg.data.tsp; // not an instance, just plain object!
		canvas.edges = GraphEdge.buildEdgeArray(msg.data.result);

		canvas.findAndHighlightOriginNode(tsp.bestRoute.route);

		inputController.updateDistanceLabel(tsp.bestRoute.distance);
		inputController.updateExecutionTimeLabel(perfTspEnd - perfStart);
		distanceHistoryChartController.values = tsp.distanceHistory;
		distanceHistoryChartController.redraw();

		inputController.runButton.disabled = false;
	};

	tspWorker.postMessage(acoParameters);
}
