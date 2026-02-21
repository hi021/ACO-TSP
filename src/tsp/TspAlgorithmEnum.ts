import { Aco } from './impl/aco/Aco.js';
import { BruteForceTsp } from './impl/BruteForceTsp.js';

export type TspAlgorithm = 'BRUTE_FORCE' | 'ACO';
export const TspAlgorithmEnum: { [algorithm in TspAlgorithm] } = {
	BRUTE_FORCE: BruteForceTsp,
	ACO: Aco
	// NEAREST_NEIGHBOR:,
	// SIMULATED_ANNEALING:
};
