import { useState } from "react";
import { inventoryAPI } from "../../utils/api";
import { useEffect } from "react";
import { useTranslation } from "./TranslationContext.jsx";

export default function InventoryModal({
  isOpen,
  onClose,
  editingItem,
  onSuccess,
}) {
  const { t } = useTranslation();

  const [inventoryFormData, setInventoryFormData] = useState({
    barcode: "",
    tipe_nama_barang: "",
    brand: "",
    model: "",
    serial_number: "",
    deskripsi: "",
    status: "tersedia",
    tanggal_pembelian: "",
    letak_barang: "",
  });

  const formatDateForInput = (dateString) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "";

      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");

      return `${year}-${month}-${day}`;
    } catch (error) {
      console.error("Error formattin date: ", error);
      return "";
    }
  };

  useEffect(() => {
    if (editingItem) {
      setInventoryFormData({
        barcode: editingItem?.barcode || "",
        tipe_nama_barang: editingItem?.tipe_nama_barang || "",
        brand: editingItem?.brand || "",
        model: editingItem?.model || "",
        serial_number: editingItem?.serial_number || "",
        deskripsi: editingItem?.deskripsi || "",
        status: editingItem?.status || "tersedia",
        tanggal_pembelian:
          formatDateForInput(editingItem?.tanggal_pembelian) || "",
        letak_barang: editingItem?.letak_barang || "",
      });
    } else {
      setInventoryFormData({
        barcode: "",
        tipe_nama_barang: "",
        brand: "",
        model: "",
        serial_number: "",
        deskripsi: "",
        status: "tersedia",
        tanggal_pembelian: "",
        letak_barang: "",
      });
    }
  }, [editingItem]);

  const handleInventoryInputChange = (e) => {
    const { name, value } = e.target;
    setInventoryFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const resetInventoryForm = () => {
    setInventoryFormData({
      barcode: "",
      tipe_nama_barang: "",
      brand: "",
      model: "",
      serial_number: "",
      deskripsi: "",
      status: "tersedia",
      tanggal_pembelian: "",
      letak_barang: "",
    });
  };

  const handleInventorySubmit = async (e) => {
    e.preventDefault();
    try {
      
      if (editingItem) {
        await inventoryAPI.update(editingItem.id_barang, inventoryFormData);
      } else {
        await inventoryAPI.create(inventoryFormData);
      }
      
      onClose();
      resetInventoryForm();
      onSuccess();
    } catch (error) {
      console.error("Error saving item: ", error);
      alert(t("inventoryModal.saveError") + error.message);
    }
  };

  const handleClose = () => {
    onClose();
    resetInventoryForm();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/75 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">
              {editingItem ? t("inventoryModal.editTitle") : t("inventoryModal.addTitle")}
            </h2>
            <button
              onClick={handleClose}
              className="w-6 h-6 flex items-center justify-center text-gray-400"
            >
              x
            </button>
          </div>
          <form onSubmit={handleInventorySubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                {t("inventoryModal.barcode")}
              </label>
              <input
                type="text"
                name="barcode"
                value={inventoryFormData.barcode}
                onChange={handleInventoryInputChange}
                placeholder={t("inventoryModal.barcodePlaceholder")}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-md"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                {t("inventoryModal.itemName")}
              </label>
              <input
                type="text"
                name="tipe_nama_barang"
                value={inventoryFormData.tipe_nama_barang}
                onChange={handleInventoryInputChange}
                placeholder={t("inventoryModal.itemNamePlaceholder")}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-md"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  {t("inventoryModal.brand")}
                </label>
                <input
                  type="text"
                  name="brand"
                  value={inventoryFormData.brand}
                  onChange={handleInventoryInputChange}
                  placeholder={t("inventoryModal.brandPlaceholder")}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-md"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  {t("inventoryModal.model")}
                </label>
                <input
                  type="text"
                  name="model"
                  value={inventoryFormData.model}
                  onChange={handleInventoryInputChange}
                  placeholder={t("inventoryModal.modelPlaceholder")}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-md"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                {t("inventoryModal.sn")}
              </label>
              <input
                type="text"
                name="serial_number"
                value={inventoryFormData.serial_number}
                onChange={handleInventoryInputChange}
                placeholder={t("inventoryModal.snPlaceholder")}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-md"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                {t("inventoryModal.location")}
              </label>
              <input
                type="text"
                name="letak_barang"
                value={inventoryFormData.letak_barang}
                onChange={handleInventoryInputChange}
                placeholder={t("inventoryModal.locationPlaceholder")}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-md"
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                {t("inventoryModal.status")}
              </label>
              <select
                name="status"
                value={inventoryFormData.status}
                onChange={handleInventoryInputChange}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-md"
              >
                <option value="tersedia">{t("inventory.status.available")}</option>
                <option value="dipinjam">{t("inventory.status.borrowed")}</option>
                <option value="diperbaiki">{t("inventory.status.underRepair")}</option>
                <option value="rusak">{t("inventory.status.damaged")}</option>
                <option value="hilang">{t("inventory.status.lost")}</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                {t("inventoryModal.purchaseDate")}
              </label>
              <input
                type="date"
                name="tanggal_pembelian"
                value={inventoryFormData.tanggal_pembelian}
                onChange={handleInventoryInputChange}
                placeholder={t("inventoryModal.snPlaceholder")}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-md"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                {t("inventoryModal.description")}
              </label>
              <textarea
                name="deskripsi"
                value={inventoryFormData.deskripsi}
                onChange={handleInventoryInputChange}
                placeholder={t("inventoryModal.descriptionPlaceholder")}
                rows="3"
                className="w-full px-3 py-2.5 border border-gray-300 rounded-md"
              />
            </div>

            <div className="flex flex-col space-y-2 pt-4">
              <button
                type="button"
                onClick={handleClose}
                className="w-full py-2.5 px-4 bg-white text-gray-700 border border-gray-300 rounded-md font-medium"
              >
                {t("inventoryModal.cancel")}
              </button>
              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-white text-white border border-gray-300 rounded-md font-medium"
                style={{ backgroundColor: "#048494" }}
              >
                {editingItem ? t("inventoryModal.save") : t("inventoryModal.save")}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}