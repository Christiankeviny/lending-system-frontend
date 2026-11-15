// Borrow Modal
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { borrowAPI } from "../../utils/api.mjs";
import { useSocket } from "../../utils/socket.jsx";
import StudentLendModal from "./StudentLendModal.jsx";
import LecturerLendModal from "./LecturerLendModal.jsx";
import { useTranslation } from "./TranslationContext.jsx";
import { subscribeToPushNotifications } from "../../utils/pushNotification.mjs";

const BorrowPage = () => {
  const navigate = useNavigate();
  const { socket, joinStudentRoom } = useSocket();
  const [lendModalOpen, setLendModalOpen] = useState(true);
  const [modalType, setModalType] = useState("student");
  const [borrowerData, setBorrowerData] = useState(null);
  const [transactions, setTransactions] = useState([]);

  const { t } = useTranslation();

  // Join room based on borrower type
  useEffect(() => {
    if (borrowerData?.nim_mahasiswa) {
      joinStudentRoom(borrowerData.nim_mahasiswa);
    } else if (borrowerData?.nip_dosen) {
      // For lecturers, use NIP directly as room identifier
      joinStudentRoom(borrowerData.nip_dosen);
    }
  }, [borrowerData, joinStudentRoom]);

  // Socket listeners for real-time updates
  useEffect(() => {
    socket?.on("borrow_accepted", (data) => {
      setTransactions((prev) =>
        prev.map((t) =>
          String(t.transaction_id) === String(data.transaction_id) ? { ...t, status: "accepted" } : t
        )
      );
    });

    socket?.on("borrow_completed", (data) => {
      setTransactions((prev) =>
        prev.map((t) =>
          String(t.transaction_id) === String(data.transaction.peminjaman_id) ? { ...t, status: "completed" } : t
        )
      );
    });

    socket?.on("borrow_rejected", (data) => {
      setTransactions((prev) =>
        prev.map((t) =>
          String(t.transaction_id) === String(data.transaction_id) ? { ...t, status: "rejected", reason: data.alasan } : t
        )
      );
    });

    socket?.on("borrow_auto_rejected", (data) => {
      setTransactions((prev) =>
        prev.map((t) =>
          String(t.transaction_id) === String(data.transaction_id) ? { ...t, status: "auto_rejected", reason: data.reason } : t
        )
      );
    });

    // Cleanup listeners
    return () => {
      socket?.off("borrow_accepted");
      socket?.off("borrow_completed");
      socket?.off("borrow_rejected");
      socket?.off("borrow_auto_rejected");
    };
  }, [socket, navigate]);

  // Local fallback timer for auto-rejection
  useEffect(() => {
    if (transactions.length === 0) return;

    const interval = setInterval(() => {
      setTransactions((prev) =>
        prev.map((t) => {
          if (t.status === "pending" || t.status === "accepted") {
            try {
              if (t.request_data?.notes_checkout) {
                const metadata = JSON.parse(t.request_data.notes_checkout);
                if (metadata.countdown_expiry) {
                  const expiryTime = new Date(metadata.countdown_expiry).getTime();
                  if (Date.now() >= expiryTime) {
                    return {
                      ...t,
                      status: "auto_rejected",
                      reason: t("borrow.autoRejectReason"),
                    };
                  }
                }
              }
            } catch (e) {
              console.error("Local fallback error:", e);
            }
          }
          return t;
        })
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [transactions, t]);

  const hasTransactions = transactions.length > 0;
  const isAnyRejected = hasTransactions && transactions.some((t) => ["rejected", "auto_rejected"].includes(t.status));
  const isPending = !isAnyRejected && hasTransactions && transactions.some((t) => t.status === "pending");
  const isAllCompleted = !isAnyRejected && !isPending && hasTransactions && transactions.every((t) => t.status === "completed");
  const isAcceptedWaitingForScan = !isAnyRejected && !isPending && !isAllCompleted && hasTransactions;

  useEffect(() => {
    if (isAllCompleted || isAnyRejected) {
      const timer = setTimeout(() => {
        navigate("/");
      }, 8000);
      return () => clearTimeout(timer);
    }
  }, [isAllCompleted, isAnyRejected, navigate]);

  const handleBorrowSubmit = async (formData) => {
    try {
      const requestData = {
        nama_dosen: formData.nama_dosen,
        kelas: formData.kelas,
        nama_prodi: formData.nama_prodi,
        jadwal_id: formData.jadwal_id,
        waktu_pengembalian_dijanjikan: formData.waktu_pengembalian_dijanjikan,
        items: formData.items,
      };

      if (modalType === "student") {
        requestData.nama_mahasiswa = formData.nama_mahasiswa;
        requestData.nim_mahasiswa = formData.nim_mahasiswa;
        setBorrowerData({
          nama_mahasiswa: formData.nama_mahasiswa,
          nim_mahasiswa: formData.nim_mahasiswa,
        });
        joinStudentRoom(formData.nim_mahasiswa);
        subscribeToPushNotifications(formData.nim_mahasiswa, "student");
      } else if (modalType === "lecturer") {
        requestData.nama_dosen = formData.nama_dosen;
        requestData.nip_dosen = formData.nip_dosen;
        setBorrowerData({
          nama_dosen: formData.nama_dosen,
          nip_dosen: formData.nip_dosen,
        });
        joinStudentRoom(formData.nip_dosen);
        subscribeToPushNotifications(formData.nip_dosen, "lecturer");
      }

      const response = await borrowAPI.submitRequest(requestData);
      
      const newTxs = response.data.map((tx, index) => ({
        transaction_id: tx.transaction_id,
        status: "pending",
        item: formData.items[index],
        request_data: tx.request_data,
      }));

      setTransactions(newTxs);
      setLendModalOpen(false);
    } catch (error) {
      console.error("Error submitting borrow request:", error);
      alert(t("borrow.failedRequestMsg") + error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Render appropriate modal based on modalType */}
      {modalType === "lecturer" ? (
        <LecturerLendModal
          isOpen={lendModalOpen}
          onClose={() => navigate("/")}
          onSubmit={handleBorrowSubmit}
          borrowerData={borrowerData}
          modalType={modalType}
          setModalType={setModalType}
        />
      ) : (
        <StudentLendModal
          isOpen={lendModalOpen}
          onClose={() => navigate("/")}
          onSubmit={handleBorrowSubmit}
          borrowerData={borrowerData}
          modalType={modalType}
          setModalType={setModalType}
        />
      )}

      {/* Waiting for Admin Acceptance */}
      {isPending && (
        <div className="fixed inset-0 bg-black/75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-md">
            <div className="p-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-blue-600 animate-spin"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  {t("borrow.waitingAdminTitle")}
                </h2>
                <p className="text-gray-600 mb-4">
                  {t("borrow.waitingAdminDesc")}
                </p>
                <div className="bg-gray-50 p-3 rounded-md mb-4 text-left">
                  <p className="text-sm text-gray-700">
                    <strong>{t("borrow.transactionId")}</strong>{" "}
                    {transactions.map(t => t.transaction_id).join(", ")}
                  </p>
                  <p className="text-sm text-gray-700">
                    <strong>{t("borrow.name")}</strong>{" "}
                    {borrowerData?.nama_mahasiswa || borrowerData?.nama_dosen}
                  </p>
                  <p className="text-sm text-gray-700">
                    <strong>{t("borrow.id")}</strong>{" "}
                    {borrowerData?.nim_mahasiswa || borrowerData?.nip_dosen}
                  </p>
                  <p className="text-sm text-gray-700">
                    <strong>{t("borrow.item")}</strong>{" "}
                    {transactions.map(t => t.item.tipe_nama_barang).join(", ")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Waiting for Admin to Scan Barcode */}
      {isAcceptedWaitingForScan && (
        <div className="fixed inset-0 bg-black/75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-md">
            <div className="p-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  {t("borrow.receiveItemTitle")}
                </h2>
                <p className="text-gray-600 mb-4">
                  {t("borrow.receiveItemDesc")}
                </p>
                <div className="bg-gray-50 p-3 rounded-md mb-4 text-left">
                  <p className="text-sm text-gray-700">
                    <strong>{t("borrow.transactionId")}</strong>{" "}
                    {transactions.map(t => t.transaction_id).join(", ")}
                  </p>
                  <p className="text-sm text-gray-700">
                    <strong>{t("borrow.name")}</strong>{" "}
                    {borrowerData?.nama_mahasiswa || borrowerData?.nama_dosen}
                  </p>
                  <p className="text-sm text-gray-700">
                    <strong>{t("borrow.item")}</strong>{" "}
                    {transactions.map(t => t.item.tipe_nama_barang).join(", ")}
                  </p>
                  <p className="text-sm mt-3 text-blue-600 font-semibold bg-blue-100 p-2 rounded-md text-center">
                    {transactions.filter(t => t.status === "completed").length} / {transactions.length} items scanned
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Transaction Completed Successfully */}
      {isAllCompleted && (
        <div className="fixed inset-0 bg-black/75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-md">
            <div className="p-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  {t("borrow.successTitle")}
                </h2>
                <p className="text-gray-600 mb-4">
                  {t("borrow.successDesc")}{" "}
                  <strong>
                    {new Date(
                      transactions[0]?.request_data?.actual_return_date || new Date()
                    ).toLocaleDateString("id-ID", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </strong>
                </p>
                <div className="bg-gray-50 p-3 rounded-md mb-4 text-left">
                  <p className="text-sm text-gray-700">
                    <strong>{t("borrow.item")}</strong>{" "}
                    {transactions.map(t => t.item.tipe_nama_barang).join(", ")}
                  </p>
                  <p className="text-sm text-gray-700">
                    <strong>{t("borrow.transactionId")}</strong>{" "}
                    {transactions.map(t => t.transaction_id).join(", ")}
                  </p>
                </div>
                <p className="text-sm text-gray-500">
                  {t("borrow.modalAutoClose")}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Transaction Rejected */}
      {isAnyRejected && (
        <div className="fixed inset-0 bg-black/75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-md">
            <div className="p-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-red-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  {transactions.find(t => t.status === "auto_rejected") ? t("borrow.autoRejectedTitle") : t("borrow.rejectedTitle")}
                </h2>
                <p className="text-gray-600 mb-4">
                  {transactions.find(t => t.status === "auto_rejected") ? t("borrow.autoRejectedMsg") : t("borrow.rejectedMsg")}
                  <strong>{transactions.find(t => ["rejected", "auto_rejected"].includes(t.status))?.reason}</strong>
                </p>
                <div className="bg-gray-50 p-3 rounded-md mb-4 text-left">
                  <p className="text-sm text-gray-700">
                    <strong>{t("borrow.transactionId")}</strong>{" "}
                    {transactions.map(t => t.transaction_id).join(", ")}
                  </p>
                  <p className="text-sm text-gray-700">
                    <strong>{t("borrow.name")}</strong>{" "}
                    {borrowerData?.nama_mahasiswa || borrowerData?.nama_dosen}
                  </p>
                </div>
                <p className="text-sm text-gray-500 mb-4">
                  {t("borrow.modalAutoClose")}
                </p>
                <button
                  onClick={() => navigate("/")}
                  className="w-full py-2 px-4 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors font-medium"
                >
                  {t("borrow.backToHome")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BorrowPage;