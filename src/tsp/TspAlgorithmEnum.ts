import { Aco } from './impl/aco/Aco.js';
import { BruteForceTsp } from './impl/BruteForceTsp.js';
import { NearestNeighborTsp } from './impl/NearestNeighborTsp.js';
import { SimulatedAnnealingTsp } from './impl/SimulatedAnnealingTsp.js';

export type TspAlgorithm = 'BRUTE_FORCE' | 'ACO' | 'NEAREST_NEIGHBOR' | 'SIMULATED_ANNEALING';
export const TspAlgorithmEnum: Readonly<{ [algorithm in TspAlgorithm] }> = Object.freeze({
	ACO: Aco,
	BRUTE_FORCE: BruteForceTsp,
	NEAREST_NEIGHBOR: NearestNeighborTsp,
	SIMULATED_ANNEALING: SimulatedAnnealingTsp
});
