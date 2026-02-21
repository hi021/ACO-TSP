import { GraphCanvas } from '../GraphCanvas.js';
import { EdgeAsObject, GraphEdge } from '../GraphEdge.js';
import { InputController } from '../InputController.js';
import { Utils } from '../util/Utils.js';
import { AbstractTsp, BasicTspParameters } from './impl/AbstractTsp.js';
import { TspAlgorithmDatasetId } from './TspAlgorithmDatasetEnum.js';
import { TspAlgorithm, TspAlgorithmEnum } from './TspAlgorithmEnum.js';

export interface TspWorkerContainer {
	worker: Worker;
	running: boolean;
	callback?: (result: TspWorkerProcessedResult) => void;
}

export interface TspWorkerResult {
	tspAlgorithm: TspAlgorithm;
	executionStartTime: number;
	result: EdgeAsObject[];
	tsp: AbstractTsp; // not an instance, just plain object!
}

export interface TspWorkerProcessedResult {
	edges: GraphEdge[];
	tsp: AbstractTsp; // not an instance, just plain object!
}

export type WorkerBasicTspParameters = Omit<BasicTspParameters, 'distanceCalculator'> & {
	distanceCalculator: string; // constructor name
};

export class TspController {
	public tspWorkers = new Map<TspAlgorithm, TspWorkerContainer>();
	protected inputController: InputController;
	protected canvas: GraphCanvas;

	private workerCallback = (msg: MessageEvent<TspWorkerResult>) => {
		const executionTime = performance.now() - msg.data.executionStartTime;
		const tspAlgorithm = msg.data.tspAlgorithm;
		const worker = this.tspWorkers.get(tspAlgorithm);
		const tsp = msg.data.tsp;
		const datasetId = TspAlgorithmDatasetId[tspAlgorithm];

		const edges = GraphEdge.buildEdgeArray(msg.data.result, datasetId);
		const result: TspWorkerProcessedResult = { edges, tsp };

		this.canvas.datasets[datasetId] = edges;
		this.canvas.redraw();

		this.inputController.updateDistanceLabel(tspAlgorithm, tsp.bestRoute.distance);
		this.inputController.updateExecutionTimeLabel(tspAlgorithm, executionTime);

		worker.callback?.(result);
		worker.running = false;

		if (!this.anyRunning()) this.inputController.runButton.disabled = false;
	};

	constructor(inputController: InputController, canvas: GraphCanvas) {
		this.inputController = inputController;
		this.canvas = canvas;

		for (const tspAlgorithm of Object.keys(TspAlgorithmEnum)) {
			const worker = new Worker(Utils.TSP_WORKER_PATH, { type: 'module', name: tspAlgorithm.toString() });
			worker.onmessage = this.workerCallback;

			this.tspWorkers.set(tspAlgorithm as TspAlgorithm, { worker, running: false });
		}
	}

	public anyRunning() {
		for (const tspAlgorithm of Object.keys(TspAlgorithmEnum)) {
			if (this.tspWorkers.get(tspAlgorithm as TspAlgorithm).running) return true;
		}

		return false;
	}

	public runAll<T extends WorkerBasicTspParameters>(params: T) {
		this.canvas.eraseAllDatasets();

		for (const tspAlgorithm of Object.keys(TspAlgorithmEnum)) {
			const worker = this.tspWorkers.get(tspAlgorithm as TspAlgorithm);
			if (!this.inputController.isAlgorithmEnabled(tspAlgorithm as TspAlgorithm)) continue;

			this.inputController.runButton.disabled = true;
			worker.running = true;
			worker.worker.postMessage({
				...params,
				tsp: TspAlgorithmEnum[tspAlgorithm].name,
				tspAlgorithm,
				executionStartTime: performance.now()
			});
		}
	}
}
