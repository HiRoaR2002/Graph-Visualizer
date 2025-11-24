import React from "react";

const Legend = () => {
  const items = [
    { color: "bg-gray-400", label: "Transaction Link", dot: true },
    { color: "bg-amber-500", label: "Shared Attribute", dot: true },
    { color: "bg-red-500", label: "Same IP", dot: true },
    { color: "bg-purple-500", label: "Same Device", dot: true },
    {
      color: "bg-blue-600",
      label: "User Node",
      dot: false,
      shape: "rounded-full",
    },
    {
      color: "bg-emerald-600",
      label: "Transaction Node",
      dot: false,
      shape: "rounded-md",
    },
  ];

  return (
    <div className="bg-white/95 backdrop-blur-sm border border-gray-200 rounded-xl shadow-lg p-4 w-64">
      <div className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
        <div className="w-1 h-4 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full"></div>
        Legend
      </div>
      <div className="space-y-2">
        {items.map((item) => (
          <div className="flex items-center gap-3 text-sm" key={item.label}>
            <div
              className={`${item.color} ${item.shape || "rounded-full"} ${
                item.dot ? "w-3 h-3" : "w-4 h-4"
              }`}
            />
            <div className="text-gray-700">{item.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Legend;
