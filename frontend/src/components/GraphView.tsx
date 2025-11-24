import React, { useEffect, useRef, useState } from "react";
import cytoscape, { ElementDefinition } from "cytoscape";
import type { GraphResponse, GraphNode } from "../types";
import { fetchUserGraph, fetchTransactionGraph } from "../api";
import DetailedPanel from "./DatailedPanel";
import Legend from "./Legend";
import {
  Maximize2,
  Target,
  Download,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Loader2,
  AlertCircle,
  FileJson,
  Box,
  Grid3x3,
} from "lucide-react";

type Props = { userId: string | null; txId: string | null };

export default function GraphView({ userId, txId }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const cyRef = useRef<cytoscape.Core | null>(null);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [layout3D, setLayout3D] = useState(false);

  useEffect(() => {
    if (!userId && !txId) {
      if (containerRef.current) {
        containerRef.current.innerHTML = "";
      }
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);
    setSelectedNode(null);

    const p = userId ? fetchUserGraph(userId) : fetchTransactionGraph(txId!);

    p.then((data) => {
      render(data);
      setLoading(false);
    }).catch((err) => {
      console.error("fetch graph", err);
      setError("Failed to load graph data. Please try again.");
      setLoading(false);
      if (containerRef.current) {
        containerRef.current.innerHTML = "";
      }
    });

    return () => {
      if (cyRef.current) {
        try {
          cyRef.current.destroy();
        } catch {}
        cyRef.current = null;
      }
      setSelectedNode(null);
    };
  }, [userId, txId]);

  function mapColorForEdge(type: string) {
    switch (type) {
      case "SAME_IP":
        return "#ef4444";
      case "SAME_DEVICE":
        return "#8b5cf6";
      case "SHARED_ATTRIBUTE":
      case "DIRECT":
        return "#f59e0b";
      case "SENT":
      case "RECEIVED_BY":
      default:
        return "#9ca3af";
    }
  }

  function render(graph: GraphResponse) {
    const elements: ElementDefinition[] = [];

    graph.nodes.forEach((n) => {
      elements.push({
        data: { id: n.id, label: n.label, type: n.type, props: n.props },
      });
    });

    graph.relationships.forEach((r) => {
      elements.push({
        data: {
          id: `${r.from}__${r.to}__${r.type}`,
          source: r.from,
          target: r.to,
          label: r.type,
          relType: r.type,
        },
      });
    });

    if (cyRef.current) {
      try {
        cyRef.current.destroy();
      } catch {}
      cyRef.current = null;
    }

    cyRef.current = cytoscape({
      container: containerRef.current!,
      elements,
      style: [
        {
          selector: "node",
          style: {
            label: "data(label)",
            "text-valign": "center",
            "text-halign": "center",
            height: 40,
            width: 40,
            "font-size": 11,
            color: "#fff",
            "text-outline-width": 2,
            "text-outline-color": "#000",
          },
        },
        {
          selector: "node[type='User']",
          style: {
            "background-color": "#2563eb",
            shape: "ellipse",
            "border-width": 3,
            "border-color": "#1e40af",
          },
        },
        {
          selector: "node[type='Transaction']",
          style: {
            "background-color": "#059669",
            shape: "roundrectangle",
            "border-width": 3,
            "border-color": "#047857",
          },
        },
        {
          selector: "node:selected",
          style: {
            "border-width": 4,
            "border-color": "#a855f7",
            "overlay-opacity": 0.2,
            "overlay-color": "#a855f7",
          },
        },
        {
          selector: "edge",
          style: {
            "curve-style": "bezier",
            width: 3,
            "target-arrow-shape": "triangle",
            "line-color": "data(lineColor)",
            "target-arrow-color": "data(lineColor)",
            label: "data(label)",
            "font-size": 9,
            color: "#374151",
            "text-background-color": "#fff",
            "text-background-opacity": 0.8,
            "text-background-padding": "3px",
            "text-background-shape": "roundrectangle",
          },
        },
      ],
      layout: {
        name: "cose",
        animate: false, // Disable animation to prevent flickering
        animationDuration: 0, // No animation duration
        idealEdgeLength: 120,
        nodeRepulsion: 4000,
        padding: 50,
      },
    });

    // set dynamic edge colors
    cyRef.current.edges().forEach((e) => {
      const relType = e.data("relType") as string;
      e.data("lineColor", mapColorForEdge(relType));
    });

    // fit with padding
    cyRef.current.fit(undefined, 60);
    setZoom(cyRef.current.zoom());

    // Update zoom on zoom events
    cyRef.current.on("zoom", () => {
      if (cyRef.current) {
        setZoom(cyRef.current.zoom());
      }
    });

    // tooltips on hover
    cyRef.current.on("mouseover", "node", (ev) => {
      const n = ev.target;
      n.qtip?.show?.();
    });

    // node click opens details panel
    cyRef.current.on("tap", "node", (ev) => {
      const d = ev.target.data();
      const node = {
        id: d.id,
        label: d.label,
        type: d.type,
        props: d.props,
      };
      setSelectedNode(node);

      // Highlight selected node's neighborhood
      const selectedEle = ev.target;
      cyRef.current?.elements().removeClass("highlighted").addClass("dimmed");
      selectedEle.removeClass("dimmed").addClass("highlighted");
      selectedEle.neighborhood().removeClass("dimmed").addClass("highlighted");
    });

    // right-click to export visible graph as JSON
    cyRef.current.on("cxttap", (ev) => {
      const exportEls = cyRef.current!.elements().jsons();
      const blob = new Blob([JSON.stringify(exportEls, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `graph-export-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
    });

    // Click on background to deselect
    cyRef.current.on("tap", (ev) => {
      if (ev.target === cyRef.current) {
        setSelectedNode(null);
        cyRef.current?.elements().removeClass("highlighted dimmed");
      }
    });
  }

  const handleFitGraph = () => {
    if (cyRef.current) {
      cyRef.current.fit(undefined, 60);
      setZoom(cyRef.current.zoom());
    }
  };

  const handleFocusUsers = () => {
    if (!cyRef.current) return;
    const nodes = cyRef.current
      .nodes()
      .filter((n) => n.data("type") === "User");
    cyRef.current.elements().unselect();
    nodes.select();
    cyRef.current.fit(nodes, 80);
  };

  const handleFocusSelected = () => {
    if (!cyRef.current || !selectedNode) return;
    const node = cyRef.current.getElementById(selectedNode.id);
    if (node) {
      cyRef.current.elements().unselect();
      node.select();
      cyRef.current.animate({
        center: { eles: node },
        zoom: 1.5,
        duration: 0, // Instant transition, no animation
      });
    }
  };

  const toggle3DLayout = () => {
    setLayout3D(!layout3D);
    if (cyRef.current) {
      const layout = cyRef.current.layout({
        name: !layout3D ? "concentric" : "cose",
        animate: false, // Disable animation
        animationDuration: 0, // No animation
        idealEdgeLength: 120,
        nodeRepulsion: 4000,
        padding: 50,
        concentric: !layout3D ? (node: any) => node.degree() : undefined,
        levelWidth: !layout3D ? () => 2 : undefined,
      });
      layout.run();
    }
  };

  const handleZoomIn = () => {
    if (cyRef.current) {
      cyRef.current.zoom(cyRef.current.zoom() * 1.2);
      setZoom(cyRef.current.zoom());
    }
  };

  const handleZoomOut = () => {
    if (cyRef.current) {
      cyRef.current.zoom(cyRef.current.zoom() * 0.8);
      setZoom(cyRef.current.zoom());
    }
  };

  const handleReset = () => {
    if (cyRef.current) {
      cyRef.current.reset();
      cyRef.current.fit(undefined, 60);
      cyRef.current.elements().removeClass("highlighted dimmed");
      setZoom(cyRef.current.zoom());
    }
    setSelectedNode(null);
  };

  const handleExportGraph = () => {
    if (!cyRef.current) return;

    const exportEls = cyRef.current.elements().jsons();
    const blob = new Blob([JSON.stringify(exportEls, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `graph-export-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const renderEmptyState = () => (
    <div className="flex flex-col items-center justify-center h-full text-center px-8">
      <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
        <FileJson className="text-blue-600" size={40} />
      </div>
      <h3 className="text-xl font-semibold text-gray-800 mb-2">
        No Graph Selected
      </h3>
      <p className="text-gray-500 max-w-sm">
        Select a user or transaction from the sidebar to visualize their
        connections and relationships
      </p>
    </div>
  );

  const renderError = () => (
    <div className="flex flex-col items-center justify-center h-full text-center px-8">
      <div className="w-20 h-20 bg-red-100 rounded-2xl flex items-center justify-center mb-6">
        <AlertCircle className="text-red-600" size={40} />
      </div>
      <h3 className="text-xl font-semibold text-gray-800 mb-2">
        Failed to Load Graph
      </h3>
      <p className="text-gray-500 mb-4">{error}</p>
      <button
        onClick={() => {
          setError(null);
          if (userId) {
            fetchUserGraph(userId)
              .then(render)
              .catch(() => setError("Failed to load graph"));
          } else if (txId) {
            fetchTransactionGraph(txId)
              .then(render)
              .catch(() => setError("Failed to load graph"));
          }
        }}
        className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all font-medium"
      >
        Try Again
      </button>
    </div>
  );

  const renderLoading = () => (
    <div className="flex flex-col items-center justify-center h-full">
      <Loader2 className="text-blue-600 animate-spin mb-4" size={48} />
      <p className="text-gray-600 font-medium">Loading graph data...</p>
    </div>
  );

  return (
    <div className="relative h-full bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Legend */}
      {!loading && !error && (userId || txId) && (
        <div className="absolute left-6 top-6 z-30">
          <Legend />
        </div>
      )}

      {/* Control Panel */}
      {!loading && !error && (userId || txId) && (
        <div className="absolute right-6 top-6 z-30">
          <div className="bg-white/95 backdrop-blur-sm border border-gray-200 rounded-xl shadow-lg p-3">
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 flex items-center justify-between">
              <span>Controls</span>
              {layout3D && (
                <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                  3D Mode
                </span>
              )}
            </div>

            {/* 3D Toggle */}
            <div className="mb-3">
              <button
                onClick={toggle3DLayout}
                className={`w-full px-3 py-2 rounded-lg transition-all text-sm font-medium flex items-center justify-center gap-2 ${
                  layout3D
                    ? "bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-md"
                    : "bg-white border border-gray-200 hover:bg-gray-50"
                }`}
                title="Toggle 3D layout"
              >
                {layout3D ? <Box size={14} /> : <Grid3x3 size={14} />}
                <span>{layout3D ? "3D Layout" : "Switch to 3D"}</span>
              </button>
            </div>

            {/* Primary Actions */}
            <div className="grid grid-cols-2 gap-2 mb-3">
              <button
                onClick={handleFitGraph}
                className="px-3 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-blue-400 transition-all text-sm font-medium flex items-center justify-center gap-2 group"
                title="Fit to screen"
              >
                <Maximize2 size={14} className="group-hover:text-blue-600" />
                <span className="group-hover:text-blue-600">Fit</span>
              </button>
              <button
                onClick={handleFocusUsers}
                className="px-3 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-purple-400 transition-all text-sm font-medium flex items-center justify-center gap-2 group"
                title="Focus on all users"
              >
                <Target size={14} className="group-hover:text-purple-600" />
                <span className="group-hover:text-purple-600">Users</span>
              </button>
            </div>

            {/* Focus Selected Node */}
            {selectedNode && (
              <div className="mb-3">
                <button
                  onClick={handleFocusSelected}
                  className="w-full px-3 py-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg hover:from-purple-600 hover:to-pink-700 transition-all text-sm font-medium flex items-center justify-center gap-2 shadow-md"
                  title="Focus on selected node"
                >
                  <Target size={14} />
                  <span>Focus Selected</span>
                </button>
              </div>
            )}

            {/* Zoom Controls */}
            <div className="flex gap-2 mb-3">
              <button
                onClick={handleZoomOut}
                className="flex-1 px-3 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all text-sm font-medium flex items-center justify-center gap-1"
                title="Zoom out"
              >
                <ZoomOut size={14} />
              </button>
              <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-mono font-semibold min-w-[60px] text-center">
                {Math.round(zoom * 100)}%
              </div>
              <button
                onClick={handleZoomIn}
                className="flex-1 px-3 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all text-sm font-medium flex items-center justify-center gap-1"
                title="Zoom in"
              >
                <ZoomIn size={14} />
              </button>
            </div>

            {/* Secondary Actions */}
            <div className="flex gap-2 pt-3 border-t border-gray-200">
              <button
                onClick={handleReset}
                className="flex-1 px-3 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all text-sm font-medium flex items-center justify-center gap-2"
                title="Reset view"
              >
                <RotateCcw size={14} />
                <span>Reset</span>
              </button>
              <button
                onClick={handleExportGraph}
                className="flex-1 px-3 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all text-sm font-medium flex items-center justify-center gap-2"
                title="Export graph"
              >
                <Download size={14} />
                <span>Export</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Graph Container */}
      <div className="w-full h-full">
        {loading && renderLoading()}
        {error && renderError()}
        {!loading && !error && !userId && !txId && renderEmptyState()}
        {!loading && !error && (userId || txId) && (
          <div ref={containerRef} className="w-full h-full" />
        )}
      </div>

      {/* Details Panel */}
      <DetailedPanel
        node={selectedNode}
        onClose={() => setSelectedNode(null)}
      />
    </div>
  );
}
