//DONE:FIXING "editdelete" to be "edit | delete" 

//Inventory Page and adding items
import { useState, useEffect } from "react";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import { inventoryAPI } from "../utils/api";
import InventoryModal from "./components/InventoryModal";
import { useTranslation } from "./components/TranslationContext.jsx";

const AdminInventory = () => {
  const [inventoryData, setInventoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const { t } = useTranslation();

  const fetchInventoryData = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await inventoryAPI.getAll(currentPage, itemsPerPage);
      
      if (data.success) {
        setInventoryData(data.data || []);
        setTotalPages(data.pagination.total_pages || 1);
      } else {
        throw new Error(data.message || "Failed to load inventory data");
      }
    } catch (error) {
      console.error("Error fetching inventory data:", error);
      setError(error.message || "Failed to load inventory data");
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleModalSuccess = () => {
    fetchInventoryData();
    setEditingItem(null);
  };

  const handleEdit = (item) => {
    setEditingItem(item);

    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm(t("inventory.deleteConfirm"))) {
      try {
        await inventoryAPI.delete(id);
        fetchInventoryData();
      } catch (error) {
        console.error("Error deleting item:", error);
        alert(t("inventory.deleteError") + error.message);
      }
    }
  };

  // fetch inventory data
  useEffect(() => {
    fetchInventoryData();
  }, [currentPage]);

  const getStatusColor = (status) => {
    switch (status) {
      case "tersedia":
        return "text-green-600";
      case "dipinjam":
        return "text-orange-600";
      case "diperbaiki":
        return "text-yellow-600";
      case "rusak":
        return "text-red-600";
      case "hilang":
        return "text-gray-500";
      default:
        return "text-gray-600";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "tersedia":
        return t("inventory.status.available");
      case "dipinjam":
        return t("inventory.status.borrowed");
      case "diperbaiki":
        return t("inventory.status.underRepair");
      case "rusak":
        return t("inventory.status.damaged");
      case "hilang":
        return t("inventory.status.lost");
      default:
        return status;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header searchPlaceholder={t("inventory.search")} />
        <div className="flex-1 overflow-y-auto">
          {loading && inventoryData.length === 0 ? (
            <div className="p-6 flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">{t("inventory.loading")}</p>
              </div>
            </div>
          ) : error ? (
            <div className="p-6 flex items-center justify-center h-64">
              <div className="text-center">
                <p className="text-gray-900 font-medium">
                  {t("inventory.error")}
                </p>
                <p className="text-gray-600 text-sm mt-1">{error}</p>
              </div>
            </div>
          ) : (
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-semibold text-gray-900">
                  {t("inventory.title")}
                </h1>
                <div className="flex items-center space-x-3">
                  <button
                    className="px-4 py-2 text-white rounded-md hover:opacity-90 transition-all font-medium"
                    style={{ backgroundColor: "#048494" }}
                    onClick={() => {
                      setEditingItem(null);
                      setShowModal(true);
                    }}
                  >
                    {t("inventory.addProduct")}
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {t("inventory.table.item")}
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {t("inventory.table.barcode")}
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {t("inventory.table.brandModel")}
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {t("inventory.table.sn")}
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {t("inventory.table.location")}
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {t("inventory.table.status")}
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {t("inventory.table.actions")}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {inventoryData.length > 0 ? (
                        inventoryData.map((item, index) => (
                          <tr
                            key={item.id_barang || index}
                            className="hover:bg-gray-50"
                          >
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                              {item.tipe_nama_barang}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {item.barcode}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {item.brand && item.model
                                ? `${item.brand} ${item.model}`
                                : item.brand || item.model || t("inventory.na")}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {item.serial_number}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {item.letak_barang}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              <span
                                className={`font-medium ${getStatusColor(item.status)}`}
                              >
                                {getStatusText(item.status)}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              <button
                                onClick={() => handleEdit(item)}
                                className="text-blue-600"
                              >
                                {t("inventory.table.edit")}
                              </button>
                              <span className="mx-2 text-gray-400">
                                |
                              </span>  
                              <button
                                onClick={() => handleDelete(item.id_barang)}
                                className="text-red-600"
                              >
                                {t("inventory.table.delete")}
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan="7"
                            className="px-6 py-8 text-center text-gray-500"
                          ></td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`hover:text-gray-700 ${currentPage === 1 ? "opacity-50 cursor-not-allowed" : ""
                      } `}
                  >
                    {t("pagination.previous")}
                  </button>
                  <span>
                    {t("pagination.page")} {currentPage} {t("pagination.of")} {totalPages}
                  </span>
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`hover:text-gray-700 ${currentPage === totalPages ? "opacity-50 cursor-not-allowed" : ""
                      } `}
                  >
                    {t("pagination.next")}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <InventoryModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingItem(null);
        }}
        editingItem={editingItem}
        onSuccess={handleModalSuccess}
      />
    </div>
  );
};

export default AdminInventory;