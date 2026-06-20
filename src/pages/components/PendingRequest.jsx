import { useState, useEffect } from "react";
import { useTranslation } from "./TranslationContext.jsx";

export default function PendingRequests({
  pendingRequests,
  onAcceptRequest,
  onRejectRequest,
  onBarcodeScan,
}) {
  const { t } = useTranslation();

  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const getRemainingSeconds = (request) => {
    if (request.expires_at) {
      const expiry = new Date(request.expires_at).getTime();
      return Math.max(0, Math.floor((expiry - now) / 1000));
    }
    return request.seconds_remaining || 0;
  };

  const formatTimeRemaining = (seconds) => {
    if (seconds <= 0) return t("dashboard.pending.expired");
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            {t("dashboard.pending.title")}
          </h2>
          <span className="px-3 py-1 bg-red-100 text-red-800 text-sm rounded-full font-medium">
            {pendingRequests.length} {t("dashboard.pending.pendingCount")}
          </span>
        </div>
      </div>
      <div className="overflow-x-auto">
        {pendingRequests.length > 0 ? (
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  {t("dashboard.pending.borrower")}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  {t("dashboard.pending.itemReq")}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  {t("dashboard.pending.prodi")}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  {t("dashboard.pending.lecturer")}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  {t("dashboard.pending.class")}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  {t("dashboard.pending.timeRem")}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  {t("dashboard.pending.actions")}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {pendingRequests.map((request) => {
                const currentSecondsRemaining = getRemainingSeconds(request);
                return (
                <tr key={request.peminjaman_id} className="bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {request.nama_peminjam}
                    </div>
                    <div className="text-sm text-gray-500">
                      {request.nim
                        ? `NIM: ${request.nim}`
                        : `NIP: ${request.nip}`}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {request.item_name || t("dashboard.pending.itemNotSpec")}
                    </div>
                    <div className="text-sm text-gray-500">
                      {request.item_brand && request.item_model
                        ? `${request.item_brand} ${request.item_model}`
                        : request.item_brand || request.item_model || ""}
                      {request.item_barcode && (
                        <span className="text-xs text-gray-400 ml-1">
                          (Barcode: {request.item_barcode})
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {request.nama_prodi}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {request.lecturer_name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {request.class_name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div
                      className={`text-sm font-medium ${
                        currentSecondsRemaining <= 300
                          ? "text-red-600"
                          : "text-green-600"
                      }`}
                    >
                      {formatTimeRemaining(currentSecondsRemaining)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      {request.status_peminjaman === "pending" ? (
                        <>
                          <button
                            onClick={() => {
                              onAcceptRequest(request.peminjaman_id);
                            }}
                            className="px-3 py-1 bg-green-600 text-white text-xs rounded"
                          >
                            {t("dashboard.pending.accept")}
                          </button>
                          <button
                            onClick={() => {
                              onRejectRequest(request.peminjaman_id);
                            }}
                            className="px-3 py-1 bg-red-600 text-white text-xs rounded"
                          >
                            {t("dashboard.pending.reject")}
                          </button>
                        </>
                      ) : request.status_peminjaman === "accepted" ? (
                        request.student_arrived ? (
                          <button
                            onClick={() => {
                              onBarcodeScan(request.peminjaman_id);
                            }}
                            className="px-3 py-1 bg-blue-600 text-white text-xs rounded"
                          >
                            {t("dashboard.pending.scan")}
                          </button>
                        ) : (
                          <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-xs rounded">
                            {t("dashboard.pending.waiting")}
                          </span>
                        )
                      ) : null}
                    </div>
                  </td>
                </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <div className="px-6 py-8 text-center text-gray-500">
            {t("dashboard.pending.noData")}
          </div>
        )}
      </div>
    </div>
  );
}