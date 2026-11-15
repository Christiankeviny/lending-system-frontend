import { useState, useEffect } from "react";
import { dropdownAPI, inventoryAPI, borrowAPI } from "../../utils/api.mjs";
import { useTranslation } from "./TranslationContext.jsx";
import SearchableSelect from "./SearchableSelect.jsx";
import { auth } from "../../utils/firebase.mjs";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, sendEmailVerification } from "firebase/auth";

const StudentLendModal = ({
  isOpen,
  onClose,
  onSubmit,
  borrowerData,
  modalType,
  setModalType,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [lecturers, setLecturers] = useState([]);
  const [mataKuliah, setMataKuliah] = useState([]);
  const [programStudies, setProgramStudies] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [availableItems, setAvailableItems] = useState([]);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [fetchError, setFetchError] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [isSignUpOpen, setIsSignUpOpen] = useState(false);
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [signUpStep, setSignUpStep] = useState("form");
  const [signUpData, setSignUpData] = useState({
    nama_mahasiswa: "",
    nim_mahasiswa: "",
    nama_prodi: "",
    email: "",
  });

  const handleSignUpSubmit = async (e) => {
    e.preventDefault();

    if (!signUpData.email.endsWith("@mhsw.pnj.ac.id")) {
      alert("Gunakan email kampus mahasiswa PNJ (@mhsw.pnj.ac.id)");
      return;
    }

    try {
      setIsSigningUp(true);
      const tempPassword = `PNJ_verify_${signUpData.nim_mahasiswa}_2026!`;

      let userCredential;
      try {
        userCredential = await createUserWithEmailAndPassword(auth, signUpData.email, tempPassword);
      } catch (firebaseError) {
        if (firebaseError.code === "auth/email-already-in-use") {
          userCredential = await signInWithEmailAndPassword(auth, signUpData.email, tempPassword);
        } else {
          throw firebaseError;
        }
      }

      const user = userCredential.user;

      if (user.emailVerified) {
        const idToken = await user.getIdToken();
        await borrowAPI.signUpStudent({ ...signUpData, firebaseToken: idToken });
        alert("Mahasiswa berhasil didaftarkan!");
        handleCloseSignUp();
      } else {
        await sendEmailVerification(user);
        setSignUpStep("verify");
      }
    } catch (error) {
      let msg = error.message;
      if (error.code === "auth/invalid-email") msg = "Format email tidak valid";
      if (error.code === "auth/weak-password") msg = "Password terlalu lemah";
      if (error.code === "auth/invalid-credential") msg = "Email sudah terdaftar di Firebase dengan data berbeda. Hubungi admin.";
      alert("Gagal mendaftar: " + msg);
    } finally {
      setIsSigningUp(false);
    }
  };

  const handleVerifyConfirm = async () => {
    try {
      setIsSigningUp(true);
      await auth.currentUser.reload();

      if (auth.currentUser.emailVerified) {
        const idToken = await auth.currentUser.getIdToken(true);
        await borrowAPI.signUpStudent({ ...signUpData, firebaseToken: idToken });
        alert("Email terverifikasi! Mahasiswa berhasil didaftarkan.");
        handleCloseSignUp();
      } else {
        alert("Email belum diverifikasi. Silakan cek email Anda dan klik link verifikasi terlebih dahulu.");
      }
    } catch (error) {
      alert("Gagal: " + error.message);
    } finally {
      setIsSigningUp(false);
    }
  };

  const handleResendVerification = async () => {
    try {
      if (auth.currentUser) {
        await sendEmailVerification(auth.currentUser);
        alert("Email verifikasi telah dikirim ulang!");
      }
    } catch (error) {
      alert("Gagal mengirim ulang: " + error.message);
    }
  };

  const handleCloseSignUp = () => {
    setIsSignUpOpen(false);
    setSignUpStep("form");
    setSignUpData({ nama_mahasiswa: "", nim_mahasiswa: "", nama_prodi: "", email: "" });
  };

  const { t } = useTranslation();

  const [formData, setFormData] = useState({
    nama_mahasiswa: borrowerData?.nama_mahasiswa || "",
    nim_mahasiswa: borrowerData?.nim_mahasiswa || "",
    nama_dosen: "",
    kelas: "",
    nama_prodi: "",
    nama_ruangan: "",
    jadwal_id: "",
    waktu_pengembalian_dijanjikan: "",
  });

  // Load dropdown data
  useEffect(() => {
    const loadDropdownData = async () => {
      try {
        setFetchError(false);
        const [
          lecturersResponse,
          classesResponse,
          programStudiesResponse,
          roomResponse,
          schedulesResponse,
          availableItemsResponse,
        ] = await Promise.all([
          dropdownAPI.getLecturers(),
          dropdownAPI.getClasses(),
          dropdownAPI.getProgramStudies(),
          dropdownAPI.getRooms(),
          dropdownAPI.getActive(),
          inventoryAPI.getAvailable(),
        ]);

        setLecturers(lecturersResponse.data || []);
        setMataKuliah(classesResponse.data || []);
        setProgramStudies(programStudiesResponse.data || []);
        setRooms(roomResponse.data || []);
        console.log(rooms)
        setSchedules(schedulesResponse.data || []);
        setAvailableItems(availableItemsResponse.data || []);
      } catch (error) {
        console.error("Error loading dropdown data:", error);
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
                    className={`w-4 h-4 transition-transform ${isDropdownOpen ? "rotate-180" : ""
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
                      className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 transition-colors ${modalType === "student" ? "" : "text-gray-700"
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
                      className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 transition-colors ${modalType === "lecturer" ? "" : "text-gray-700"
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
                {t("modal.studentName")}
              </label>
              <input
                type="text"
                name="nama_mahasiswa"
                value={formData.nama_mahasiswa}
                onChange={handleInputChange}
                placeholder={t("modal.studentNamePlaceholder")}
                className="w-full px-3 py-2.5 text-base md:text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                {t("modal.studentNim")}
              </label>
              <input
                type="text"
                name="nim_mahasiswa"
                value={formData.nim_mahasiswa}
                onChange={handleInputChange}
                placeholder={t("modal.studentNimPlaceholder")}
                className="w-full px-3 py-2.5 text-base md:text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                {t("modal.lecturerName")}
              </label>
              <SearchableSelect
                options={lecturers.map((lecturer) => ({ value: lecturer.nama_dosen, label: lecturer.nama_dosen }))}
                value={formData.nama_dosen}
                onChange={(val) => setFormData((prev) => ({ ...prev, nama_dosen: val }))}
                placeholder={t("modal.lecturerNamePlaceholder")}
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
                {t("modal.className")}
              </label>
              <SearchableSelect
              options={programStudies.map((ps) => ({ value: ps.nama_prodi, label: ps.nama_prodi }))}
                value={formData.nama_prodi}
                onChange={(val) => setFormData((prev) => ({ ...prev, nama_prodi: val }))}
                placeholder={t("modal.classPlaceholder")}
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                {t("modal.roomName")}
              </label>
              <SearchableSelect
                options={rooms.map((rm) => ({ value: rm.nomor_ruangan, label: rm.nomor_ruangan }))}
                value={formData.nama_ruangan}
                onChange={(val) => setFormData((prev) => ({ ...prev, nama_ruangan: val }))}
                placeholder={t("modal.roomPlaceholder")}
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
            
            <div className="text-center pt-3 border-t mt-4 border-gray-200">
              <button
                type="button"
                onClick={() => setIsSignUpOpen(true)}
                className="text-sm font-medium transition-colors hover:opacity-80"
                style={{ color: "#048494" }}
              >
                Belum terdaftar? Daftar disini
              </button>
            </div>

          </form>
        </div>
      </div>

      {isSignUpOpen && (
        <div className="fixed inset-0 bg-black/75 flex items-center justify-center p-4 z-[60]">
          <div className="bg-white rounded-lg w-full max-w-md p-6 relative shadow-xl">
            <button
              onClick={handleCloseSignUp}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {signUpStep === "form" ? (
              <>
                <h3 className="text-lg font-semibold mb-4" style={{ color: "#036570" }}>Daftar Mahasiswa Baru</h3>
                <form onSubmit={handleSignUpSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">NIM</label>
                    <input
                      type="number"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:border-transparent"
                      style={{ '--tw-ring-color': '#048494' }}
                      value={signUpData.nim_mahasiswa}
                      onChange={(e) => setSignUpData({...signUpData, nim_mahasiswa: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nama Mahasiswa</label>
                    <input
                      type="text"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:border-transparent"
                      style={{ '--tw-ring-color': '#048494' }}
                      value={signUpData.nama_mahasiswa}
                      onChange={(e) => setSignUpData({...signUpData, nama_mahasiswa: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Program Studi</label>
                    <input
                      type="text"
                      placeholder="BM2B atau TT22B"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:border-transparent"
                      style={{ '--tw-ring-color': '#048494' }}
                      value={signUpData.nama_prodi}
                      onChange={(e) => setSignUpData({...signUpData, nama_prodi: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Kampus</label>
                    <input
                      type="email"
                      required
                      placeholder="nama@mhsw.pnj.ac.id"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:border-transparent"
                      style={{ '--tw-ring-color': '#048494' }}
                      value={signUpData.email}
                      onChange={(e) => setSignUpData({...signUpData, email: e.target.value})}
                    />
                    <p className="text-xs text-gray-500 mt-1">Gunakan email kampus mahasiswa PNJ (@mhsw.pnj.ac.id)</p>
                  </div>
                  <button
                    type="submit"
                    disabled={isSigningUp}
                    className="w-full py-2.5 px-4 text-white rounded-md hover:opacity-90 transition-all font-medium disabled:opacity-50 mt-2"
                    style={{ backgroundColor: "#048494" }}
                  >
                    {isSigningUp ? "Mengirim Verifikasi..." : "Daftar"}
                  </button>
                </form>
              </>
            ) : (
              <div className="text-center py-4">
                <div className="mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: "#e6f7f9" }}>
                  <svg className="w-8 h-8" style={{ color: "#048494" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-2" style={{ color: "#036570" }}>Cek Email Anda</h3>
                <p className="text-sm text-gray-600 mb-1">Link verifikasi telah dikirim ke:</p>
                <p className="text-sm font-semibold text-gray-800 mb-4">{signUpData.email}</p>
                <p className="text-xs text-gray-500 mb-6">Buka email Anda dan klik link verifikasi dari Firebase. Setelah itu, kembali ke sini dan klik tombol di bawah.</p>
                <button
                  onClick={handleVerifyConfirm}
                  disabled={isSigningUp}
                  className="w-full py-2.5 px-4 text-white rounded-md hover:opacity-90 transition-all font-medium disabled:opacity-50"
                  style={{ backgroundColor: "#048494" }}
                >
                  {isSigningUp ? "Memeriksa..." : "Saya Sudah Verifikasi Email"}
                </button>
                <button
                  onClick={handleResendVerification}
                  className="w-full py-2 px-4 text-sm font-medium mt-3 transition-colors hover:opacity-80"
                  style={{ color: "#048494" }}
                >
                  Kirim Ulang Email Verifikasi
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentLendModal;