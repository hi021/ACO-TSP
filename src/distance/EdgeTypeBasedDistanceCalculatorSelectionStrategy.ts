import { AttPseudoEuclideanDistanceCalculator } from './AttPseudoEuclideanDistanceCalculator.js';
import { EuclideanDistanceCalculator } from './EuclideanDistanceCalculator.js';
import { GeographicalDistanceCalculator } from './GeographicalDistanceCalculator.js';

export class EdgeTypeBasedDistanceCalculatorSelectionStrategy {
	public static getDistanceCalculator(edgeType: string) {
		switch (edgeType) {
			case 'GEO':
				return GeographicalDistanceCalculator;
			case 'ATT':
				return AttPseudoEuclideanDistanceCalculator;
			default:
				return EuclideanDistanceCalculator;
		}
	}
}
