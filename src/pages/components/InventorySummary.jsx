import { useTranslation } from "./TranslationContext.jsx";

export default function InventorySummary({ inventorySummary, onLendClick }) {
  const { t } = useTranslation();

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        {t("dashboard.invSum.title")}
      </h3>
      <div className="flex items-center justify-around">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">
            {inventorySummary.quantityInHand || 0}
          </div>
          <div className="text-sm text-gray-500">{t("dashboard.invSum.qtyHand")}</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">
            {inventorySummary.toBeReceived || 0}
          </div>
          <div className="text-sm text-gray-500">{t("dashboard.invSum.toBeRecv")}</div>
        </div>
      </div>
    </div>
  );
}