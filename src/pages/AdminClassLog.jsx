//Classlog overview
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { dashboardAPI } from "../utils/api.mjs";
import Header from "./components/Header.jsx";
import Sidebar from "./components/Sidebar.jsx";
import { useTranslation } from "./components/TranslationContext.jsx";

const AdminClassLog = () => {
  const navigate = useNavigate();

  // Class data state
  const [classData, setClassData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;

  // Statistics state
  const [statistics, setStatistics] = useState({
    totalClasses: 0,
    totalStudents: 0,
    totalActiveLoans: 0,
    activeClasses: 0,
  });

  // Modal state for Excel import
  const [showImportModal, setShowImportModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState("BMM");
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);

  const { t } = useTranslation();

  // Fetch class data
  useEffect(() => {
    fetchClassData();
  }, [currentPage]);

  // Fetch statistics data (only once on mount)
  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchClassData = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await dashboardAPI.getClassesTable(
        currentPage,
        itemsPerPage
      );
      if (data.success) {
        setClassData(data.data || []);
        setTotalPages(data.pagination?.total_pages || 1);
      } else {
        throw new Error(data.message || "Failed to load class data");
      }
    } catch (error) {
      console.error("Error fetching class data:", error);
      setError(error.message || "Failed to load class data");
    } finally {
      setLoading(false);
    }
  };

  // Fetch statistics data
  const fetchStatistics = async () => {
    try {
      const data = await dashboardAPI.getClassesOverview();
      if (data.success) {
        setStatistics({
          totalClasses: data.data.total_classes || 0,
          totalStudents: data.data.total_students || 0,
          totalActiveLoans: data.data.active_loans || 0,
          activeClasses: data.data.active_classes || 0,
        });
      } else {
        console.error("Failed to load statistics");
      }
    } catch (error) {
      console.error("Error fetching statistics:", error);
    }
  };

  const getStatusColor = (status) => {
    return status === "active" ? "text-green-600" : "text-gray-500";
  };

  const handleClassClick = (className) => {
    navigate(`/class-log/${className}`);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleImportSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      alert(t("classLog.alert.noFile"));
      return;
    }

    setImporting(true);
    try {
      const formData = new FormData();
      formData.append("excelFile", selectedFile);
      formData.append("templateType", selectedTemplate);

      const result = await dashboardAPI.importMahasiswa(formData);
      if (result.success) {
        setImportResult(result.data);
        alert(
          `${t("classLog.alert.importSuccess1")}${result.data.successful_imports}${t("classLog.alert.importSuccess2")}${result.data.failed_imports}${t("classLog.alert.importSuccess3")}`
        );
        setShowImportModal(false);
        setSelectedFile(null);
        // Refresh the class data
        fetchClassData();
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error("Error importing Excel file:", error);
      alert(t("classLog.alert.importFailed") + error.message);
    } finally {
      setImporting(false);
    }
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  if (loading && classData.length === 0) {
    return (
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header searchPlaceholder={t("classLog.search")} />
          <div className="flex-1 overflow-y-auto">
            <div className="p-6 flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">{t("classLog.loading")}</p>
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
          <Header searchPlaceholder={t("classLog.search")} />
          <div className="flex-1 overflow-y-auto">
            <div className="p-6 flex items-center justify-center h-64">
              <div className="text-center">
                <div className="text-red-500 mb-4">
                  <svg
                    className="w-12 h-12 mx-auto"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <p className="text-gray-900 font-medium">
                  {t("classLog.error")}
                </p>
                <p className="text-gray-600 text-sm mt-1">{error}</p>
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
        <Header searchPlaceholder={t("classLog.search")} />
        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-semibold text-gray-900">
                {t("classLog.title")}
              </h1>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setShowImportModal(true)}
                  className="px-4 py-2 text-white rounded-md hover:opacity-90 transition-all font-medium"
                  style={{ backgroundColor: "#048494" }}
                >
                  {t("classLog.importExcelBtn")}
                </button>
              </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-100 rounded-md flex items-center justify-center">
                      <svg
                        className="w-5 h-5 text-blue-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-6m-6 0H3m2-2h12a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">
                      {t("classLog.stats.totalClasses")}
                    </p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {statistics.totalClasses}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-green-100 rounded-md flex items-center justify-center">
                      <svg
                        className="w-5 h-5 text-green-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                        />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">
                      {t("classLog.stats.totalStudents")}
                    </p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {statistics.totalStudents}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-orange-100 rounded-md flex items-center justify-center">
                      <svg
                        className="w-5 h-5 text-orange-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                        />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">
                      {t("classLog.stats.activeLoans")}
                    </p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {statistics.totalActiveLoans}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-teal-100 rounded-md flex items-center justify-center">
                      <svg
                        className="w-5 h-5 text-teal-600"
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
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">
                      {t("classLog.stats.activeClasses")}
                    </p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {statistics.activeClasses}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Class Table */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t("classLog.table.className")}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t("classLog.table.students")}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t("classLog.table.activeLoans")}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t("classLog.table.status")}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {classData.length > 0 ? (
                      classData.map((item, index) => (
                        <tr
                          key={index}
                          className="hover:bg-gray-50 cursor-pointer"
                          onClick={() => handleClassClick(item.class_name)}
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                            {item.class_name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {item.total_students_per_kelas}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {item.active_loans_per_kelas}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <span
                              className={`font-medium ${getStatusColor(
                                item.status
                              )}`}
                            >
                              {item.status === "active" ? t("classLog.status.active") : t("classLog.status.inactive")}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan="4"
                          className="px-6 py-8 text-center text-gray-500"
                        >
                          {t("classLog.table.noData")}
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
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`hover:text-gray-700 ${
                    currentPage === totalPages
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                >
                  {t("pagination.next")}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal for Excel import */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black/75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">
                  {t("classLog.modal.title")}
                </h2>
                <button
                  onClick={() => {
                    setShowImportModal(false);
                    setSelectedFile(null);
                    setSelectedTemplate("BMM");
                    setImportResult(null);
                  }}
                  className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleImportSubmit} className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    {t("classLog.modal.selectFile")}
                  </label>
                  <input
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={handleFileSelect}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {t("classLog.modal.formatHint")}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    {t("classLog.modal.selectTemplate")}
                  </label>
                  <select
                    value={selectedTemplate}
                    onChange={(e) => setSelectedTemplate(e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="BMM">
                      {t("classLog.modal.templateBMM")}
                    </option>
                    <option value="TL">{t("classLog.modal.templateTL")}</option>
                    <option value="TOLI">
                      {t("classLog.modal.templateTOLI")}
                    </option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    {t("classLog.modal.templateHint")}
                  </p>
                </div>

                {selectedFile && (
                  <div className="bg-blue-50 p-3 rounded-md">
                    <p className="text-sm text-blue-800">
                      {t("classLog.modal.fileSelected")} <strong>{selectedFile.name}</strong>
                    </p>
                  </div>
                )}

                {importResult && (
                  <div className="bg-green-50 p-3 rounded-md">
                    <p className="text-sm text-green-800">
                      <strong>{t("classLog.modal.importResult")}</strong>
                      <br />
                      {t("classLog.modal.successCount")} {importResult.successful_imports}
                      <br />
                      {t("classLog.modal.failedCount")} {importResult.failed_imports}
                    </p>
                    {importResult.errors && importResult.errors.length > 0 && (
                      <div className="mt-2">
                        <p className="text-sm font-medium text-red-800">
                          {t("classLog.modal.errorDetails")}
                        </p>
                        <ul className="text-xs text-red-700 list-disc list-inside">
                          {importResult.errors
                            .slice(0, 5)
                            .map((error, index) => (
                              <li key={index}>
                                {error.nim}: {error.error}
                              </li>
                            ))}
                          {importResult.errors.length > 5 && (
                            <li>
                              {t("classLog.modal.and")}{importResult.errors.length - 5}{t("classLog.modal.otherErrors")}
                            </li>
                          )}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowImportModal(false);
                      setSelectedFile(null);
                      setSelectedTemplate("BMM");
                      setImportResult(null);
                    }}
                    className="w-full sm:flex-1 py-2.5 px-4 bg-white text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors font-medium"
                    disabled={importing}
                  >
                    {t("classLog.modal.cancel")}
                  </button>
                  <button
                    type="submit"
                    className="w-full sm:flex-1 py-2.5 px-4 text-white rounded-md hover:opacity-90 transition-all font-medium"
                    style={{ backgroundColor: "#048494" }}
                    disabled={importing || !selectedFile}
                  >
                    {importing ? t("classLog.modal.importing") : t("classLog.modal.importBtn")}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      
    </div>
  );
};

export default AdminClassLog;