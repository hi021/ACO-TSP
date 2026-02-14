//@ts-expect-error - necessary for import resolving inside target file
import { GraphNode } from '/target/GraphNode.js';
//@ts-expect-error - necessary for import resolving inside target file
import { EuclideanDistanceCalculator } from '/target/distance/EuclideanDistanceCalculator.js';
//@ts-expect-error - necessary for import resolving inside target file
import { AttPseudoEuclideanDistanceCalculator } from '/target/distance/AttPseudoEuclideanDistanceCalculator.js';
//@ts-expect-error - necessary for import resolving inside target file
import { AbstractTsp } from '/target/tsp/AbstractTsp.js';
//@ts-expect-error - necessary for import resolving inside target file
import { BruteForceTsp } from '/target/tsp/BruteForceTsp.js';
//@ts-expect-error - necessary for import resolving inside target file
import { Aco } from '/target/tsp/aco/Aco.js';

const classMap = {
	GraphNode,
	EuclideanDistanceCalculator,
	AttPseudoEuclideanDistanceCalculator,
	AbstractTsp,
	BruteForceTsp,
	Aco
};

self.onmessage = (msg: MessageEvent<Record<string, any>>) => {
	const params = parseParams(msg.data);
	const tsp = instantiateTsp(params);
	const result = tsp.run();

	self.postMessage({ tsp, result });
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
