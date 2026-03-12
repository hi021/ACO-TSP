//@ts-expect-error - necessary for import resolving inside target file
import { GraphNode } from '/target/GraphNode.js';
//@ts-expect-error - necessary for import resolving inside target file
import { EuclideanDistanceCalculator } from '/target/distance/EuclideanDistanceCalculator.js';
//@ts-expect-error - necessary for import resolving inside target file
import { GeographicalDistanceCalculator } from '/target/distance/GeographicalDistanceCalculator.js';
//@ts-expect-error - necessary for import resolving inside target file
import { AttPseudoEuclideanDistanceCalculator } from '/target/distance/AttPseudoEuclideanDistanceCalculator.js';
//@ts-expect-error - necessary for import resolving inside target file
import { AbstractTsp } from '/target/tsp/impl/AbstractTsp.js';
//@ts-expect-error - necessary for import resolving inside target file
import { BruteForceTsp } from '/target/tsp/impl/BruteForceTsp.js';
//@ts-expect-error - necessary for import resolving inside target file
import { NearestNeighborTsp } from '/target/tsp/impl/NearestNeighborTsp.js';
//@ts-expect-error - necessary for import resolving inside target file
import { Aco } from '/target/tsp/impl/aco/Aco.js';
//@ts-expect-error - necessary for import resolving inside target file
import { SimulatedAnnealingTsp } from '/target/tsp/impl/SimulatedAnnealingTsp.js';

import '/go-src/wasm_exec.js';

const classMap = {
	GraphNode,
	EuclideanDistanceCalculator,
	GeographicalDistanceCalculator,
	AttPseudoEuclideanDistanceCalculator,
	AbstractTsp,
	BruteForceTsp,
	NearestNeighborTsp,
	Aco,
	SimulatedAnnealingTsp
};

self.onmessage = async (msg: MessageEvent<Record<string, any>>) => {
	const executionStartTime = msg.data.executionStartTime;
	const tspAlgorithm = msg.data.tspAlgorithm; // Warning: turns Enum into ordinal number
	const params = parseParams(msg.data);
	const tsp = instantiateTsp(params);
	const result = await tsp.run();

	self.postMessage({ tsp, result, executionStartTime, tspAlgorithm });
};

function instantiateTsp(params: Record<string, any>) {
	return new classMap[params.tsp](params);
}

// Convert plain objects back into class instances
function parseParams(params: Record<string, any>) {
	if (params.distanceCalculator) params.distanceCalculator = new classMap[params.distanceCalculator]();
	for (const [k, v] of params.nodes as Map<string, GraphNode>) {
		const node = new GraphNode(v.id, v.position.native.x, v.position.native.y);
		node.setPosition(v.position.displayed.x, v.position.displayed.y);
		params.nodes.set(k, node);
	}
	return params;
}
