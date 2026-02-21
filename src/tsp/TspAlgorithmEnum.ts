import { Aco } from './impl/aco/Aco.js';
import { BruteForceTsp } from './impl/BruteForceTsp.js';

export type TspAlgorithm = 'BRUTE_FORCE' | 'ACO' | 'NEAREST_NEIGHBOR' | 'SIMULATED_ANNEALING';
export const TspAlgorithmEnum: Readonly<{ [algorithm in TspAlgorithm] }> = Object.freeze({
	ACO: Aco,
	BRUTE_FORCE: BruteForceTsp,
	//TODO
	NEAREST_NEIGHBOR: Aco,
	SIMULATED_ANNEALING: Aco
});
