import { Point } from "./util/Point.js";

export class ChartController {
    #element: HTMLCanvasElement;
    #chart: CanvasRenderingContext2D;
    #domain: { max: number; min: number; }
    #size = { width: 440, height: 180 };
    #padding = 10;
    pointRadius = 3;
    edgeThickness = 2;
    #values: number[];
    #points: Point[];
    #colors = {
        node: "#be185d",
        highlightedNode: "#fb7185",
        label: "#e5e5e5",
        edge: "#0d9488",
        shadow: "rgba(0,0,0,0.25)"
    };

    constructor(element: HTMLCanvasElement) {
        this.#element = element;
        this.#chart = this.#element.getContext("2d");
    }

    set values(values: number[]) {
        this.#values = values;
        this.#domain = { max: -Infinity, min: Infinity };
        this.#points = new Array<Point>(values.length);
        const xSpacing = (this.#size.width - this.#padding * 2) / values.length;
        for(const i of values) {
            if(this.#domain.max < i) this.#domain.max = i;
            if(this.#domain.min > i) this.#domain.min = i;
        }

        for(const idx in values) {
            const i = Number(idx);
            const x = this.#padding + i * xSpacing;
            const y = this.#size.height - this.#padding - ((values[i] - this.#domain.min) / (this.#domain.max - this.#domain.min) * (this.#size.height - 2 * this.#padding));
            this.#points[i] = new Point(x, y);
        }
    }

    public erase() {
        this.#chart.clearRect(0, 0, this.#size.width, this.#size.height);
    }

    public clear() {
        this.values = [];
        this.erase();
    }

    public drawLines() {
        for(let i = 0; i < this.#points.length - 1; i++)
            this.drawLine(this.#points[i], this.#points[i + 1]);
    }

    public drawPoints() {
        for(const point of this.#points)
            this.drawPoint(point);
    }

    public draw() {
        this.drawLines();
        this.drawPoints();
    }

    public redraw() {
        this.erase();
        this.draw();
    }

    private drawLine(source: Point, target: Point, withShadow = true) {
        if(withShadow) {
            this.#chart.shadowColor = this.#colors.shadow;
            this.#chart.shadowOffsetX = 1;
            this.#chart.shadowOffsetY = 1;
            this.#chart.shadowBlur = 4;
        } else {
            this.#chart.shadowColor = "rgba(0,0,0,0)";
        }

        this.#chart.strokeStyle = this.#colors.edge;
        this.#chart.lineWidth = this.edgeThickness;
        this.#chart.beginPath();
        this.#chart.moveTo(source.x, source.y);
        this.#chart.lineTo(target.x, target.y);
        this.#chart.stroke();
    }

    private drawPoint(point: Point, withShadow = true) {
        this.#chart.fillStyle = this.#colors.node;
        this.#chart.beginPath();
        this.#chart.arc(point.x, point.y, this.pointRadius, 0, 2 * Math.PI, false);

        if(withShadow) {
            this.#chart.shadowColor = this.#colors.shadow;
            this.#chart.shadowOffsetX = 1;
            this.#chart.shadowOffsetY = 1;
            this.#chart.shadowBlur = 4;
        } else {
            this.#chart.shadowColor = "rgba(0,0,0,0)";
        }

        this.#chart.fill();
    }
}
