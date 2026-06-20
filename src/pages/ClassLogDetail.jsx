//Class log in  detail
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { classAPI } from "../utils/api";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import { useTranslation } from "./components/TranslationContext.jsx";

const ClassLogDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // state for class data and borrowers
  const [classData, setClassData] = useState(null);
  const [borrowers, setBorrowers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { t } = useTranslation();

  useEffect(() => {
    const fetchClassDetails = async () => {
      if (!id) return;

      try {
        setLoading(true);
        setError(null);
        const response = await classAPI.getClassDetails(id);
        const data = response.data;

        // Debug: log the data structure
        console.log("API Response:", data);
        console.log("Borrowers data:", data.borrowers);
        console.log("Statistics:", data.statistics);

        // set class data from class_info
        const classInfo = data.class_info;
        const stats = data.statistics;

        // Ensure statistics are numbers, not arrays or objects
        const totalBorrowers = Array.isArray(stats.total_borrowers)
          ? stats.total_borrowers.length
          : typeof stats.total_borrowers === "object" &&
            stats.total_borrowers !== null
          ? Object.keys(stats.total_borrowers).length
          : Number(stats.total_borrowers) || 0;

        const activeBorrowers = Array.isArray(stats.active_borrowers)
          ? stats.active_borrowers.length
          : typeof stats.active_borrowers === "object" &&
            stats.active_borrowers !== null
          ? Object.keys(stats.active_borrowers).length
          : Number(stats.active_borrowers) || 0;

        const completedBorrowers = Array.isArray(stats.completed_borrowers)
          ? stats.completed_borrowers.length
          : typeof stats.completed_borrowers === "object" &&
            stats.completed_borrowers !== null
          ? Object.keys(stats.completed_borrowers).length
          : Number(stats.completed_borrowers) || 0;

        console.log("Processed stats:", {
          totalBorrowers,
          activeBorrowers,
          completedBorrowers,
        });

        setClassData({
          id: id,
          name: classInfo.nama_prodi || classInfo.kepanjangan_prodi,
          lecturer: classInfo.lecturers,
          room: classInfo.rooms,
          schedule: classInfo.schedules,
          totalBorrowers: totalBorrowers,
          activeBorrowers: activeBorrowers,
          completedBorrowers: completedBorrowers,
        });

        // Process borrowers to ensure all fields are strings
        const processedBorrowers = (data.borrowers || []).map((borrower) => {
          console.log("Processing borrower:", borrower);
          return {
            student_name: borrower.student_name || t("classDetail.table.unknown"),
            nim: borrower.nim || t("classDetail.table.na"),
            number_of_times_borrowing: Number(borrower.number_of_times_borrowing) || 0,
            returned_items: borrower.returned_items || t("classDetail.table.noReturnedItems"),
            unreturned_items: borrower.unreturned_items || t("classDetail.table.noActiveItems"),
            borrower_type: borrower.borrower_type || "inactive_borrower",
            last_borrow_time: borrower.last_borrow_time,
            active_loans: Number(borrower.active_loans) || 0,
          };
        });

        console.log("Processed borrowers:", processedBorrowers);
        setBorrowers(processedBorrowers);
      } catch (error) {
        console.error("Error fetching class details:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchClassDetails();
  }, [id]);
  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header searchPlaceholder={t("classDetail.search")} />
          <div className="flex-1 overflow-y-auto">
            <div className="p-6 flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">{t("classDetail.loading")}</p>
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
          <Header searchPlaceholder={t("classDetail.search")} />
          <div className="flex-1 overflow-y-auto">
            <div className="p-6 flex items-center justify-center h-64">
              <div className="text-center">
                <p className="mt-4 text-gray-600">
                  {t("classDetail.error")}
                </p>
                <p className="text-gray-600 text-sm mt-1">{error}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!classData) {
    return (
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header searchPlaceholder={t("classDetail.search")} />
          <div className="flex-1 overflow-y-auto">
            <div className="p-6 flex items-center justify-center h-64">
              <div className="text-center">
                <p className="mt-4 text-gray-600">{t("classDetail.noData")}</p>
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
        <Header searchPlaceholder={t("classDetail.search")} />
        <div className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">
            {/* class info header */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-2xl font-semibold text-gray-900">
                  {classData.name}
                </h1>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => navigate("/class-log")}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md "
                >
                  {t("classDetail.back")}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <div className="text-sm text-gray-500">{t("classDetail.info.lecturer")}</div>
                <div className="font-medium text-gray-900">
                  {String(classData.lecturer || t("classDetail.table.na"))}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-500">{t("classDetail.info.room")}</div>
                <div className="font-medium text-gray-900">
                  {String(classData.room || t("classDetail.table.na"))}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-500">{t("classDetail.info.schedule")}</div>
                <div className="font-medium text-gray-900">
                  {String(classData.schedule || t("classDetail.table.na"))}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-500">{t("classDetail.info.totalBorrower")}</div>
                <div className="font-medium text-gray-900">
                  {String(classData.totalBorrowers || 0)}
                </div>
              </div>
            </div>
          </div>

          {/* statistics card */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg"></div>
                <div className="ml-4">
                  <div className="text-sm text-gray-500">{t("classDetail.stats.active")}</div>
                  <div className="text-2xl font-bold text-gray-900">
                    {String(classData.activeBorrowers || 0)}
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg"></div>
                <div className="ml-4">
                  <div className="text-sm text-gray-500">{t("classDetail.stats.completed")}</div>
                  <div className="text-2xl font-bold text-gray-900">
                    {String(classData.completedBorrowers || 0)}
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg"></div>
                <div className="ml-4">
                  <div className="text-sm text-gray-500">{t("classDetail.stats.totalItems")}</div>
                  <div className="text-2xl font-bold text-gray-900">
                    {String(classData.totalBorrowers || 0)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* borrowers table */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2>{t("classDetail.table.title")}</h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t("classDetail.table.student")}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t("classDetail.table.nim")}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t("classDetail.table.item")}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t("classDetail.table.status")}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t("classDetail.table.lastBorrow")}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t("classDetail.table.borrowCount")}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {borrowers.length > 0 ? (
                    borrowers.map((borrower, index) => {
                      // Debug: log each borrower during render
                      console.log("Rendering borrower:", borrower);

                      return (
                        <tr
                          key={borrower.nim || index}
                          className="hover:bg-gray-50"
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {String(borrower.student_name || t("classDetail.table.unknown"))}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {String(borrower.nim || t("classDetail.table.na"))}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 max-w-xs truncate">
                            {borrower.unreturned_items &&
                            borrower.unreturned_items !== t("classDetail.table.noActiveItems")
                              ? String(borrower.unreturned_items)
                              : borrower.returned_items &&
                                borrower.returned_items !== t("classDetail.table.noReturnedItems")
                              ? String(borrower.returned_items)
                              : t("classDetail.table.noItems")}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <span
                              className={`font-medium ${
                                String(borrower.borrower_type) ===
                                "active_borrower"
                                  ? "text-green-600"
                                  : "text-gray-600"
                              }`}
                            >
                              {String(borrower.borrower_type) ===
                              "active_borrower"
                                ? t("classDetail.status.active")
                                : t("classDetail.status.inactive")}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {borrower.last_borrow_time
                              ? new Date(
                                  borrower.last_borrow_time
                                ).toLocaleString("id-ID", {
                                  day: "2-digit",
                                  month: "2-digit",
                                  year: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })
                              : t("classDetail.table.na")}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {String(borrower.number_of_times_borrowing || 0)} {t("classDetail.times")}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-6 py-8 text-center text-gray-500"
                      >
                        {t("classDetail.table.noBorrowers")}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default ClassLogDetail;