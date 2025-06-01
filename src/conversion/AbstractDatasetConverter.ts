import { GraphNode } from "../GraphNode.js";
import { ConversionConfigurationAware } from "./ConversionConfigurationAware.js";

export abstract class AbstractDatasetConverter extends ConversionConfigurationAware {
    public abstract convert(rawContent: string): Record<string, any>
    public abstract convertNodes(rawLines: string[]): GraphNode[]
}
