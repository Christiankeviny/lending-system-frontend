import { useState, useMemo } from "react";
import { useTranslation } from "./TranslationContext.jsx";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import SearchableSelect from "./SearchableSelect.jsx";

export default function LowStockItems({ lowStockItems }) {
  const { t } = useTranslation();
  const [selectedItem, setSelectedItem] = useState("all");
  const [activeCategory, setActiveCategory] = useState(null);

  // Define colors for each status
  const COLORS = {
    useable: "#048494", // Teal 
    broken: "#ef4444",  // Red
    lost: "#f97316"     // Orange
  };

  // Safely extract data based on the new backend structure
  const isNewFormat = lowStockItems && !Array.isArray(lowStockItems) && lowStockItems.overall;

  const chartDataRaw = useMemo(() => {
    if (!isNewFormat) return Array.isArray(lowStockItems) ? lowStockItems : [];
    if (selectedItem === "all") return lowStockItems.overall;
    const found = lowStockItems.items?.find((i) => i.name === selectedItem);
    return found ? found.data : [];
  }, [lowStockItems, selectedItem, isNewFormat]);

  // Map the raw data to translated names and attach colors
  const data = chartDataRaw.map((item) => ({
    name: t(`dashboard.lowStock.${item.id}`),
    value: item.value,
    color: COLORS[item.id] || "#cccccc",
    id: item.id,
  }));

  const totalItems = data.reduce((acc, curr) => acc + curr.value, 0);
  const activeDataInfo = activeCategory ? data.find(d => d.id === activeCategory) : null;

  let activeBreakdown = [];
  if (activeDataInfo && isNewFormat && lowStockItems.items && selectedItem === "all") {
    activeBreakdown = lowStockItems.items
      .map(item => {
        const stat = item.data.find(d => d.id === activeCategory);
        return { name: item.name, value: stat ? stat.value : 0 };
      })
      .filter(item => item.value > 0);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4 h-10">
        <h2 className="text-xl font-semibold text-gray-900">
          {t("dashboard.lowStock.title")}
        </h2>
        {isNewFormat && lowStockItems.items?.length > 0 && (
          <SearchableSelect
            options={[
              { value: "all", label: t("dashboard.lowStock.allItems") },
              ...lowStockItems.items.map((item) => ({ value: item.name, label: item.name }))
            ]}
            value={selectedItem}
          onChange={(val) => {
            setSelectedItem(val);
            setActiveCategory(null);
          }}
            placeholder={t("dashboard.lowStock.allItems")}
            wrapperClassName="relative w-48 z-10"
            inputClassName="w-full text-sm border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 py-1.5 pl-3 pr-8 outline-none"
            iconPadding="px-2"
          />
        )}
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-80 p-4" onClick={() => setActiveCategory(null)}>
        <div className="flex h-full w-full items-center">
          {data.some((d) => d.value > 0) ? (
            <>
              <div className="w-1/2 h-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Tooltip 
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const { name, value, color } = payload[0].payload;
                          const percentage = totalItems > 0 ? ((value / totalItems) * 100).toFixed(0) : 0;
                          return (
                            <div className="bg-white p-2 border border-gray-200 shadow-lg rounded-md text-sm z-50">
                              <p className="font-medium text-gray-900">{percentage}%</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Pie
                      data={data}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={75}
                      dataKey="value"
                      stroke="none"
                  className="cursor-pointer focus:outline-none"
                      onClick={(entry, index, e) => {
                        if (e && typeof e.stopPropagation === 'function') e.stopPropagation();
                        setActiveCategory(prev => prev === entry.payload.id ? null : entry.payload.id);
                      }}
                    >
                      {data.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.color} 
                      opacity={activeCategory ? (activeCategory === entry.id ? 1 : 0.2) : 1}
                      className="transition-opacity duration-200 outline-none"
                    />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="w-1/2 flex flex-col justify-center pl-6 border-l border-gray-100" onClick={(e) => e.stopPropagation()}>
            {!activeCategory ? (
              <div className="space-y-4">
                {data.map((entry, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }}></span>
                      <span className="text-sm font-medium text-gray-700">{entry.name}</span>
                    </div>
                    <span className="text-sm font-bold text-gray-900">{entry.value}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col h-full py-1">
                <div className="flex items-center justify-between mb-3 border-b border-gray-100 pb-2">
                  <div className="flex items-center space-x-2">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: activeDataInfo?.color }}></span>
                    <span className="font-semibold text-gray-900 text-sm">{activeDataInfo?.name}</span>
                  </div>
                </div>
                <div className="overflow-y-auto pr-2 space-y-2 flex-1 max-h-[200px]">
                  {activeBreakdown.length > 0 ? (
                    activeBreakdown.map((b, idx) => (
                      <div key={idx} className="flex justify-between items-center text-sm">
                        <span className="text-gray-600 truncate mr-2" title={b.name}>{b.name}</span>
                        <span className="font-medium text-gray-900">{b.value}</span>
                      </div>
                    ))
                  ) : (
                     <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600 truncate mr-2">{selectedItem !== "all" ? selectedItem : activeDataInfo?.name}</span>
                        <span className="font-medium text-gray-900">{activeDataInfo?.value}</span>
                     </div>
                  )}
                </div>
              </div>
            )}
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center w-full h-full text-gray-500">
              {t("inventoryTable.noData")}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}