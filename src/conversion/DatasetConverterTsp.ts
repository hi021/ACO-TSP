import { ConversionConfigurationAware } from "./ConversionConfigurationAware.js";
import { AbstractDatasetConverter } from "./AbstractDatasetConverter.js";
import { GraphNode } from "../GraphNode.js";

export class DatasetConverterTsp extends ConversionConfigurationAware implements AbstractDatasetConverter {
    private maxCoordinate: number;

    constructor(maxCoordinate: number, delimiter?: string, nodeSectionHeader?: string, eofSymbol?: string, dataField?: string, defaultScale?: number) {
        super(delimiter, nodeSectionHeader, eofSymbol, dataField, defaultScale);
        this.maxCoordinate = maxCoordinate;
    }

    public convert(rawContent: string) {
        const json: Record<string, any> = {};
        const lines = rawContent.split("\n");

        for(const i in lines) {
            const columns = lines[i].replaceAll(":", "").split(this.delimiter);
            const key = columns.shift();
            if(!key) continue;
            if(key == this.nodeSectionHeader) {
                json.DATA = this.convertNodes(lines.slice(+i + 1));
                return json;
            }

            json[key] = columns.join(this.delimiter).trim();
        }

        throw new Error(`No node data for dataset "${json.NAME}"`);
    }

    public convertNodes(rawLines: string[]) {
        const data: GraphNode[] = [];
        for(const line of rawLines) {
            if(line == this.eofSymbol) break;

            const columns = line.split(this.delimiter);
            data.push(new GraphNode(columns[0], +columns[1], +columns[2]));
        }

        const maxCoordinate = this.findMaxCoordinate(data);
        this.scale = this.maxCoordinate / maxCoordinate;
        return this.scaleNodes(data);
    }

    private findMaxCoordinate(nodes: GraphNode[]) {
        let max = 0;
        for(const node of nodes) {
            const largerCoordinate = Math.max(node.x, node.y);
            if(largerCoordinate > max) max = largerCoordinate;
        }

        return max;
    }

    private scaleNodes(nodes: GraphNode[], scale = this.scale) {
        for(const node of nodes) node.scalePosition(scale);
        return nodes;
    }
}
