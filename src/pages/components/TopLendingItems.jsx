import { useTranslation } from "./TranslationContext.jsx";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function TopLendingItems({ topLendingItems, onLendClick }) {
  const { t } = useTranslation();

  return (
    <div>
      <div className="flex items-center justify-between mb-4 h-10">
        <h2 className="text-xl font-semibold text-gray-900">
          {t("dashboard.topLending.title")}
        </h2>
        <button
          onClick={onLendClick}
          className="px-4 py-2 text-white rounded-md hover:opacity-90 transition-all font-medium text-sm"
          style={{ backgroundColor: "#048494" }}
        >
          {t("dashboard.invSum.lend")}
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-80 p-4">
        <div className="h-full w-full">
          {topLendingItems.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={topLendingItems}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 12, fill: "#6b7280" }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) =>
                    value.length > 12 ? `${value.substring(0, 12)}...` : value
                  }
                />
                <YAxis tick={{ fontSize: 12, fill: "#6b7280" }} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)" }}
                  cursor={{ fill: "#f3f4f6" }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }} />
                <Bar
                  dataKey="borrowedToday"
                  name={t("dashboard.topLending.lent")}
                  fill="#048494"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={40}
                />
                <Bar
                  dataKey="returnedToday"
                  name={t("dashboard.topLending.remaining")}
                  fill="#d1d5db"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              {t("dashboard.topLending.noData")}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}