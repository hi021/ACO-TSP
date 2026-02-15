//go:build js && wasm

// GOOS=js GOARCH=wasm go build -o brute-force.wasm

package main

import (
	"encoding/json"
	"fmt"
	"math"
	"syscall/js"
	"time"
)

type GraphNode struct {
	ID string  `json:"id"`
	X  float64 `json:"position.native.x"`
	Y  float64 `json:"position.native.y"`
}

type GraphEdge struct {
	ID     string    `json:"id"`
	Source GraphNode `json:"source"`
	Target GraphNode `json:"target"`
}

type Result struct {
	Route    []GraphEdge `json:"route"`
	Distance int         `json:"distance"`
}

var bestDistance int
var bestRoute []GraphNode

const (
	PI           = 3.141592
	EARTH_RADIUS = 6378.388
)

func calculateCoordinate(coord float64) float64 {
	deg := math.Floor(coord)
	min := coord - deg
	return PI * (deg + (5.0*min)/3.0) / 180.0
}

func geoDistance(a, b GraphNode) int {
	latA, lonA := calculateCoordinate(a.X), calculateCoordinate(a.Y)
	latB, lonB := calculateCoordinate(b.X), calculateCoordinate(b.Y)
	q1 := math.Cos(lonA - lonB)
	q2 := math.Cos(latA - latB)
	q3 := math.Cos(latA + latB)
	d := EARTH_RADIUS * math.Acos(0.5*((1+q1)*q2-(1-q1)*q3))
	return int(d + 1.0)
}

func evaluateRoute(start GraphNode, perm []GraphNode) {
	total := 0
	prev := start

	for i := range len(perm) {
		next := perm[i]
		total += geoDistance(prev, next)
		if total >= bestDistance {
			return
		}
		prev = next
	}

	total += geoDistance(prev, start)
	if total >= bestDistance {
		return
	}

	bestDistance = total
	bestRoute = make([]GraphNode, len(perm))
	copy(bestRoute, perm)
}

func runBruteForce(nodes []GraphNode) Result {
	if len(nodes) <= 1 {
		return Result{Route: []GraphEdge{}, Distance: 0}
	}

	start := nodes[0]
	perm := append([]GraphNode{}, nodes[1:]...)

	bestDistance = math.MaxInt
	bestRoute = nil

	evaluateRoute(start, perm)

	c := make([]int, len(perm))
	i := 0

	tPrev := time.Now()
	var tCur time.Time
	permCount := 0
	prevPermCount := 0

	for i < len(perm) {
		if c[i] >= i {
			c[i] = 0
			i++
			continue
		}

		if i%2 == 0 {
			perm[0], perm[i] = perm[i], perm[0]
		} else {
			perm[c[i]], perm[i] = perm[i], perm[c[i]]
		}

		evaluateRoute(start, perm)
		c[i]++

		permCount++
		tCur = time.Now()
		tSince := tCur.Sub(tPrev).Seconds()
		if tSince >= 1 {
			permPerDelta := permCount - prevPermCount
			permPerSecond := float64(permPerDelta) / tSince
			js.Global().Get("console").Call("log", fmt.Sprintf("%d total, %.2f/s", permCount, permPerSecond))

			prevPermCount = permCount
			tPrev = tCur
		}

		i = 0
	}

	edges := make([]GraphEdge, 0, len(bestRoute)+1)
	prev := start
	for i, n := range bestRoute {
		edges = append(edges, GraphEdge{
			ID:     string(rune(i)),
			Source: prev,
			Target: n,
		})
		prev = n
	}
	edges = append(edges, GraphEdge{
		ID:     string(rune(len(bestRoute))),
		Source: prev,
		Target: start,
	})

	return Result{
		Route:    edges,
		Distance: bestDistance,
	}
}

// WASM EXPORT
func wasmRun() js.Func {
	return js.FuncOf(func(this js.Value, args []js.Value) any {
		var nodes []GraphNode
		if err := json.Unmarshal([]byte(args[0].String()), &nodes); err != nil {
			return js.ValueOf("invalid JSON: " + err.Error())
		}

		result := runBruteForce(nodes)
		out, _ := json.Marshal(result)
		return js.ValueOf(string(out))
	})
}

func main() {
	js.Global().Set("runBruteForce", wasmRun())
	select {}
}
