import { ChartController } from './ChartController.js';
import { NodeParser } from './conversion/NodeParser.js';
import { AbstractDistanceCalculator } from './distance/AbstractDistanceCalculator.js';
import { EdgeTypeBasedDistanceCalculatorSelectionStrategy } from './distance/EdgeTypeBasedDistanceCalculatorSelectionStrategy.js';
import { GraphCanvas } from './GraphCanvas.js';
import { GraphNode } from './GraphNode.js';
import { InputController } from './InputController.js';
import { Aco } from './tsp/impl/aco/Aco.js';
import { TspController, TspWorkerProcessedResult } from './tsp/TspController.js';

//////////////////////////////////////////////////////////////////////////////

const dataSourcePaths = [
	'../data/att48.tsp',
	'../data/att532.tsp',
	'../data/berlin52.tsp',
	'../data/dantzig42.tsp',
	'../data/burma14.tsp'
];

const inputController = new InputController();
const canvas = new GraphCanvas(document.getElementById('graph-canvas') as HTMLCanvasElement);
const distanceHistoryChartController = new ChartController(
	document.getElementById('distance-chart-canvas') as HTMLCanvasElement
);

const parser = new NodeParser(dataSourcePaths, canvas.element.width, canvas.padding);
const datasets = await parser.parse();
const tspController = new TspController(inputController, canvas);

inputController.labelsCheckbox.onchange = onLabelCheckboxChange;
inputController.runButton.onclick = runTsps;

inputController.datasetSelect.onchange = onDatasetChange;
for (const i in datasets)
	inputController.datasetSelect.options.add(
		new Option(`[${datasets[i].NAME}] ${datasets[i].COMMENT} (${datasets[i].DIMENSION} points)`, datasets[i].NAME)
	);

let distanceCalculator: AbstractDistanceCalculator;
let selectedDataset = Object.values(datasets)[0].NAME;
let nodes: GraphNode[];

selectAndDrawDataset();
instantiateTspWorkerCallbacks();

//////////////////////////////////////////////////////////////////////////////

function selectAndDrawDataset() {
	nodes = datasets[selectedDataset].DATA;
	distanceCalculator = new (EdgeTypeBasedDistanceCalculatorSelectionStrategy.getDistanceCalculator(
		datasets[selectedDataset].EDGE_WEIGHT_TYPE
	))();

	inputController.updateOptimalDistanceLabels(datasets[selectedDataset].OPTIMAL_DISTANCE);
	inputController.updateDistanceLabels();
	inputController.updateExecutionTimeLabels();
	canvas.unhighlightOriginNode(false);
	canvas.redrawNodes(nodes);
}

function instantiateTspWorkerCallbacks() {
	tspController.tspWorkers.get('ACO').callback = (result: TspWorkerProcessedResult) => {
		distanceHistoryChartController.values = (result.tsp as Aco).distanceHistory;
		distanceHistoryChartController.redraw();
	};
}

function onDatasetChange(_: InputEvent) {
	distanceHistoryChartController.clear();
	selectedDataset = this.value;
	selectAndDrawDataset();
}

function onLabelCheckboxChange(_: InputEvent) {
	canvas.displayLabels = this.checked;
}

function runTsps() {
	const acoParams = inputController.acoParameters;
	const saParams = inputController.saParameters;
	const tspParams = {
		antCount: acoParams.antCount,
		distancePriority: acoParams.distancePriority,
		depositRate: acoParams.depositRate,
		pheromoneImportance: acoParams.pheromoneImportance,
		evaporationRate: 1 - acoParams.evaporationRate,
		maxIterations: acoParams.iterationCount,

		initialTemp: saParams.initialTemp,
		minTemp: saParams.minTemp,
		coolRate: saParams.coolRate,
		iterationsPerStep: saParams.iterations,

		nodes: GraphNode.toMap(nodes),
		distanceCalculator: distanceCalculator.constructor.name
	};

	tspController.runAll(tspParams);
}
