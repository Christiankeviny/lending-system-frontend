import { useTranslation } from "./TranslationContext.jsx";

export default function InventoryTable({
  inventoryData,
  currentPage,
  totalPages,
  onPageChange,
}) {
  const { t } = useTranslation();

  const getStatusColor = (status) => {
    return status === "dipinjam"
      ? "text-blue-600"
      : status === "dikembalikan"
      ? "text-green-600"
      : status === "pending"
      ? "text-yellow-600"
      : "text-red-600";
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t("historyLog.table.item")}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t("historyLog.table.promisedTime")}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t("historyLog.table.returnedTime")}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t("historyLog.table.status")}
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {inventoryData.length > 0 ? (
              inventoryData.map((item, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                    {item.tipe_nama_barang || t("historyLog.noItem")}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.waktu_pengembalian_dijanjikan
                      ? new Date(item.waktu_pengembalian_dijanjikan).toLocaleString()
                      : t("historyLog.na")}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.waktu_pengembalian_sebenarnya
                      ? new Date(item.waktu_pengembalian_sebenarnya).toLocaleString()
                      : item.status_peminjaman === "dipinjam" || item.status_peminjaman === "terlambat"
                      ? <div className="inline-block w-[140px] text-center">{t("historyLog.unreturned")}</div>
                      : <div className="inline-block w-[140px] text-center">{t("historyLog.na")}</div>}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`font-medium ${getStatusColor(item.status_peminjaman)}`}>
                      {item.status_peminjaman === "dipinjam"
                        ? t("historyLog.status.borrowed")
                        : item.status_peminjaman === "dikembalikan"
                        ? t("historyLog.status.returned")
                        : item.status_peminjaman === "pending"
                        ? t("historyLog.status.pending")
                        : item.status_peminjaman === "terlambat"
                        ? t("historyLog.status.overdue")
                        : item.status_peminjaman}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                  {t("historyLog.noData")}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`hover:text-gray-700 ${
            currentPage === 1 ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {t("pagination.previous")}
        </button>
        <span>
          {t("pagination.page")} {currentPage} {t("pagination.of")} {totalPages}
        </span>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`hover:text-gray-700 ${
            currentPage === totalPages ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {t("pagination.next")}
        </button>
      </div>
    </div>
  );
}