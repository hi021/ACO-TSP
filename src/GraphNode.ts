import { Point } from "./util/Point.js";

export class GraphNode {
    id: string;
    color?: string;
    position: {
        native: Point;
        displayed: Point;
    };

    constructor(id: string, x: number, y: number) {
        this.id = id;
        this.position = {native: new Point(x, y), displayed: new Point(x, y)};
    }

    get numericId() {
        return Number(this.id) - 1;
    }

    get x() {
        return this.position.displayed.x;
    }
    get y() {
        return this.position.displayed.y;
    }

    public setPosition(x: number, y: number) {
        this.position.displayed = new Point(x, y);
    }
    public setNativePosition(x: number, y: number) {
        this.position.native = new Point(x, y);
    }
    public scalePosition(scale: number) {
        this.position.displayed = new Point(this.x * scale, this.y * scale);
    }

    public static toMap(nodes: GraphNode[]) {
        const map = new Map<string, GraphNode>();
        for(const node of nodes)
            map.set(node.id, node);
        return map;
    }

    public static getMaxY(nodes: GraphNode[]) {
        let maxY = 0;
        for(const node of nodes) {
            if(node.y > maxY) maxY = node.y
        }
        return maxY;
    }
}
