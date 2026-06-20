import { useEffect } from "react";
import { useState } from "react";
import { dropdownAPI } from "../../utils/api";
import { useTranslation } from "./TranslationContext.jsx";
import SearchableSelect from "./SearchableSelect.jsx";

const LectureLendModal = ({
  isOpen,
  onClose,
  onSubmit,
  borrowerData,
  modalType,
  setModalType,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [mataKuliah, setMataKuliah] = useState([]);
  const [programStudies, setProgramStudies] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [availableItems, setAvailableItems] = useState([]);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [fetchError, setFetchError] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);

  const { t } = useTranslation();

  const [formData, setFormData] = useState({
    nama_dosen: borrowerData?.nama_dosen || "",
    nip_dosen: borrowerData?.nip_dosen || "",
    kelas: "",
    nama_prodi: "",
    jadwal_id: "",
    waktu_pengembalian_dijanjikan: "",
  });

  useEffect(() => {
    const loadDropdownData = async () => {
      try {
        setFetchError(false);
        const [
          classesResponses,
          programStudiesResponses,
          schedulesResponses,
          availableItemsResponses,
        ] = await Promise.all([
          dropdownAPI.getClasses(),
          dropdownAPI.getProgramStudies(),
          dropdownAPI.getActive(),
          dropdownAPI.getAvailable(),
        ]);

        setMataKuliah(classesResponses.data || []);
        setProgramStudies(programStudiesResponses.data || []);
        setSchedules(schedulesResponses.data || []);
        setAvailableItems(availableItemsResponses.data || []);
      } catch (error) {
        console.error(error);
        setFetchError(true);
      }
    };

    if (isOpen) {
      loadDropdownData();
    }
  }, [isOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleScheduleSelect = (scheduleId) => {
    const schedule = schedules.find(
      (s) => s.id_jadwal === parseInt(scheduleId)
    );
    setSelectedSchedule(schedule);
    setFormData((prev) => ({
      ...prev,
      jadwal_id: scheduleId,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedItems.length === 0) {
      alert(t("modal.borrowedItemPlaceholder"));
      return;
    }
    onSubmit({ ...formData, items: selectedItems });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/75 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <span className="text-lg font-semibold text-gray-900">
                {t("modal.lendTo")}
              </span>

              {/* Custom Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center space-x-1 px-3 py-1 rounded-full hover:opacity-90 transition-colors font-medium text-sm"
                  style={{ backgroundColor: "#e6f7f9", color: "#036570" }}
                >
                  <span>
                    {modalType === "student" ? t("modal.student") : t("modal.lecturer")}
                  </span>
                  <svg
                    className={`w-4 h-4 transition-transform ${
                      isDropdownOpen ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {/* Dropdown Menu */}
                {isDropdownOpen && (
                  <div className="absolute top-full mt-1 left-0 bg-white rounded-lg shadow-lg border border-gray-200 py-1 min-w-[100px] z-10">
                    <button
                      type="button"
                      onClick={() => {
                        setModalType("student");
                        setIsDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 transition-colors ${
                        modalType === "student" ? "" : "text-gray-700"
                      }`}
                      style={
                        modalType === "student"
                          ? { backgroundColor: "#e6f7f9", color: "#036570" }
                          : {}
                      }
                    >
                      {t("modal.student")}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setModalType("lecturer");
                        setIsDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 transition-colors ${
                        modalType === "lecturer" ? "" : "text-gray-700"
                      }`}
                      style={
                        modalType === "lecturer"
                          ? { backgroundColor: "#e6f7f9", color: "#036570" }
                          : {}
                      }
                    >
                      {t("modal.lecturer")}
                    </button>
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>

          {fetchError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-md">
              <strong>Network Error:</strong> Failed to load data from the database. If using a mobile device, ensure your frontend is connected to your computer's IP address (e.g., <code>192.168.x.x</code>) instead of <code>localhost</code>.
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                {t("modal.lecturerName")}
              </label>
              <input
                type="text"
                name="nama_dosen"
                value={formData.nama_dosen}
                onChange={handleInputChange}
                placeholder={t("modal.lecturerNamePlaceholder")}
                className="w-full px-3 py-2.5 text-base md:text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                {t("modal.lecturerNip")}
              </label>
              <input
                type="text"
                name="nip_dosen"
                value={formData.nip_dosen}
                onChange={handleInputChange}
                placeholder={t("modal.lecturerNipPlaceholder")}
                className="w-full px-3 py-2.5 text-base md:text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                {t("modal.prodi")}
              </label>
              <SearchableSelect
              options={programStudies.map((ps) => ({ value: ps.nama_prodi, label: ps.nama_prodi }))}
                value={formData.nama_prodi}
                onChange={(val) => setFormData((prev) => ({ ...prev, nama_prodi: val }))}
                placeholder={t("modal.prodiPlaceholder")}
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                {t("modal.course")}
              </label>
              <SearchableSelect
                options={mataKuliah.map((mk) => ({ value: mk.nama_kelas, label: mk.nama_kelas }))}
                value={formData.kelas}
                onChange={(val) => setFormData((prev) => ({ ...prev, kelas: val }))}
                placeholder={t("modal.coursePlaceholder")}
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                {t("modal.borrowedItem")}
              </label>
              <SearchableSelect
                options={availableItems
                  .filter((item) => !selectedItems.some((si) => si.id_barang === item.id_barang))
                  .map((item) => ({
                    value: item.id_barang,
                    label: `${item.tipe_nama_barang} - ${item.brand} ${item.model} (SN: ${item.serial_number})`
                  }))}
                value=""
                onChange={(val) => {
                  const item = availableItems.find((i) => i.id_barang === val);
                  if (item) setSelectedItems([...selectedItems, item]);
                }}
                placeholder={t("modal.borrowedItemPlaceholder")}
                required={selectedItems.length === 0}
              />
              {selectedItems.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {selectedItems.map((item) => (
                    <div key={item.id_barang} className="flex items-center bg-blue-50 text-blue-700 px-3 py-1.5 rounded-md text-sm border border-blue-200">
                      <span className="truncate max-w-[200px]">{item.tipe_nama_barang} - {item.brand}</span>
                      <button
                        type="button"
                        onClick={() => setSelectedItems(prev => prev.filter(i => i.id_barang !== item.id_barang))}
                        className="ml-2 text-blue-400 hover:text-blue-600 font-bold"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                {t("modal.scheduleStart")}
              </label>
              <SearchableSelect
                options={schedules.map((schedule) => ({
                  value: schedule.id_jadwal,
                  label: `${schedule.hari_dalam_seminggu} ${schedule.waktu_mulai}-${schedule.waktu_berakhir} | ${schedule.nama_kelas} | ${schedule.nama_dosen}`
                }))}
                value={formData.jadwal_id}
                onChange={handleScheduleSelect}
                placeholder={t("modal.schedulePlaceholder")}
                required
              />
            </div>

            {selectedSchedule && (
              <div className="bg-blue-50 p-3 rounded-md">
                <p className="text-sm text-blue-800">
                  <strong>{t("modal.scheduleDetail")}</strong>
                  <br />
                  {t("modal.detailLecturer")} {selectedSchedule.nama_dosen}
                  <br />
                  {t("modal.detailStart")} {selectedSchedule.waktu_mulai}
                  <br />
                  {t("modal.detailEnd")} {selectedSchedule.waktu_berakhir}
                </p>
              </div>
            )}

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                {t("modal.returnTime")}
              </label>
              <input
                type="datetime-local"
                name="waktu_pengembalian_dijanjikan"
                value={formData.waktu_pengembalian_dijanjikan}
                onChange={handleInputChange}
                className="w-full px-3 py-2.5 text-base md:text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                required
              />
            </div>

            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:flex-1 py-2.5 px-4 bg-white text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors font-medium"
              >
                {t("modal.cancel")}
              </button>
              <button
                type="submit"
                className="w-full sm:flex-1 py-2.5 px-4 text-white rounded-md hover:opacity-90 transition-all font-medium"
                style={{ backgroundColor: "#048494" }}
              >
                {t("modal.submitBorrow")}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LectureLendModal;