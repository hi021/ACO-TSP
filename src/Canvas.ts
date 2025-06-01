import { GraphEdge } from "./GraphEdge.js";
import { GraphNode } from "./GraphNode.js";
import { Point } from "./util/Point.js";

export class Canvas {
    #element: HTMLCanvasElement;
    #graph: CanvasRenderingContext2D;
    #nodes: Map<string, GraphNode> = new Map();
    edges: GraphEdge[] = [];

    #showLabels = true;
    #size = 625;
    padding = 10;
    nodeRadius = 5;
    edgeThickness = 2;
    #colors = {
        node: "#be185d",
        highlightedNode: "#fb7185",
        label: "#e5e5e5",
        edge: "#0d9488",
        shadow: "rgba(0,0,0,0.25)"
    };

    constructor(element: HTMLCanvasElement) {
        this.#element = element;
        this.#graph = this.#element.getContext("2d");
    }

    set nodes(nodes: GraphNode[]) {
        this.#nodes = GraphNode.toMap(nodes);
        const centerPaddingY = -(this.#size - GraphNode.getMaxY(nodes)) / 2;
        this.#graph.resetTransform();
        this.#graph.translate(0, centerPaddingY);
    }

    set displayLabels(displayLabels: boolean) {
        if(displayLabels == this.#showLabels) return;
        this.#showLabels = displayLabels;
        this.redraw();
    }

    get element() {
        return this.#element;
    }

    public getTransformedNodePosition(node: GraphNode) {
        return new Point(node.x + this.padding, this.#size - node.y - this.padding);
    }

    public erase() {
        this.#graph.clearRect(0, 0, this.#size, this.#size);
    }

    public clear() {
        this.edges = [];
        this.#nodes = new Map();
        this.erase();
    }

    public drawEdges() {
        for(const edge of this.edges)
            this.drawEdge(edge);
    }

    public drawNodes() {
        for(const node of this.#nodes.values())
            this.drawNode(node, this.#showLabels);
    }

    public redraw() {
        this.erase();
        this.draw();
    }

    public redrawNodes(nodes: GraphNode[]) {
        this.clear();
        this.nodes = nodes;
        this.drawNodes();
    }

    public draw() {
        this.drawEdges();
        this.drawNodes();
    }

    public findAndHighlightOriginNode(route: GraphEdge[], unhighlightPrevious = true) {
        if(unhighlightPrevious)
            this.unhighlightOriginNode(false);

        const originNodeId = route[0].source.id;
        const originNode = this.#nodes.get(originNodeId);
        console.log(originNodeId, this.#nodes)
        originNode.color = this.#colors.highlightedNode;
        this.#nodes.set(originNodeId, originNode);

        this.redraw();
    }

    public unhighlightOriginNode(redraw = true) {
        for(const [_, v] of this.#nodes) {
            if(v.color) {
                delete v.color;
                return;
            }
        }

        if(redraw) this.redraw();
    }

    private drawEdge(edge: GraphEdge, withShadow = true) {
       const sourcePosition = this.getTransformedNodePosition(edge.source);
       const targetPosition = this.getTransformedNodePosition(edge.target);

        if(withShadow) {
            this.#graph.shadowColor = this.#colors.shadow;
            this.#graph.shadowOffsetX = 1;
            this.#graph.shadowOffsetY = 1;
            this.#graph.shadowBlur = 4;
        } else {
            this.#graph.shadowColor = "rgba(0,0,0,0)";
        }

       this.#graph.strokeStyle = this.#colors.edge;
       this.#graph.lineWidth = this.edgeThickness;
       this.#graph.beginPath();
       this.#graph.moveTo(sourcePosition.x, sourcePosition.y);
       this.#graph.lineTo(targetPosition.x, targetPosition.y);
       this.#graph.stroke();
    }

    private drawNode(node: GraphNode, withLabel: boolean, withShadow = true) {
        if(!this.#graph)
            throw new Error("Attempted to render uninitialized graph.");

        const position = this.getTransformedNodePosition(node);
        this.#graph.fillStyle = node.color ?? this.#colors.node;
        this.#graph.beginPath();
        this.#graph.arc(position.x, position.y, this.nodeRadius, 0, 2 * Math.PI, false);

        if(withShadow) {
            this.#graph.shadowColor = this.#colors.shadow;
            this.#graph.shadowOffsetX = 1;
            this.#graph.shadowOffsetY = 1;
            this.#graph.shadowBlur = 4;
        } else {
            this.#graph.shadowColor = "rgba(0,0,0,0)";
        }

        this.#graph.fill();

        if(withLabel) {
            this.#graph.fillStyle = this.#colors.label;
            this.#graph.fillText(node.id, position.x - 1, position.y - 5);
        }
    }
}
