import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import {
  Network,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Layers,
  Filter,
  Info,
  ShieldAlert,
  Server,
  KeyRound,
  Maximize2
} from 'lucide-react';
import { ExtractedIOC, MitreTechnique, RemediationAction } from '../types';

interface KnowledgeGraphProps {
  iocs: ExtractedIOC[];
  techniques: MitreTechnique[];
  actions: RemediationAction[];
  incidentTitle?: string;
}

export interface GraphNode extends d3.SimulationNodeDatum {
  id: string;
  name: string;
  type: 'TACTIC' | 'TECHNIQUE' | 'IOC' | 'ASSET';
  subType?: string;
  val: number;
  color: string;
  borderColor: string;
  details?: string;
  iconType?: string;
}

export interface GraphLink extends d3.SimulationLinkDatum<GraphNode> {
  source: string | GraphNode;
  target: string | GraphNode;
  relation: string;
  color?: string;
}

export const SecurityKnowledgeGraph: React.FC<KnowledgeGraphProps> = ({
  iocs,
  techniques,
  actions,
  incidentTitle
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [filterType, setFilterType] = useState<string>('ALL');
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const zoomBehaviorRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);

  // Derive graph data from IOCs, MITRE techniques, and target assets
  const graphData = useMemo(() => {
    const nodes: GraphNode[] = [];
    const links: GraphLink[] = [];
    const nodeSet = new Set<string>();
    const linkSet = new Set<string>();

    const addNode = (node: GraphNode) => {
      if (!nodeSet.has(node.id)) {
        nodeSet.add(node.id);
        nodes.push(node);
      }
    };

    const addLink = (link: GraphLink) => {
      const srcId = typeof link.source === 'string' ? link.source : (link.source as any).id;
      const tgtId = typeof link.target === 'string' ? link.target : (link.target as any).id;
      const key = `${srcId}->${tgtId}:${link.relation}`;
      if (!linkSet.has(key)) {
        linkSet.add(key);
        links.push(link);
      }
    };

    // 1. Target Assets (Derived from Remediation Actions and telemetry targets)
    const assetSet = new Set<string>();
    actions.forEach((act) => {
      const comp = act.targetComponent.trim();
      if (comp) assetSet.add(comp);
    });

    if (assetSet.size === 0) {
      assetSet.add('Production Server (Linux 6.8)');
    }

    assetSet.forEach((assetName) => {
      addNode({
        id: `ASSET-${assetName}`,
        name: assetName,
        type: 'ASSET',
        subType: 'Target Host / Service',
        val: 16,
        color: '#0284c7', // Sky blue
        borderColor: '#38bdf8',
        details: `Impacted infrastructure component targeted by adversary activity.`
      });
    });

    const primaryAssetId = `ASSET-${Array.from(assetSet)[0]}`;

    // 2. MITRE Tactics & Techniques
    const tacticsMap = new Map<string, string[]>();

    techniques.forEach((tech) => {
      const tacticId = `TAC-${tech.tactic.replace(/\s+/g, '_')}`;
      if (!tacticsMap.has(tacticId)) {
        tacticsMap.set(tacticId, []);
        addNode({
          id: tacticId,
          name: tech.tactic,
          type: 'TACTIC',
          subType: 'MITRE Kill Chain Phase',
          val: 18,
          color: '#8b5cf6', // Purple
          borderColor: '#c084fc',
          details: `Adversary tactical objective in the Enterprise Matrix.`
        });

        // Link tactic to primary target asset
        addLink({
          source: tacticId,
          target: primaryAssetId,
          relation: 'targets',
          color: '#6366f1'
        });
      }

      // Add Technique Node
      const techId = `TECH-${tech.id}`;
      addNode({
        id: techId,
        name: `${tech.id}: ${tech.name}`,
        type: 'TECHNIQUE',
        subType: tech.tactic,
        val: 13,
        color: '#ec4899', // Pink
        borderColor: '#f472b6',
        details: `Verified procedure: ${tech.name} (${tech.confidence}% confidence). Proven by log anchor.`
      });

      // Link Technique to its Tactic
      addLink({
        source: techId,
        target: tacticId,
        relation: 'executes',
        color: '#a855f7'
      });

      // Also link to specific affected asset if action targets this technique
      actions.forEach((act) => {
        if (act.title.toLowerCase().includes(tech.name.toLowerCase()) || act.description.toLowerCase().includes(tech.id.toLowerCase())) {
          addLink({
            source: techId,
            target: `ASSET-${act.targetComponent}`,
            relation: 'impacts',
            color: '#f43f5e'
          });
        }
      });
    });

    // 3. Extracted IOCs (IPs, processes, files, users)
    iocs.forEach((ioc) => {
      const iocId = `IOC-${ioc.type}-${ioc.value}`;
      let iocColor = '#10b981'; // Default green
      let borderColor = '#34d399';

      if (ioc.type === 'ip') {
        iocColor = '#ef4444'; // Red for malicious IP
        borderColor = '#f87171';
      } else if (ioc.type === 'user') {
        iocColor = '#f59e0b'; // Amber for user account
        borderColor = '#fbbf24';
      } else if (ioc.type === 'process') {
        iocColor = '#06b6d4'; // Cyan for process
        borderColor = '#22d3ee';
      } else if (ioc.type === 'filepath') {
        iocColor = '#eab308'; // Yellow for files
        borderColor = '#facc15';
      }

      addNode({
        id: iocId,
        name: ioc.value,
        type: 'IOC',
        subType: ioc.type.toUpperCase(),
        val: 10,
        color: iocColor,
        borderColor: borderColor,
        details: `Type: ${ioc.type.toUpperCase()} | Context: ${ioc.threatContext} | Verified In Telemetry: ${ioc.verifiedInLog ? 'YES' : 'NO'}`
      });

      // Associate IOC with corresponding techniques
      let linkedToTechnique = false;
      techniques.forEach((tech) => {
        const techId = `TECH-${tech.id}`;
        // If IOC context mentions tactic or technique, link it
        if (
          ioc.threatContext.toLowerCase().includes(tech.name.toLowerCase()) ||
          ioc.threatContext.toLowerCase().includes(tech.id.toLowerCase()) ||
          ioc.threatContext.toLowerCase().includes(tech.tactic.toLowerCase())
        ) {
          addLink({
            source: iocId,
            target: techId,
            relation: 'indicates',
            color: '#10b981'
          });
          linkedToTechnique = true;
        }
      });

      // If not linked specifically to a technique, link to the nearest tactic or asset
      if (!linkedToTechnique) {
        if (techniques.length > 0) {
          addLink({
            source: iocId,
            target: `TECH-${techniques[0].id}`,
            relation: 'associated_with',
            color: '#64748b'
          });
        } else {
          addLink({
            source: iocId,
            target: primaryAssetId,
            relation: 'observed_on',
            color: '#64748b'
          });
        }
      }
    });

    return { nodes, links };
  }, [iocs, techniques, actions]);

  // Filter nodes according to selection
  const filteredData = useMemo(() => {
    if (filterType === 'ALL') return graphData;
    const allowedNodes = new Set(
      graphData.nodes.filter((n) => n.type === filterType).map((n) => n.id)
    );
    // Keep assets for context
    graphData.nodes.filter((n) => n.type === 'ASSET').forEach((n) => allowedNodes.add(n.id));

    const nodes = graphData.nodes.filter((n) => allowedNodes.has(n.id));
    const links = graphData.links.filter((l) => {
      const sourceId = typeof l.source === 'object' ? (l.source as GraphNode).id : l.source;
      const targetId = typeof l.target === 'object' ? (l.target as GraphNode).id : l.target;
      return allowedNodes.has(sourceId) && allowedNodes.has(targetId);
    });

    return { nodes, links };
  }, [graphData, filterType]);

  // Render D3 Force Directed Graph with ResizeObserver
  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove(); // Clear previous render

    const width = containerRef.current.clientWidth || 700;
    const height = 480;

    // Zoom setup
    const g = svg.append('g').attr('class', 'graph-content');

    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.3, 3])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
        setZoomLevel(event.transform.k);
      });

    zoomBehaviorRef.current = zoom;
    svg.call(zoom);

    // Deep clone data for D3 mutation
    const nodes: GraphNode[] = filteredData.nodes.map((d) => ({ ...d }));
    const links: GraphLink[] = filteredData.links.map((d) => ({ ...d }));

    // Force simulation
    const simulation = d3
      .forceSimulation<GraphNode>(nodes)
      .force(
        'link',
        d3
          .forceLink<GraphNode, GraphLink>(links)
          .id((d) => d.id)
          .distance(75)
      )
      .force('charge', d3.forceManyBody().strength(-280))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius((d) => (d as GraphNode).val + 14));

    // Arrow marker definition
    const defs = svg.append('defs');
    defs
      .append('marker')
      .attr('id', 'arrow')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 22)
      .attr('refY', 0)
      .attr('markerWidth', 5)
      .attr('markerHeight', 5)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-5L10,0L0,5')
      .attr('fill', '#475569');

    // Draw Links
    const link = g
      .append('g')
      .attr('class', 'links')
      .selectAll('line')
      .data(links)
      .enter()
      .append('line')
      .attr('stroke', (d) => d.color || '#334155')
      .attr('stroke-opacity', 0.6)
      .attr('stroke-width', 1.5)
      .attr('stroke-dasharray', (d) => (d.relation === 'targets' ? '4 2' : 'none'))
      .attr('marker-end', 'url(#arrow)');

    // Link labels
    const linkText = g
      .append('g')
      .attr('class', 'link-labels')
      .selectAll('text')
      .data(links)
      .enter()
      .append('text')
      .attr('font-size', '8px')
      .attr('font-family', 'monospace')
      .attr('fill', '#64748b')
      .attr('text-anchor', 'middle')
      .text((d) => d.relation);

    // Drag behavior
    const drag = (sim: d3.Simulation<GraphNode, GraphLink>) => {
      function dragstarted(event: d3.D3DragEvent<SVGGElement, GraphNode, GraphNode>, d: GraphNode) {
        if (!event.active) sim.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
      }

      function dragged(event: d3.D3DragEvent<SVGGElement, GraphNode, GraphNode>, d: GraphNode) {
        d.fx = event.x;
        d.fy = event.y;
      }

      function dragended(event: d3.D3DragEvent<SVGGElement, GraphNode, GraphNode>, d: GraphNode) {
        if (!event.active) sim.alphaTarget(0);
        d.fx = null;
        d.fy = null;
      }

      return d3
        .drag<SVGGElement, GraphNode>()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended);
    };

    // Draw Nodes
    const node = g
      .append('g')
      .attr('class', 'nodes')
      .selectAll('g')
      .data(nodes)
      .enter()
      .append('g')
      .attr('cursor', 'pointer')
      .call(drag(simulation))
      .on('click', (_, d) => {
        setSelectedNode(d);
      });

    // Node outer circle (glowing halo on hover/select)
    node
      .append('circle')
      .attr('r', (d) => d.val + 2)
      .attr('fill', (d) => d.color)
      .attr('fill-opacity', 0.25)
      .attr('stroke', (d) => d.borderColor)
      .attr('stroke-width', 2);

    // Node inner core
    node
      .append('circle')
      .attr('r', (d) => d.val)
      .attr('fill', (d) => d.color)
      .attr('fill-opacity', 0.85);

    // Node text labels
    node
      .append('text')
      .attr('dy', (d) => d.val + 12)
      .attr('font-size', '10px')
      .attr('font-family', 'monospace')
      .attr('fill', '#cbd5e1')
      .attr('text-anchor', 'middle')
      .text((d) => (d.name.length > 20 ? d.name.slice(0, 18) + '...' : d.name));

    // Simulation tick update
    simulation.on('tick', () => {
      link
        .attr('x1', (d) => ((d.source as GraphNode).x ?? 0))
        .attr('y1', (d) => ((d.source as GraphNode).y ?? 0))
        .attr('x2', (d) => ((d.target as GraphNode).x ?? 0))
        .attr('y2', (d) => ((d.target as GraphNode).y ?? 0));

      linkText
        .attr('x', (d) => (((d.source as GraphNode).x ?? 0) + ((d.target as GraphNode).x ?? 0)) / 2)
        .attr('y', (d) => (((d.source as GraphNode).y ?? 0) + ((d.target as GraphNode).y ?? 0)) / 2);

      node.attr('transform', (d) => `translate(${d.x ?? 0},${d.y ?? 0})`);
    });

    return () => {
      simulation.stop();
    };
  }, [filteredData]);

  // Zoom controls
  const handleZoom = (delta: number) => {
    if (!svgRef.current || !zoomBehaviorRef.current) return;
    const svg = d3.select(svgRef.current);
    svg.transition().duration(250).call(zoomBehaviorRef.current.scaleBy, delta);
  };

  const handleResetZoom = () => {
    if (!svgRef.current || !zoomBehaviorRef.current) return;
    const svg = d3.select(svgRef.current);
    svg.transition().duration(300).call(zoomBehaviorRef.current.transform, d3.zoomIdentity);
  };

  return (
    <div className="cyber-card reticle-corner rounded-xl p-5 space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Network className="w-4 h-4 text-emerald-400" />
          <div>
            <h3 className="text-sm font-semibold text-slate-200 font-mono tracking-wide flex items-center gap-2">
              <span>SITUATIONAL KNOWLEDGE GRAPH (D3.JS)</span>
              <span className="text-xs bg-slate-800/90 text-slate-300 px-2 py-0.5 rounded border border-slate-700 font-mono">
                {filteredData.nodes.length} Entities • {filteredData.links.length} Relations
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Interactive topological mapping linking Indicators of Compromise (IOCs), MITRE Tactics, and Affected Assets
            </p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 font-mono text-xs">
          <span className="text-slate-500 text-[11px] mr-1 flex items-center gap-1">
            <Filter className="w-3 h-3" />
            Filter:
          </span>
          {[
            { id: 'ALL', label: 'All Entities' },
            { id: 'IOC', label: 'IOCs' },
            { id: 'TECHNIQUE', label: 'Techniques' },
            { id: 'TACTIC', label: 'Tactics' },
            { id: 'ASSET', label: 'Assets' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterType(tab.id)}
              className={`px-2.5 py-1 rounded transition text-xs ${
                filterType === tab.id
                  ? 'bg-emerald-600 text-white font-semibold shadow-sm'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Legend & Zoom Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-950/70 border border-slate-800 rounded-lg p-2.5 font-mono text-xs text-slate-400">
        {/* Legend */}
        <div className="flex flex-wrap items-center gap-3 text-[11px]">
          <span className="text-slate-500 font-semibold uppercase">Legend:</span>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-500 border border-sky-400" />
            <span>Target Asset</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-500 border border-purple-400" />
            <span>MITRE Tactic</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-pink-500 border border-pink-400" />
            <span>MITRE Technique</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 border border-red-400" />
            <span>IP / Malicious IOC</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 border border-amber-400" />
            <span>Account / User</span>
          </div>
        </div>

        {/* Zoom & Reset Buttons */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => handleZoom(1.3)}
            className="p-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded text-slate-300 hover:text-white"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => handleZoom(0.7)}
            className="p-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded text-slate-300 hover:text-white"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleResetZoom}
            className="p-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded text-slate-300 hover:text-white"
            title="Reset Perspective"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Graph SVG Viewport */}
      <div
        ref={containerRef}
        className="relative w-full h-[480px] cyber-grid bg-slate-950/95 rounded-xl border border-slate-800/90 overflow-hidden select-none"
      >
        <svg
          ref={svgRef}
          className="w-full h-full cursor-grab active:cursor-grabbing"
          style={{ width: '100%', height: '100%' }}
        />

        {/* Overlay Node Inspector Drawer */}
        {selectedNode && (
          <div className="absolute bottom-3 left-3 right-3 sm:right-auto sm:max-w-md bg-slate-900/95 border border-slate-700 rounded-xl p-4 shadow-xl backdrop-blur-md space-y-2 font-mono text-xs z-20">
            <div className="flex items-start justify-between gap-2 border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: selectedNode.color }}
                />
                <span className="font-bold text-slate-100 text-sm">{selectedNode.name}</span>
              </div>
              <button
                onClick={() => setSelectedNode(null)}
                className="text-slate-400 hover:text-white text-xs px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700"
              >
                Close
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div>
                <span className="text-slate-500 uppercase block">Category:</span>
                <span className="font-semibold text-emerald-400">{selectedNode.type}</span>
              </div>
              <div>
                <span className="text-slate-500 uppercase block">Subtype / Phase:</span>
                <span className="text-slate-300">{selectedNode.subType || 'N/A'}</span>
              </div>
            </div>

            {selectedNode.details && (
              <div className="bg-slate-950 p-2.5 rounded border border-slate-800 text-slate-300 text-[11px] leading-relaxed">
                {selectedNode.details}
              </div>
            )}

            <div className="text-[10px] text-slate-500 italic pt-1">
              Tip: Drag any node to reposition the force layout. Click elsewhere to dismiss.
            </div>
          </div>
        )}

        {/* Empty State Guard */}
        {filteredData.nodes.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center text-slate-500 font-mono text-xs">
            No entities match the active filter criteria.
          </div>
        )}
      </div>
    </div>
  );
};
