//Main page for Admin
import { useState } from "react";
import { useDashboardData } from "../hooks/useDashboardData.mjs";
import { useDashboardSocket } from "../hooks/useDashboardSocket.mjs";
import { borrowAPI } from "../utils/api.mjs";
import BarcodeScannerModal from "./components/BarcodeScannerModal.jsx";
import Header from "./components/Header.jsx";
import LectureLendModal from "./components/LecturerLendModal.jsx";
import LowStockItems from "./components/LowStockItems.jsx";
import PendingRequests from "./components/PendingRequest.jsx";
import Sidebar from "./components/Sidebar.jsx";
import StudentLendModal from "./components/StudentLendModal.jsx";
import TopLendingItems from "./components/TopLendingItems.jsx";
import WebcamCapture from "./components/WebcamCapture.jsx";
import InventoryTable from "./components/InventoryTable.jsx";
import { uploadStudentPhoto } from "../utils/api.mjs"; 
import { useTranslation } from "./components/TranslationContext.jsx";

const AdminDashboard = () => {
  const [lendModalOpen, setLendModalOpen] = useState(false);
  const [modalType, setModalType] = useState("student"); // 'student' or 'lecturer'
  const [borrowerData, setBorrowerData] = useState(null);
  const [showBarcodeScanner, setShowBarcodeScanner] = useState(false);
  const [selectedTransactionId, setSelectedTransactionId] = useState(null);
  const [lastRejectionReason, setLastRejectionReason] = useState("");
  const [capturedPhotos, setCapturedPhotos] = useState(new Set());

  const [showWebcam, setShowWebcam] = useState(false);
  const [currentNim, setCurrentNim] = useState(null);
  const [scannerMode, setScannerMode] = useState("borrow");

  const { t } = useTranslation();

  const {
    dashboardData,
    setDashboardData,
    refreshPendingRequests,
    currentPage,
    totalPages,
    handlePageChange,
  } = useDashboardData();

  // Function to determine modal type based on name input
  const handleLendClick = () => {
    setLendModalOpen(true);
    setModalType("student"); // Default to student
    setBorrowerData(null);
  };


  // socket setup for realtime updates
  useDashboardSocket(setDashboardData, refreshPendingRequests);

  // extract data for rendering
  const {
    topLendingItems,
    lowStockItems,
    inventoryData,
    pendingRequests,
    loading,
    error,
  } = dashboardData;

  const handleAcceptRequest = async (transactionId) => {
    try {
      await borrowAPI.acceptRequest(transactionId);
      // refresh pending request
      const pendingResponse = await borrowAPI.getPendingRequests();
      setDashboardData((prev) => ({
        ...prev,
        pendingRequests: pendingResponse.data || [],
      }));
    } catch (error) {
      console.error("Error accepting request: ", error);
      alert("Failed to accept request: " + error.message);
    }
  };

  const handleBarcodeScanSuccess = async () => {
    const transaction = pendingRequests.find((t) => t.peminjaman_id === selectedTransactionId);
    if (transaction && transaction.nim) {
      if (capturedPhotos.has(transaction.nim)) {
        setShowBarcodeScanner(false);
        setSelectedTransactionId(null);
        const pendingResponse = await borrowAPI.getPendingRequests();
        setDashboardData((prev) => ({
          ...prev,
          pendingRequests: pendingResponse.data || [],
        }));
      } else {
        setCurrentNim(transaction.nim);
        setShowBarcodeScanner(false);
        setShowWebcam(true);
      }
    } else {
      setShowBarcodeScanner(false);
      setSelectedTransactionId(null);
      const pendingResponse = await borrowAPI.getPendingRequests();
      setDashboardData((prev) => ({
        ...prev,
        pendingRequests: pendingResponse.data || [],
      }));
    }
  };

  const handlePhotoCapture = async (blob) => {
    try {
      const result = await uploadStudentPhoto(currentNim, blob);
      if (!result.success) throw new Error(result.message);

      setCapturedPhotos((prev) => new Set(prev).add(currentNim));
      setShowWebcam(false);
      setCurrentNim(null);
      setSelectedTransactionId(null);

      const pendingResponse = await borrowAPI.getPendingRequests();
      setDashboardData((prev) => ({
        ...prev,
        pendingRequests: pendingResponse.data || [],
      }));
    }
    catch (error) {
      console.error("Error uploading photo: ", error);
      alert("Failed to upload photo: " + error.message);
      setShowWebcam(false);
      setCurrentNim(null);
      setSelectedTransactionId(null);

      const pendingResponse = await borrowAPI.getPendingRequests();
      setDashboardData((prev) => ({
        ...prev,
        pendingRequests: pendingResponse.data || [],
      }));
    }
  };

  const handleRejectRequest = async (transactionId) => {
    const reason = prompt("Enter rejection reason:", lastRejectionReason);
    if (!reason) return;
    setLastRejectionReason(reason);
    try {
      await borrowAPI.rejectRequest(transactionId, reason);
      // refresh pending request without reloading the page
      const pendingResponse = await borrowAPI.getPendingRequests();
      setDashboardData((prev) => ({
        ...prev,
        pendingRequests: pendingResponse.data || [],
      }));
    } catch (error) {
      console.error("Error rejecting request: ", error);
      alert("Failed to reject request: " + error.message);
    }
  };

  const handleDirectLending = async (formData) => {
    try {
      for (const item of formData.items) {
        await borrowAPI.directLending({ ...formData, id_barang: item.id_barang });
      }
      alert(t("dashboard.directLendingSuccess"));
      setLendModalOpen(false);
      window.location.reload();
    } catch (error) {
      console.error("Error direct lending: ", error);
      alert(t("dashboard.directLendingError") + error.message);
    }
  };

  const handleReturnItem = (transaction) => {
    setSelectedTransactionId(transaction.peminjaman_id);
    setScannerMode("return");
    setShowBarcodeScanner(true);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header searchPlaceholder="Search product..." />
        <div className="flex-1 overflow-y-auto">
          {loading && topLendingItems.length === 0 && inventoryData.length === 0 ? (
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-4 text-gray-600">{t("dashboard.loading")}</p>
                </div>
              </div>
            </div>
          ) : error ? (
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <p className="mt-4 text-gray-600">{t("dashboard.error")}</p>
                  <p className="text-gray-600 text-sm mt-1">{error}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <TopLendingItems topLendingItems={topLendingItems} onLendClick={handleLendClick} />
                <LowStockItems lowStockItems={lowStockItems} />
              </div>

              <PendingRequests
                pendingRequests={pendingRequests}
                onAcceptRequest={handleAcceptRequest}
                onRejectRequest={handleRejectRequest}
                onBarcodeScan={(transactionId) => {
                  setSelectedTransactionId(transactionId);
                  setShowBarcodeScanner(true);
                }}
              />

              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">{t("dashboard.inventoryLog")}</h2>
              </div>

              <InventoryTable
                inventoryData={inventoryData}
                currentPage={currentPage}
                onPageChange={handlePageChange}
                totalPages={totalPages}
              />
            </div>
          )}
        </div>
      </div>
      {lendModalOpen &&
        (modalType === "student" ? (
          <StudentLendModal
            isOpen={lendModalOpen}
            onClose={() => setLendModalOpen(false)}
            onSubmit={handleDirectLending}
            modalType={modalType}
            setModalType={setModalType}
            borrowerData={borrowerData}
          />
        ) : (
          <LectureLendModal
            isOpen={lendModalOpen}
            onClose={() => setLendModalOpen(false)}
            onSubmit={handleDirectLending}
            modalType={modalType}
            setModalType={setModalType}
            borrowerData={borrowerData}
          />
        ))}

      {/* barcode scanner modal */}
      {showBarcodeScanner && (
        <BarcodeScannerModal
          isOpen={showBarcodeScanner}
          onClose={() => {
            setShowBarcodeScanner(false);
            setSelectedTransactionId(null);
            setScannerMode("borrow");
          }}
          transactionId={selectedTransactionId}
          onSuccess={async (barcode) => {
            if (scannerMode === "return") {
              setShowBarcodeScanner(false);
              setSelectedTransactionId(null);
              setScannerMode("borrow");
              window.location.reload(); // Refresh fully to update inventory stats
            } else {
              await handleBarcodeScanSuccess();
            }
          }}
          mode={scannerMode}
        />
      )}

      {showWebcam && (
        <WebcamCapture
          onCapture={handlePhotoCapture}
          onCancel={() => {
            setShowWebcam(false);
            setCurrentNim(null);
            setSelectedTransactionId(null);
          }}
        />
      )}
    </div>
  );
};

export default AdminDashboard;