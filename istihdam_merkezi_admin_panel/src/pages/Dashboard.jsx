import { useState, useEffect } from "react";
import MainLayout from "../components/layout/MainLayout";
import { SkeletonStatCard } from "../components/ui/Skeleton";
import { Link } from "react-router-dom";
import {
  BuildingOfficeIcon,
  UserIcon,
  BriefcaseIcon,
  ChartBarIcon,
  ClockIcon,
  EnvelopeIcon,
} from "@heroicons/react/24/outline";
import {
  getBasicStats,
  getUserStats,
  getJobPostStats,
  getTimeBasedStats,
} from "../api/dashboardService";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";

const COLORS = [
  "#3B82F6",
  "#10B981",
  "#F59E0B",
  "#EF4444",
  "#8B5CF6",
  "#EC4899",
];

const QUICK_ACTIONS = [
  {
    id: "businesses",
    title: "İşletmeleri Yönet",
    description: "İşletmeleri görüntüle, onayla veya reddet",
    to: "/dashboard/businesses",
    icon: BuildingOfficeIcon,
    colorClasses:
      "border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20",
    iconWrapperClasses:
      "bg-blue-100 group-hover:bg-blue-500 dark:bg-blue-900/40",
    textColorClasses: "group-hover:text-blue-600",
  },
  {
    id: "users",
    title: "Kullanıcılar",
    description: "Kullanıcıları görüntüle ve yönet",
    to: "/dashboard/users",
    icon: UserIcon,
    colorClasses:
      "border-green-500 hover:bg-green-50 dark:hover:bg-green-900/20",
    iconWrapperClasses:
      "bg-green-100 group-hover:bg-green-500 dark:bg-green-900/40",
    textColorClasses: "group-hover:text-green-600",
  },
  {
    id: "job-posts",
    title: "İş İlanlarını Yönet",
    description: "İş ilanlarını incele, onayla veya reddet",
    to: "/dashboard/job-posts",
    icon: BriefcaseIcon,
    colorClasses:
      "border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20",
    iconWrapperClasses:
      "bg-purple-100 group-hover:bg-purple-500 dark:bg-purple-900/40",
    textColorClasses: "group-hover:text-purple-600",
  },
  {
    id: "contacts",
    title: "İletişim Mesajları",
    description: "Gelen iletişim formlarını görüntüle ve yanıtla",
    to: "/dashboard/contacts",
    icon: EnvelopeIcon,
    colorClasses:
      "border-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20",
    iconWrapperClasses:
      "bg-amber-100 group-hover:bg-amber-500 dark:bg-amber-900/40",
    textColorClasses: "group-hover:text-amber-600",
  },
];

