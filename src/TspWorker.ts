//@ts-expect-error - necessary for import resolving inside target file
import { AttPseudoEuclideanDistanceCalculator } from '/target/distance/AttPseudoEuclideanDistanceCalculator.js';
//@ts-expect-error - necessary for import resolving inside target file
import { EuclideanDistanceCalculator } from '/target/distance/EuclideanDistanceCalculator.js';
//@ts-expect-error - necessary for import resolving inside target file
import { GraphNode } from '/target/GraphNode.js';
//@ts-expect-error - necessary for import resolving inside target file
import { Aco } from '/target/aco/Aco.js';

const classMap = {
	AttPseudoEuclideanDistanceCalculator,
	EuclideanDistanceCalculator,
	GraphNode
};

self.onmessage = (msg: MessageEvent<Record<string, any>>) => {
	const params = parseParams(msg.data);
	const tsp = new Aco(params);
	const result = tsp.run();

	self.postMessage({ tsp, result });
};

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
