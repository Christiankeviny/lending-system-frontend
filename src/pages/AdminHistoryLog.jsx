//TODO: Add BarcodeScannerModal for overdue items


import { useState, useEffect } from "react";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import BorrowerPhotoModal from "./components/BorrowerPhotoModal.jsx";
import BarcodeScannerModal from "./components/BarcodeScannerModal.jsx"
import { useSocket } from "../utils/socket.jsx";
import { dashboardAPI } from "../utils/api";
import { useTranslation } from "./components/TranslationContext.jsx";

const AdminHistoryLog = () => {
  const { socket, joinAdminRoom } = useSocket();
  const [historyData, setHistoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage] = useState(10);
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [selectedTransactionId, setSelectedTransactionId] = useState(null);
  const [notes, setNotes] = useState("");
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [photoModalData, setPhotoModalData] = useState({ nim: null, name: "" });
  const [searchName, setSearchName] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [overdueDate, setOverdueDate] = useState("");

  const { t } = useTranslation();

  // function to fetch history log data
  const fetchHistoryData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await dashboardAPI.getHistoryLog(currentPage, itemsPerPage, {
        searchName,
        status: statusFilter,
        overdueDate
      });
      if (data.success) {
        setHistoryData(data.data);
        setTotalPages(data.pagination?.total_pages);
      } else {
        throw new Error(data.message || "Failed to load history data");
      }
    } catch (error) {
      console.error("Error fetching history data:", error);
      setError(error.message || "Failed to load history data");
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleReturnItem = (transaction) => {
    setSelectedTransactionId(transaction.peminjaman_id);
    setIsReturnModalOpen(true);
    setNotes("");
  };

  const handleReturnSuccess = async (barcode) => {
    try {
      // Call the return item API with barcode
      await dashboardAPI.returnItemByBarcode(barcode, notes);

      // Refresh the history data after successful return
      fetchHistoryData();

      // Close modal
      setIsReturnModalOpen(false);
      setSelectedTransactionId(null);
      setNotes("");
    } catch (error) {
      console.error("Error returning item:", error);
      // Handle error if needed
    }
  };

  const handleCloseReturnModal = () => {
    setIsReturnModalOpen(false);
    setSelectedTransactionId(null);
  };

  const handleBorrowerClick = (item) => {
    setPhotoModalData({
      nim: item.nim,
      name: item.nama_peminjam
    });
    setIsPhotoModalOpen(true);
  };

  // fetch history log data on mount and when page changes
  useEffect(() => {
    fetchHistoryData();
  }, [currentPage, searchName, statusFilter, overdueDate]);

  // socket io setup for realtime updates
  useEffect(() => {
    // join admin room for realtime notif
    joinAdminRoom();

    // listen for new borrow requests
    socket?.on("new_borrow_request", () => {
      console.log("new borrow request received");
      fetchHistoryData();
    });

    // listen for request processing updates
    socket?.on("request_processed", () => {
      console.log("request processed");

      fetchHistoryData();
    });

    // listen for auto-rejected requests
    socket?.on("borrow_auto_rejected", () => {
      console.log("request auto-rejected");

      fetchHistoryData();
    });

    // listen for direct lending completion
    socket?.on("direct_lending_completed", () => {
      console.log("direct lending completed");

      fetchHistoryData();
    });
    // listen for overdue items updates (automatic status changes)
    socket?.on("items_overdue", () => {
      console.log("items became overdue");

      fetchHistoryData();
    });
    // listen for item returns
    socket?.on("item_returned", () => {
      console.log("item returned");

      fetchHistoryData();
    });

    // cleanup listeners on unmount
    return () => {
      socket?.off("new_borrow_request");
      socket?.off("request_processed");
      socket?.off("borrow_auto_rejected");
      socket?.off("direct_lending_completed");
      socket?.off("items_overdue");
      socket?.off("item_returned");
    };
  }, [socket, joinAdminRoom, fetchHistoryData]);

  const getStatusColor = (status) => {
    return status === "dipinjam"
      ? "text-blue-600"
      : status === "dikembalikan"
      ? "text-green-600"
      : status === "pending"
      ? "text-yellow-600"
      : "text-red-600";
  };

  if (loading && historyData.length === 0) {
    return (
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header searchPlaceholder={t("historyLog.search")} />
          <div className="flex-1 overflow-y-auto">
            <div className="p-6 flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">{t("historyLog.loading")}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header searchPlaceholder={t("historyLog.search")} />
          <div className="flex-1 overflow-y-auto">
            <div className="p-6 flex items-center justify-center h-64">
              <div className="text-center">
                <p>{t("historyLog.error")}</p>
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header searchPlaceholder={t("historyLog.search")} />
        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
              <h1 className="text-2xl font-semibold text-gray-900">{t("historyLog.title")}</h1>
              
              <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                <input 
                  type="text" 
                  placeholder="Cari nama peminjam..." 
                  className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={searchName}
                  onChange={(e) => setSearchName(e.target.value)}
                />
                
                {/* Status Filters */}
                <div className="flex flex-wrap gap-2 items-center">
                  <button
                    onClick={() => {
                      setStatusFilter("");
                      setCurrentPage(1);
                    }}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors border ${
                      statusFilter === ""
                        ? "bg-gray-100 border-gray-400 shadow-inner font-bold text-gray-700"
                        : "bg-white border-gray-200 hover:bg-gray-50 text-gray-700"
                    }`}
                  >
                    Semua
                  </button>
                  {["dipinjam", "dikembalikan", "terlambat"].map((status) => (
                    <button
                      key={status}
                      onClick={() => {
                        setStatusFilter(status);
                        setCurrentPage(1);
                      }}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors border capitalize ${
                        statusFilter === status
                          ? `bg-gray-100 border-gray-400 shadow-inner font-bold ${getStatusColor(status)}`
                          : `bg-white border-gray-200 hover:bg-gray-50 ${getStatusColor(status)}`
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>

                <input 
                  type="date" 
                  className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={overdueDate}
                  onChange={(e) => setOverdueDate(e.target.value)}
                  title="Filter Tanggal Tenggat Pengembalian"
                />
              </div>
            </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t("historyLog.table.borrower")}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t("historyLog.table.item")}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t("historyLog.table.class")}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t("historyLog.table.expiry")}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t("historyLog.table.status")}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t("historyLog.table.actions")}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {historyData.length > 0 ? (
                    historyData.map((item, index) => (
                      <tr key={item.peminjaman_id || index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                          {item.status_peminjaman === "dipinjam" || item.status_peminjaman === "terlambat" ? (
                            <button
                              onClick={() => handleBorrowerClick(item)}
                              className="focus:outline-none text-left cursor-pointer hover:text-blue-600 transition-colors duration-200"
                              title="View ID Card Photo"
                            >
                              {item.nama_peminjam}
                            </button>
                          ) : (
                            <span>{item.nama_peminjam}</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.tipe_nama_barang || t("historyLog.noItem")}
                          {item.notes_checkout &&
                            (() => {
                              try {
                                const notes = JSON.parse(item.notes_checkout);
                                return (
                                  notes.direct_admin_lending && (
                                    <span className="ml-2 px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded">
                                      {t("historyLog.directAdmin")}
                                    </span>
                                  )
                                );
                              } catch {
                                return null;
                              }
                            })()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {(() => {
                            try {
                              const notes = JSON.parse(item.notes_checkout || "{}");
                              return notes.class_name || t("historyLog.na");
                            } catch {
                              return t("historyLog.na");
                            }
                          })()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.waktu_pengembalian_dijanjikan
                            ? new Date(item.waktu_pengembalian_dijanjikan).toLocaleString()
                            : t("historyLog.na")}
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
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {(item.status_peminjaman === "terlambat" || item.status_peminjaman === "dipinjam") && (
                            <button
                              onClick={() => handleReturnItem(item)}
                              className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-colors"
                            >
                              {t("historyLog.returnItem")}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                        {t("historyLog.noData")}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`hover:text-gray-700 ${currentPage === 1 ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                {t("pagination.previous")}
              </button>
              <span>
                {t("pagination.page")} {currentPage} {t("pagination.of")} {totalPages}
              </span>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`hover:text-gray-700 ${currentPage === totalPages ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                {t("pagination.next")}
              </button>
            </div>
          </div>
          </div>
        </div>
      </div>

      {/* Return Item Modal */}
      <BarcodeScannerModal
        isOpen={isReturnModalOpen}
        onClose={handleCloseReturnModal}
        transactionId={selectedTransactionId}
        onSuccess={handleReturnSuccess}
        mode="return"
      />
      {/* Borrower Photo Modal */}
      <BorrowerPhotoModal
        isOpen={isPhotoModalOpen}
        onClose={() => setIsPhotoModalOpen(false)}
        nim={photoModalData.nim}
        borrowerName={photoModalData.name}
      />
    </div>
  );
};

export default AdminHistoryLog;