const Dashboard = () => {
  const [basicStats, setBasicStats] = useState(null);
  const [userStats, setUserStats] = useState(null);
  const [jobPostStats, setJobPostStats] = useState(null);
  const [timeBasedStats, setTimeBasedStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timePeriod, setTimePeriod] = useState("day");
  const [showDetailedCharts, setShowDetailedCharts] = useState(true);

  useEffect(() => {
    fetchAllStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (timePeriod) {
      fetchTimeBasedStats();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timePeriod]);

  const fetchAllStats = async () => {
    try {
      setLoading(true);
      const [basic, users, jobPosts, timeBased] = await Promise.all([
        getBasicStats().catch(() => ({ success: false, data: null })),
        getUserStats().catch(() => ({ success: false, data: null })),
        getJobPostStats().catch(() => ({ success: false, data: null })),
        getTimeBasedStats(timePeriod).catch(() => ({
          success: false,
          data: null,
        })),
      ]);

      if (basic.success) setBasicStats(basic.data);
      if (users.success) setUserStats(users.data);
      if (jobPosts.success) setJobPostStats(jobPosts.data);
      if (timeBased.success) setTimeBasedStats(timeBased.data);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTimeBasedStats = async () => {
    try {
      const response = await getTimeBasedStats(timePeriod);
      if (response.success) {
        setTimeBasedStats(response.data);
      }
    } catch (error) {
      console.error("Error fetching time-based stats:", error);
    }
  };

  const statCards = basicStats
    ? [
        {
          name: "Toplam İşletme",
          value: basicStats.businesses?.total || 0,
          subtitle: `${basicStats.businesses?.approved || 0} onaylandı`,
          icon: BuildingOfficeIcon,
          color: "bg-blue-500",
          link: "/dashboard/businesses",
        },
        {
          name: "Toplam Kullanıcı",
          value: basicStats.users?.total || 0,
          subtitle: `${basicStats.users?.approved || 0} onaylandı`,
          icon: UserIcon,
          color: "bg-green-500",
          link: "/dashboard/users",
        },
        {
          name: "Toplam Başvuru",
          value: basicStats.applications?.total || 0,
          subtitle: `${basicStats.applications?.pending || 0} bekliyor`,
          icon: BriefcaseIcon,
          color: "bg-purple-500",
          link: "/dashboard/job-posts",
        },
      ]
    : [];

  // Prepare profession distribution data
  const professionData =
    jobPostStats?.professionDistribution?.slice(0, 10).map((item) => ({
      name: item.profession,
      value: parseInt(item.count),
    })) || [];

  // Prepare monthly registrations data
  const monthlyRegistrationsData =
    userStats?.monthlyRegistrations?.map((item) => ({
      month: new Date(item.month).toLocaleDateString("tr-TR", {
        month: "short",
        year: "numeric",
      }),
      count: parseInt(item.count),
    })) || [];

  // Prepare monthly job posts data
  const monthlyJobPostsData =
    jobPostStats?.monthlyJobPosts?.map((item) => ({
      month: new Date(item.month).toLocaleDateString("tr-TR", {
        month: "short",
        year: "numeric",
      }),
      count: parseInt(item.count),
      approved: parseInt(item.approved || 0),
    })) || [];

  // Prepare time-based trend data
  const timeTrendData = timeBasedStats
    ? [
        {
          name:
            timeBasedStats.period === "day"
              ? "Gün"
              : timeBasedStats.period === "week"
              ? "Hafta"
              : "Ay",
          users: timeBasedStats.userTrend?.[0]?.count
            ? parseInt(timeBasedStats.userTrend[0].count)
            : 0,
          jobPosts: timeBasedStats.jobPostTrend?.[0]?.count
            ? parseInt(timeBasedStats.jobPostTrend[0].count)
            : 0,
          applications: timeBasedStats.applicationTrend?.[0]?.count
            ? parseInt(timeBasedStats.applicationTrend[0].count)
            : 0,
          businesses: timeBasedStats.businessTrend?.[0]?.count
            ? parseInt(timeBasedStats.businessTrend[0].count)
            : 0,
        },
      ]
    : [];

  return (
    <MainLayout>
      <div className="space-y-4">
        {/* Hızlı İşlemler - üst bölüm */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 border border-gray-100 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4 flex items-center">
            <div className="h-1 w-12 bg-gradient-to-r from-blue-600 to-blue-800 rounded-full mr-3"></div>
            Hızlı İşlemler
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {QUICK_ACTIONS.map((action) => {
              const Icon = action.icon;
              return (
                <Link
                  key={action.id}
                  to={action.to}
                  className={`group flex items-center p-5 border-2 rounded-xl transition-all duration-200 hover:shadow-md ${action.colorClasses}`}
                >
                  <div
                    className={`${action.iconWrapperClasses} p-3 rounded-lg transition-colors mr-4`}
                  >
                    <Icon className="w-6 h-6 text-blue-600 group-hover:text-white transition-colors" />
                  </div>
                  <div>
                    <p
                      className={`font-semibold text-gray-900 dark:text-white transition-colors ${action.textColorClasses}`}
                    >
                      {action.title}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {action.description}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Stats Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <SkeletonStatCard key={i} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {statCards.map((stat) => {
              const Icon = stat.icon;
              const CardContent = (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-3 hover:shadow-lg transition-all duration-300 border border-gray-100 dark:border-gray-700 hover:scale-[1.01] group">
                  <div className="flex items-center justify-between mb-4">
                    <div
                      className={`${stat.color} p-2.5 rounded-lg group-hover:scale-110 transition-transform`}
                    >
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-0.5">
                      {stat.name}
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white mb-0.5">
                      {stat.value}
                    </p>
                    {stat.subtitle && (
                      <p className="text-[11px] text-gray-400 dark:text-gray-400">
                        {stat.subtitle}
                      </p>
                    )}
                  </div>
                </div>
              );

              return stat.link !== "#" ? (
                <Link key={stat.name} to={stat.link} className="block">
                  {CardContent}
                </Link>
              ) : (
                <div key={stat.name}>{CardContent}</div>
              );
            })}
          </div>
        )}

        {/* Statistics Cards & Summary Section */}
        {!loading && (
          <>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              {/* User Statistics Cards */}
              {userStats && (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 border border-gray-100 dark:border-gray-700">
                  <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4 flex items-center">
                    <UserIcon className="w-5 h-5 mr-2 text-green-500" />
                    Kullanıcı İstatistikleri
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
                    {userStats.statusDistribution?.map((item, index) => (
                      <div
                        key={index}
                        className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl p-3 border border-green-200 dark:border-green-700"
                      >
                        <p className="text-xs font-medium text-green-700 dark:text-green-400 mb-1">
                          {item.isApproved ? "Onaylanmış" : "Beklemede"}
                        </p>
                        <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                          {item.count}
                        </p>
                      </div>
                    ))}
                    {userStats.genderDistribution?.map((item, index) => (
                      <div
                        key={index}
                        className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl p-3 border border-blue-200 dark:border-blue-700"
                      >
                        <p className="text-xs font-medium text-blue-700 dark:text-blue-400 mb-1">
                          {item.gender === "male"
                            ? "Erkek"
                            : item.gender === "female"
                            ? "Kadın"
                            : "Belirtilmemiş"}
                        </p>
                        <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                          {item.count}
                        </p>
                      </div>
                    ))}
                    {userStats.disabilityDistribution?.map((item, index) => (
                      <div
                        key={index}
                        className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl p-3 border border-purple-200 dark:border-purple-700"
                      >
                        <p className="text-xs font-medium text-purple-700 dark:text-purple-400 mb-1">
                          {item.isDisabledPerson == true ? "Engelli" : item.isDisabledPerson == false ? "Engelsiz" : "Engellilik Belirtilmemiş"}
                        </p>
                        <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                          {item.count}
                        </p>
                      </div>
                    ))}
                  </div>
                  {userStats.ageGroups && userStats.ageGroups.length > 0 && (
                    <div className="mt-2">
                      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                        Yaş Grupları
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {userStats.ageGroups.map((item, index) => (
                          <div
                            key={index}
                            className="bg-gray-50 dark:bg-gray-700 rounded-lg p-2 border border-gray-200 dark:border-gray-600"
                          >
                            <p className="text-[11px] font-medium text-gray-600 dark:text-gray-300 mb-1">
                              {item.age_group}
                            </p>
                            <p className="text-lg font-bold text-gray-900 dark:text-white">
                              {item.count}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Job Post Statistics Cards */}
              {jobPostStats && (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 border border-gray-100 dark:border-gray-700">
                  <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4 flex items-center">
                    <BriefcaseIcon className="w-5 h-5 mr-2 text-purple-500" />
                    İş İlanı İstatistikleri
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
                    {jobPostStats.statusDistribution?.map((item, index) => (
                      <div
                        key={index}
                        className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl p-3 border border-purple-200 dark:border-purple-700"
                      >
                        <p className="text-xs font-medium text-purple-700 dark:text-purple-400 mb-1">
                          {item.isApproved ? "Onaylanmış" : "Beklemede"}
                        </p>
                        <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                          {item.count}
                        </p>
                      </div>
                    ))}
                  </div>
                  {jobPostStats.professionDistribution &&
                    jobPostStats.professionDistribution.length > 0 && (
                      <div className="mt-2">
                        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                          En Çok İlan Verilen Meslekler (Top 5)
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
                          {jobPostStats.professionDistribution
                            .slice(0, 5)
                            .map((item, index) => (
                              <div
                                key={index}
                                className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-2 border border-orange-200 dark:border-orange-700"
                              >
                                <p
                                  className="text-[11px] font-medium text-orange-700 dark:text-orange-400 mb-1 truncate"
                                  title={item.profession}
                                >
                                  {item.profession}
                                </p>
                                <p className="text-lg font-bold text-orange-900 dark:text-orange-100">
                                  {item.count}
                                </p>
                              </div>
                            ))}
                        </div>
                      </div>
                    )}
                  {jobPostStats.workingMethodDistribution &&
                    jobPostStats.workingMethodDistribution.length > 0 && (
                      <div className="mt-2">
                        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                          Çalışma Şekli Dağılımı
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                          {jobPostStats.workingMethodDistribution.map(
                            (item, index) => (
                              <div
                                key={index}
                                className="bg-indigo-50 dark:bg-indigo-900/20 rounded-lg p-2 border border-indigo-200 dark:border-indigo-700"
                              >
                                <p className="text-[11px] font-medium text-indigo-700 dark:text-indigo-400 mb-1">
                                  {item.workingMethod}
                                </p>
                                <p className="text-lg font-bold text-indigo-900 dark:text-indigo-100">
                                  {item.count}
                                </p>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    )}
                </div>
              )}
            </div>

            {/* Charts Section - Detaylı grafikler, isteğe bağlı göster */}
            {(monthlyRegistrationsData.length > 0 ||
              monthlyJobPostsData.length > 0 ||
              professionData.length > 0 ||
              (timeBasedStats && timeTrendData.length > 0)) && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 border border-gray-100 dark:border-gray-700">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 flex items-center">
                    <ChartBarIcon className="w-5 h-5 mr-2 text-blue-500" />
                    Detaylı Grafikler
                  </h3>
                  <button
                    type="button"
                    onClick={() => setShowDetailedCharts((prev) => !prev)}
                    className="text-xs font-medium px-3 py-1 rounded-full border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    {showDetailedCharts
                      ? "Grafikleri Gizle"
                      : "Grafikleri Göster"}
                  </button>
                </div>

                {showDetailedCharts && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* Monthly Registrations Chart */}
                    {monthlyRegistrationsData.length > 0 && (
                      <div className="bg-white dark:bg-gray-800 rounded-xl shadow border border-gray-100 dark:border-gray-700 p-3">
                        <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-3 flex items-center">
                          <ClockIcon className="w-4 h-4 mr-2 text-teal-500" />
                          Aylık Kullanıcı Kayıtları
                        </h4>
                        <ResponsiveContainer width="100%" height={220}>
                          <LineChart
                            data={monthlyRegistrationsData}
                            role="img"
                            aria-label="Aylık kullanıcı kayıtları grafiği"
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                            <YAxis tick={{ fontSize: 11 }} />
                            <Tooltip />
                            <Legend />
                            <Line
                              type="monotone"
                              dataKey="count"
                              stroke="#10B981"
                              strokeWidth={2}
                              name="Kayıt Sayısı"
                              dot={{ r: 4, strokeWidth: 2 }}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    )}

                    {/* Monthly Job Posts Chart */}
                    {monthlyJobPostsData.length > 0 && (
                      <div className="bg-white dark:bg-gray-800 rounded-xl shadow border border-gray-100 dark:border-gray-700 p-3">
                        <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-3 flex items-center">
                          <ChartBarIcon className="w-4 h-4 mr-2 text-pink-500" />
                          Aylık İş İlanları
                        </h4>
                        <ResponsiveContainer width="100%" height={220}>
                          <BarChart
                            data={monthlyJobPostsData}
                            role="img"
                            aria-label="Aylık iş ilanları grafiği"
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                            <YAxis tick={{ fontSize: 11 }} />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="count" fill="#EC4899" name="Toplam" radius={[4, 4, 0, 0]} />
                            <Bar
                              dataKey="approved"
                              fill="#10B981"
                              name="Onaylanmış"
                              radius={[4, 4, 0, 0]}
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    )}

                    {/* Profession Distribution Chart */}
                    {professionData.length > 0 && (
                      <div className="bg-white dark:bg-gray-800 rounded-xl shadow border border-gray-100 dark:border-gray-700 p-3">
                        <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-3 flex items-center">
                          <ChartBarIcon className="w-4 h-4 mr-2 text-orange-500" />
                          Meslek Dağılımı (Top 10)
                        </h4>
                        <ResponsiveContainer width="100%" height={260}>
                          <BarChart
                            data={professionData}
                            margin={{ bottom: 60 }}
                            role="img"
                            aria-label="Meslek dağılımı grafiği"
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis
                              dataKey="name"
                              angle={-35}
                              textAnchor="end"
                              height={90}
                              interval={0}
                              tick={{ fontSize: 10 }}
                            />
                            <YAxis tick={{ fontSize: 11 }} />
                            <Tooltip />
                            <Bar dataKey="value" fill="#3B82F6" name="İlan Sayısı" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    )}

                    {/* Time-based Trends */}
                    {timeBasedStats && timeTrendData.length > 0 && (
                      <div className="bg-white dark:bg-gray-800 rounded-xl shadow border border-gray-100 dark:border-gray-700 p-3">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-100 flex items-center">
                            <ClockIcon className="w-4 h-4 mr-2 text-blue-500" />
                            Zaman Bazlı Trendler
                          </h4>
                          <div className="flex gap-1">
                            {["day", "week", "month"].map((period) => (
                              <button
                                key={period}
                                onClick={() => setTimePeriod(period)}
                                aria-pressed={timePeriod === period}
                                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-1 ${
                                  timePeriod === period
                                    ? "bg-blue-600 text-white"
                                    : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                                }`}
                              >
                                {period === "day"
                                  ? "Günlük"
                                  : period === "week"
                                  ? "Haftalık"
                                  : "Aylık"}
                              </button>
                            ))}
                          </div>
                        </div>
                        <ResponsiveContainer width="100%" height={220}>
                          <BarChart data={timeTrendData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar
                              dataKey="users"
                              fill="#10B981"
                              name="Kullanıcılar"
                            />
                            <Bar
                              dataKey="jobPosts"
                              fill="#3B82F6"
                              name="İş İlanları"
                            />
                            <Bar
                              dataKey="applications"
                              fill="#F59E0B"
                              name="Başvurular"
                            />
                            <Bar
                              dataKey="businesses"
                              fill="#EF4444"
                              name="İşletmeler"
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </MainLayout>
  );
};

export default Dashboard;
