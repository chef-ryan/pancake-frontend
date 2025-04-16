type Neighbor<V, E> = {
  node: V
  edges: { edge?: E; cost: number }[]
}

type Path<V, E> = { path: V[]; edges: (E | undefined)[]; totalCost: number }
export class Graph<V, E> {
  private adjacencyMap: Map<string, Neighbor<V, E>[]> = new Map()

  private vertexMap: Map<string, V> = new Map()

  private getVertexKey: (vertex: V) => string

  constructor(getVertexKey: (vertex: V) => string) {
    this.getVertexKey = getVertexKey
  }

  public hasVertex(vertex: V): boolean {
    const key = this.getVertexKey(vertex)
    return this.adjacencyMap.has(key)
  }

  public addVertex(vertex: V): void {
    const key = this.getVertexKey(vertex)
    if (!this.adjacencyMap.has(key)) {
      this.adjacencyMap.set(key, [])
      this.vertexMap.set(key, vertex)
    }
  }

  public getOutgoingVertices(vertex: V): V[] {
    const key = this.getVertexKey(vertex)
    return this.adjacencyMap.get(key)?.map((neighbor) => neighbor.node) || []
  }

  public addEdge(from: V, to: V, edge?: E, cost: number = 1): void {
    this.addVertex(from)
    this.addVertex(to)

    const fromKey = this.getVertexKey(from)
    const neighbors = this.adjacencyMap.get(fromKey)!

    const existingNeighbor = neighbors.find((n) => this.getVertexKey(n.node) === this.getVertexKey(to))
    if (existingNeighbor) {
      existingNeighbor.edges.push({ edge, cost })
    } else {
      neighbors.push({
        node: to,
        edges: [{ edge, cost }],
      })
    }
  }

  findPaths(from: V, to: V, type: 'dfs' = 'dfs', maxHops: number = Infinity): Path<V, E>[] {
    switch (type) {
      case 'dfs':
        return this.dfsAllPaths(from, to, maxHops)
      default:
        throw new Error(`Unsupported algorithm type: ${type}`)
    }
  }

  private dfsAllPaths(from: V, to: V, maxHops: number): Path<V, E>[] {
    const fromKey = this.getVertexKey(from)
    const toKey = this.getVertexKey(to)

    const results: Path<V, E>[] = []
    const visited = new Set<string>()

    const dfs = (currentKey: string, path: string[], edges: (E | undefined)[], cost: number) => {
      if (path.length > maxHops + 1) return

      if (currentKey === toKey) {
        results.push({
          path: path.map((key) => this.vertexMap.get(key)!),
          edges: [...edges],
          totalCost: cost,
        })
        return
      }

      visited.add(currentKey)

      const neighbors = this.adjacencyMap.get(currentKey) || []
      for (const neighbor of neighbors) {
        const neighborKey = this.getVertexKey(neighbor.node)
        if (!visited.has(neighborKey)) {
          for (const { edge, cost: edgeCost } of neighbor.edges) {
            dfs(neighborKey, [...path, neighborKey], [...edges, edge], cost + edgeCost)
          }
        }
      }

      visited.delete(currentKey)
    }

    dfs(fromKey, [fromKey], [], 0)

    return results
  }
}
