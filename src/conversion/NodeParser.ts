import { AbstractDatasetConverter } from "./AbstractDatasetConverter.js";
import { DatasetConverterTsp } from "./DatasetConverterTsp.js";

export class NodeParser {
    private sources: string[] = [];
    private converter: AbstractDatasetConverter;

    constructor(sources: string[] = [], canvasSize = 625, canvasPadding = 10) {
        this.sources = sources;
        this.converter = new DatasetConverterTsp(canvasSize - 2 * canvasPadding);
    }

    public async parse() {
        const datasets: Record<string, any> = {};
        for(const path of this.sources) {
            const dataset = await this.parseFromFile(path);
            datasets[dataset.NAME] = dataset;
        }

        return datasets;
    }

    private async parseFromFile(path: string) {
        const response = await fetch(path);
        const text = await response.text();
        return this.converter.convert(text);
    }
}
