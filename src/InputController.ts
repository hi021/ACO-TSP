import { TspAlgorithm } from './tsp/TspAlgorithmEnum.js';
import { Utils } from './util/Utils.js';

export class InputController {
	public acoParameters = {
		antCount: 30,
		iterationCount: 60,
		distancePriority: 2,
		pheromoneImportance: 1,
		evaporationRate: 0.2,
		depositRate: 500
	};

	#acoRangeInputs = {
		antCount: document.getElementById('aco-ant-count-range') as HTMLInputElement,
		iteration: document.getElementById('aco-iteration-range') as HTMLInputElement,
		pheromone: document.getElementById('aco-pheromone-range') as HTMLInputElement,
		distance: document.getElementById('aco-distance-range') as HTMLInputElement,
		evaporationRate: document.getElementById('aco-evaporation-range') as HTMLInputElement,
		depositRate: document.getElementById('aco-deposit-range') as HTMLInputElement
	};
	#acoNumericInputs = {
		antCount: document.getElementById('aco-ant-count-input') as HTMLInputElement,
		iteration: document.getElementById('aco-iteration-input') as HTMLInputElement,
		pheromone: document.getElementById('aco-pheromone-input') as HTMLInputElement,
		distance: document.getElementById('aco-distance-input') as HTMLInputElement,
		evaporationRate: document.getElementById('aco-evaporation-input') as HTMLInputElement,
		depositRate: document.getElementById('aco-deposit-input') as HTMLInputElement
	};

	public readonly distanceLabels = {
		BRUTE_FORCE: document.getElementById('distance-label-bf').getElementsByTagName('span')[0] as HTMLSpanElement,
		ACO: document.getElementById('distance-label-aco').getElementsByTagName('span')[0] as HTMLSpanElement
	};
	public readonly executionTimeLabels = {
		BRUTE_FORCE: document.getElementById('execution-time-label-bf') as HTMLParagraphElement,
		ACO: document.getElementById('execution-time-label-aco') as HTMLParagraphElement
	};
	public readonly optimalDistanceLabels = document.getElementsByClassName('optimal-distance-label');

	public readonly labelsCheckbox = document.getElementById('labels-checkbox') as HTMLInputElement;
	public readonly datasetSelect = document.getElementById('dataset-select') as HTMLSelectElement;
	public readonly runButton = document.getElementById('run-button') as HTMLButtonElement;

	constructor() {
		this.#acoRangeInputs.antCount.oninput = this.#acoNumericInputs.antCount.oninput = this.updateAntCount.bind(this);
		this.#acoRangeInputs.iteration.oninput = this.#acoNumericInputs.iteration.oninput =
			this.updateIterationCount.bind(this);
		this.#acoRangeInputs.pheromone.oninput = this.#acoNumericInputs.pheromone.oninput =
			this.updatePheromoneImportance.bind(this);
		this.#acoRangeInputs.distance.oninput = this.#acoNumericInputs.distance.oninput =
			this.updateDistancePriority.bind(this);
		this.#acoRangeInputs.evaporationRate.oninput = this.#acoNumericInputs.evaporationRate.oninput =
			this.updateEvaporationRate.bind(this);
		this.#acoRangeInputs.depositRate.oninput = this.#acoNumericInputs.depositRate.oninput =
			this.updateDepositRate.bind(this);

		this.setAntCount();
		this.setIterationCount();
		this.setPheromoneImportance();
		this.setDistancePriority();
		this.setEvaporationRate();
		this.setDepositRate();
	}

	public updateAntCount(e: InputEvent) {
		const value = (e.target as HTMLInputElement).value;
		this.#acoRangeInputs.antCount.value = this.#acoNumericInputs.antCount.value = value;
		this.acoParameters.antCount = Number(value);
	}
	public setAntCount() {
		this.#acoRangeInputs.antCount.value = this.#acoNumericInputs.antCount.value =
			this.acoParameters.antCount.toString();
	}

	public updateIterationCount(e: InputEvent) {
		const value = (e.target as HTMLInputElement).value;
		this.#acoRangeInputs.iteration.value = this.#acoNumericInputs.iteration.value = value;
		this.acoParameters.iterationCount = Number(value);
	}
	public setIterationCount() {
		this.#acoRangeInputs.iteration.value = this.#acoNumericInputs.iteration.value =
			this.acoParameters.iterationCount.toString();
	}

	public updatePheromoneImportance(e: InputEvent) {
		const value = (e.target as HTMLInputElement).value;
		this.#acoRangeInputs.pheromone.value = this.#acoNumericInputs.pheromone.value = value;
		this.acoParameters.pheromoneImportance = Number(value);
	}
	public setPheromoneImportance() {
		this.#acoRangeInputs.pheromone.value = this.#acoNumericInputs.pheromone.value =
			this.acoParameters.pheromoneImportance.toString();
	}

	public updateDistancePriority(e: InputEvent) {
		const value = (e.target as HTMLInputElement).value;
		this.#acoRangeInputs.distance.value = this.#acoNumericInputs.distance.value = value;
		this.acoParameters.distancePriority = Number(value);
	}
	public setDistancePriority() {
		this.#acoRangeInputs.distance.value = this.#acoNumericInputs.distance.value =
			this.acoParameters.distancePriority.toString();
	}

	public updateEvaporationRate(e: InputEvent) {
		const value = (e.target as HTMLInputElement).value;
		this.#acoRangeInputs.evaporationRate.value = this.#acoNumericInputs.evaporationRate.value = value;
		this.acoParameters.evaporationRate = Number(value);
	}
	public setEvaporationRate() {
		this.#acoRangeInputs.evaporationRate.value = this.#acoNumericInputs.evaporationRate.value =
			this.acoParameters.evaporationRate.toString();
	}

	public updateDepositRate(e: InputEvent) {
		const value = (e.target as HTMLInputElement).value;
		this.#acoRangeInputs.depositRate.value = this.#acoNumericInputs.depositRate.value = value;
		this.acoParameters.depositRate = Number(value);
	}
	public setDepositRate() {
		this.#acoRangeInputs.depositRate.value = this.#acoNumericInputs.depositRate.value =
			this.acoParameters.depositRate.toString();
	}

	public updateDistanceLabel(tsp: TspAlgorithm, distance?: number) {
		this.distanceLabels[tsp].innerHTML = distance ? Utils.formatNumber(Math.round(distance)) : '-';
	}
	public updateDistanceLabels(distance?: number) {
		const content = distance ? Utils.formatNumber(Math.round(distance)) : '-';
		for (const label of Object.values(this.distanceLabels)) label.innerHTML = content;
	}
	public updateOptimalDistanceLabels(distance?: number) {
		const content = distance ? '/' + Utils.formatNumber(Math.round(distance)) : '&nbsp;';
		for (let i = 0; i < this.optimalDistanceLabels.length; ++i) this.optimalDistanceLabels.item(i).innerHTML = content;
	}

	public updateExecutionTimeLabel(tsp: TspAlgorithm, ms?: number) {
		this.executionTimeLabels[tsp].innerHTML = ms ? `${Math.round(ms) / 1000} s` : '&nbsp;';
	}
	public updateExecutionTimeLabels(ms?: number) {
		const content = ms ? `${Math.round(ms) / 1000} s` : '&nbsp;';
		for (const label of Object.values(this.executionTimeLabels)) label.innerHTML = content;
	}
}
