import { AbstractAco } from "./aco/AbstractAco.js";
import { Aco } from "./aco/Aco.js";
import { Canvas } from "./Canvas.js";
import { ChartController } from "./ChartController.js";
import { NodeParser } from "./conversion/NodeParser.js";
import { AbstractDistanceCalculator } from "./distance/AbstractDistanceCalculator.js";
import { AttPseudoEuclideanDistanceCalculator } from "./distance/AttPseudoEuclideanDistanceCalculator.js";
import { EuclideanDistanceCalculator } from "./distance/EuclideanDistanceCalculator.js";
import { GraphNode } from "./GraphNode.js";
import { InputController } from "./InputController.js";

//////////////////////////////////////////////////////////////////////////////

const dataSourcePaths = ["../data/att48.tsp", "../data/berlin52.tsp", "../data/dantzig42.tsp", "../data/att532.tsp"];

const inputController = new InputController();
const canvas = new Canvas(document.getElementById("graph-canvas") as HTMLCanvasElement);
const distanceHistoryChartController = new ChartController(document.getElementById("distance-chart-canvas") as HTMLCanvasElement);
const parser = new NodeParser(dataSourcePaths, canvas.element.width, canvas.padding);
const datasets = await parser.parse();

inputController.labelsCheckbox.onchange = onLabelCheckboxChange
inputController.runButton.onclick = runAco;

inputController.datasetSelect.onchange = onDatasetChange;
for(const i in datasets)
    inputController.datasetSelect.options.add(new Option(`[${datasets[i].NAME}] ${datasets[i].COMMENT} (${datasets[i].DIMENSION} points)`, datasets[i].NAME));

let distanceCalculator: AbstractDistanceCalculator;
let selectedDataset = Object.values(datasets)[0].NAME;
let nodes: GraphNode[];

selectAndDrawDataset();

//////////////////////////////////////////////////////////////////////////////

function selectAndDrawDataset() {
    nodes = datasets[selectedDataset].DATA;
    distanceCalculator = datasets[selectedDataset].EDGE_WEIGHT_TYPE == "ATT"
        ? new AttPseudoEuclideanDistanceCalculator()
        : new EuclideanDistanceCalculator();

    inputController.updateDistanceLabel();
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
    const parameters = inputController.parameters;
    const aco: AbstractAco = new Aco({
        antCount: parameters.antCount,
        distancePriority: parameters.distancePriority,
        depositRate: parameters.depositRate,
        pheromoneImportance: parameters.pheromoneImportance,
        evaporationRate: 1 - parameters.evaporationRate,
        maxIterations: parameters.iterationCount,
        nodes: GraphNode.toMap(nodes),
        distanceCalculator
    })

    canvas.edges = aco.run();
    canvas.findAndHighlightOriginNode(aco.bestRoute.route);

    inputController.updateDistanceLabel(aco.bestRoute.distance);
    distanceHistoryChartController.values = aco.distanceHistory;
    distanceHistoryChartController.redraw();

    console.debug(aco);
}
