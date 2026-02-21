import { TspAlgorithm } from './TspAlgorithmEnum';

export const TspAlgorithmDatasetId: Readonly<{ [algorithm in TspAlgorithm]: number }> = Object.freeze({
	ACO: 0,
	BRUTE_FORCE: 1,
	NEAREST_NEIGHBOR: 2,
	SIMULATED_ANNEALING: 3
});
