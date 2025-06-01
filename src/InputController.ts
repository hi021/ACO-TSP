import { Utils } from "./util/Utils.js";

export class InputController {
    public parameters = {
        antCount: 30,
        iterationCount: 60,
        distancePriority: 2,
        pheromoneImportance: 1,
        evaporationRate: 0.2,
        depositRate: 500
    }

    #rangeInputs = {
        antCount: document.getElementById("ant-count-range") as HTMLInputElement,
        iteration: document.getElementById("iteration-range") as HTMLInputElement,
        pheromone: document.getElementById("pheromone-range") as HTMLInputElement,
        distance: document.getElementById("distance-range") as HTMLInputElement,
        evaporationRate: document.getElementById("evaporation-range") as HTMLInputElement,
        depositRate: document.getElementById("deposit-range") as HTMLInputElement
    }
    #numericInputs = {
        antCount: document.getElementById("ant-count-input") as HTMLInputElement,
        iteration: document.getElementById("iteration-input") as HTMLInputElement,
        pheromone: document.getElementById("pheromone-input") as HTMLInputElement,
        distance: document.getElementById("distance-input") as HTMLInputElement,
        evaporationRate: document.getElementById("evaporation-input") as HTMLInputElement,
        depositRate: document.getElementById("deposit-input") as HTMLInputElement
    }

    public distanceLabel = document.getElementById("distance-label") as HTMLParagraphElement;
    public labelsCheckbox = document.getElementById("labels-checkbox") as HTMLInputElement;
    public datasetSelect = document.getElementById("dataset-select") as HTMLSelectElement;
    public runButton = document.getElementById("run-button") as HTMLButtonElement;

    constructor() {
        this.#rangeInputs.antCount.oninput = this.#numericInputs.antCount.oninput = this.updateAntCount.bind(this);
        this.#rangeInputs.iteration.oninput = this.#numericInputs.iteration.oninput = this.updateIterationCount.bind(this);
        this.#rangeInputs.pheromone.oninput = this.#numericInputs.pheromone.oninput = this.updatePheromoneImportance.bind(this);
        this.#rangeInputs.distance.oninput = this.#numericInputs.distance.oninput = this.updateDistancePriority.bind(this);
        this.#rangeInputs.evaporationRate.oninput = this.#numericInputs.evaporationRate.oninput = this.updateEvaporationRate.bind(this);
        this.#rangeInputs.depositRate.oninput = this.#numericInputs.depositRate.oninput = this.updateDepositRate.bind(this);

        this.setAntCount();
        this.setIterationCount();
        this.setPheromoneImportance();
        this.setDistancePriority();
        this.setEvaporationRate();
        this.setDepositRate();
    }

    public updateAntCount(e: InputEvent) {
        const value = (e.target as HTMLInputElement).value;
        this.#rangeInputs.antCount.value = this.#numericInputs.antCount.value = value;
        this.parameters.antCount = Number(value);
    }
    public setAntCount() {
       this.#rangeInputs.antCount.value = this.#numericInputs.antCount.value = this.parameters.antCount.toString();
    }

    public updateIterationCount(e: InputEvent) {
        const value = (e.target as HTMLInputElement).value;
        this.#rangeInputs.iteration.value = this.#numericInputs.iteration.value = value;
        this.parameters.iterationCount = Number(value);
    }
    public setIterationCount() {
        this.#rangeInputs.iteration.value = this.#numericInputs.iteration.value = this.parameters.iterationCount.toString();
    }

    public updatePheromoneImportance(e: InputEvent) {
        const value = (e.target as HTMLInputElement).value;
        this.#rangeInputs.pheromone.value = this.#numericInputs.pheromone.value = value;
        this.parameters.pheromoneImportance = Number(value);
    }
    public setPheromoneImportance() {
       this.#rangeInputs.pheromone.value = this.#numericInputs.pheromone.value = this.parameters.pheromoneImportance.toString();
    }

    public updateDistancePriority(e: InputEvent) {
        const value = (e.target as HTMLInputElement).value;
        this.#rangeInputs.distance.value = this.#numericInputs.distance.value = value;
        this.parameters.distancePriority = Number(value);
    }
    public setDistancePriority() {
        this.#rangeInputs.distance.value = this.#numericInputs.distance.value = this.parameters.distancePriority.toString();
    }

    public updateEvaporationRate(e: InputEvent) {
        const value = (e.target as HTMLInputElement).value;
        this.#rangeInputs.evaporationRate.value = this.#numericInputs.evaporationRate.value = value;
        this.parameters.evaporationRate = Number(value);
    }
    public setEvaporationRate() {
        this.#rangeInputs.evaporationRate.value = this.#numericInputs.evaporationRate.value = this.parameters.evaporationRate.toString();
    }

    public updateDepositRate(e: InputEvent) {
        const value = (e.target as HTMLInputElement).value;
        this.#rangeInputs.depositRate.value = this.#numericInputs.depositRate.value = value;
        this.parameters.depositRate = Number(value);
    }
    public setDepositRate() {
        this.#rangeInputs.depositRate.value = this.#numericInputs.depositRate.value = this.parameters.depositRate.toString();
    }

    public updateDistanceLabel(distance?: number) {
        this.distanceLabel.innerHTML = distance ? Utils.formatNumber(Math.round(distance)) : "&nbsp;";
    }
}
