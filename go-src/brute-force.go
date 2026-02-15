//go:build js && wasm

// GOOS=js GOARCH=wasm go build -o brute-force.wasm

package main

import (
	"encoding/json"
	"fmt"
	"math"
	"strconv"
	"syscall/js"
	"time"
)

type GraphNode struct {
	Index int
	ID    string  `json:"id"`
	X     float64 `json:"x"`
	Y     float64 `json:"y"`
	Lat   float64
	Lon   float64
}

type GraphEdge struct {
	ID     string     `json:"id"`
	Source *GraphNode `json:"source"`
	Target *GraphNode `json:"target"`
}

type Result struct {
	Route    []GraphEdge `json:"route"`
	Distance int         `json:"distance"`
}

var bestDistance int
var bestRoute []int

func (n *GraphNode) precomputeCoordinates() {
	n.Lat = calculateCoordinate(n.X)
	n.Lon = calculateCoordinate(n.Y)
}

// //////////////////////////////////// GEO DISTANCE CALC
const (
	PI           = 3.141592
	EARTH_RADIUS = 6378.388
)

var distCache [][]int

func initDistanceCache(nodes []GraphNode) {
	nodeCount := len(nodes)
	distCache = make([][]int, nodeCount)
	for i := range distCache {
		distCache[i] = make([]int, nodeCount)
		for j := range distCache[i] {
			distCache[i][j] = geoDistance(&nodes[i], &nodes[j])
		}
	}
}

func calculateCoordinate(coord float64) float64 {
	deg := math.Floor(coord)
	min := coord - deg
	return PI * (deg + (5.0*min)/3.0) / 180.0
}

func geoDistance(source, target *GraphNode) int {
	if source == target {
		return 1.0
	}

	dLat := target.Lat - source.Lat
	dLon := target.Lon - source.Lon

	sinLat := math.Sin(dLat * 0.5)
	sinLon := math.Sin(dLon * 0.5)

	h := sinLat*sinLat + math.Cos(source.Lat)*math.Cos(target.Lat)*sinLon*sinLon
	d := 2 * EARTH_RADIUS * math.Asin(math.Sqrt(h))

	dist := int(d + 1.0)
	return dist
}

func evaluateRoute(start int, nodeIndexes []int) {
	total := 0
	prev := start

	for _, next := range nodeIndexes {
		total += distCache[prev][next]
		if total >= bestDistance {
			return
		}
		prev = next
	}

	total += distCache[prev][start]
	if total < bestDistance {
		bestDistance = total
		copy(bestRoute, nodeIndexes)
	}
}

func runBruteForce(nodes []GraphNode) Result {
	if len(nodes) <= 1 {
		return Result{Route: []GraphEdge{}, Distance: 0}
	}

	nodeIndexes := make([]int, len(nodes))
	for i := range nodes {
		nodes[i].Index = i
		nodeIndexes[i] = i
		nodes[i].precomputeCoordinates()
	}
	initDistanceCache(nodes)

	start := nodeIndexes[0]
	perm := append([]int{}, nodeIndexes[1:]...)

	bestDistance = math.MaxInt
	bestRoute = make([]int, len(perm))

	tPrev := time.Now()
	var tCur time.Time
	permCount := 1
	prevPermCount := 0
	evaluateRoute(start, perm)

	c := make([]int, len(perm))
	i := 0

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
		if tSince >= 10 {
			permPerDelta := permCount - prevPermCount
			permPerSecond := float64(permPerDelta) / tSince
			go func() {
				js.Global().Get("console").Call("log", fmt.Sprintf("%d total, %.2f/s", permCount, permPerSecond))
			}()

			prevPermCount = permCount
			tPrev = tCur
		}

		i = 0
	}

	edges := make([]GraphEdge, 0, len(bestRoute)+1)
	prev := start
	for i, n := range bestRoute {
		edges = append(edges, GraphEdge{
			ID:     strconv.Itoa(i),
			Source: &nodes[prev],
			Target: &nodes[n],
		})
		prev = n
	}
	edges = append(edges, GraphEdge{
		ID:     strconv.Itoa(len(bestRoute)),
		Source: &nodes[prev],
		Target: &nodes[start],
	})

	return Result{
		Route:    edges,
		Distance: bestDistance,
	}
}

// ////////////////////////////////// WASM EXPORT
func wasmRun() js.Func {
	return js.FuncOf(func(this js.Value, args []js.Value) any {
		var nodes []GraphNode
		if err := json.Unmarshal([]byte(args[0].String()), &nodes); err != nil {
			js.Global().Get("console").Call("error", err.Error())
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
