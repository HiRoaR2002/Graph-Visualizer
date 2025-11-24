import React from "react";
import { X, Download } from "lucide-react";
import { GraphNode } from "../types";

const DetailsPanel = ({
  node,
  onClose,
}: {
  node: GraphNode | null;
  onClose: () => void;
}) => {
  if (!node) return null;

  return (
    <aside className="absolute right-6 top-6 z-50 w-80 bg-white/95 backdrop-blur-sm border border-gray-200 rounded-xl shadow-2xl overflow-hidden">
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-4 text-white">
        <div className="flex justify-between items-start">
          <div>
            <div className="text-xs opacity-90">Node Details</div>
            <div className="font-semibold text-lg mt-1">{node.type}</div>
          </div>
          <button
            className="text-white/80 hover:text-white transition-colors p-1 hover:bg-white/20 rounded-lg"
            onClick={onClose}
          >
            <X size={18} />
          </button>
        </div>
      </div>

      <div className="p-4 space-y-4">
        <div>
          <div className="text-xs font-medium text-gray-500 mb-1">ID</div>
          <div className="font-mono text-sm bg-gray-50 p-2 rounded-lg border border-gray-200 break-words">
            {node.id}
          </div>
        </div>

        <div>
          <div className="text-xs font-medium text-gray-500 mb-1">
            Properties
          </div>
          <pre className="text-xs bg-gray-50 p-3 rounded-lg border border-gray-200 max-h-40 overflow-auto font-mono">
            {JSON.stringify(node.props ?? {}, null, 2)}
          </pre>
        </div>

        <button
          onClick={() => {
            const blob = new Blob([JSON.stringify(node, null, 2)], {
              type: "application/json",
            });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `${node.id}.json`;
            a.click();
            URL.revokeObjectURL(url);
          }}
          className="w-full px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all flex items-center justify-center gap-2 font-medium"
        >
          <Download size={16} />
          Export JSON
        </button>
      </div>
    </aside>
  );
};

export default DetailsPanel;
