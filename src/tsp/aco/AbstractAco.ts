import { AbstractTsp } from '../AbstractTsp';
import { Ant } from './Ant.js';

export interface BasicAcoParameters {
	pheromoneImportance: number;
	distancePriority: number;
	evaporationRate: number;
}

export abstract class AbstractAco extends AbstractTsp {
	parameters: BasicAcoParameters & {
		maxIterations: number;
		depositRate: number;
	};
	distanceHistory: number[];
	currentIteration: number;
	pheromoneMatrix: number[][];
	ants: Ant[];
}
