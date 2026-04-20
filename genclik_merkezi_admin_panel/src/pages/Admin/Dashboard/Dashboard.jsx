import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { requestWithAuth } from "../../../helpers/requests";
import { formatDate } from "../../../helpers/formatDate";
import { store } from "../../../redux/app/store";
import axios from "axios";

const ApiEndpoint = `${import.meta.env.VITE_APP_API_URL}`;

function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalBooks: null,
    totalUsers: null,
    loanedCount: null,
  });
  const [recentClaims, setRecentClaims] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const fetchStats = async () => {
      try {
        const [booksRes, usersRes, claimsRes] = await Promise.all([
          axios.post(
            `${ApiEndpoint}/admin/get-books?page=1`,
            { name: "" },
            { headers: { Authorization: `Bearer ${token}` } },
          ),
          requestWithAuth("post", "/admin/get-users?page=", 1, store, {
            name: "",
          }),
          axios.post(
            `${ApiEndpoint}/admin/get-claims?page=1`,
            { name: "" },
            { headers: { Authorization: `Bearer ${token}` } },
          ),
        ]);

        const booksData = booksRes.data?.data;
        const usersData = usersRes?.data;
        const claimsData = claimsRes?.data?.data?.claims;

        setStats({
          totalBooks: booksData?.totalCount ?? booksData?.books?.length ?? 0,
          totalUsers: usersData?.totalCount ?? usersData?.users?.length ?? 0,
          loanedCount:
            claimsData?.result?.filter((c) => !c.isDelivered)?.length ?? 0,
        });

        if (claimsData?.result?.length) {
          setRecentClaims(claimsData.result.slice(0, 5));
        }
      } catch (e) {
        setStats({ totalBooks: 0, totalUsers: 0, loanedCount: 0 });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  useEffect(() => {
    const booksEl = document.getElementById("kpi-books");
    const loanedEl = document.getElementById("kpi-loaned");
    const usersEl = document.getElementById("kpi-users");
    if (booksEl)
      booksEl.textContent = loading ? "–" : (stats.totalBooks ?? "0");
    if (loanedEl)
      loanedEl.textContent = loading ? "–" : (stats.loanedCount ?? "0");
    if (usersEl)
      usersEl.textContent = loading ? "–" : (stats.totalUsers ?? "0");
  }, [stats, loading]);

  return (
    <div className="dashboard-page">
      <div className="dashboard-grid">
        {/* Kart 1: Kitaplar durumu */}
        <div className="card dashboard-card">
          <div className="card__header">
            <span className="card__title">Kitaplar durumu</span>
          </div>
          <div className="card__body">
            <div className="stat-ring">
              <div className="stat-ring__value">
                {loading ? "–" : stats.totalBooks}
              </div>
              <div className="stat-ring__label">Toplam kitap</div>
            </div>
            <div className="stat-row">
              <span className="stat-row__dot stat-row__dot--green" />
              <span>
                Serbest:{" "}
                {loading
                  ? "–"
                  : Math.max(
                      0,
                      (stats.totalBooks ?? 0) - (stats.loanedCount ?? 0),
                    )}
              </span>
            </div>
            <div className="stat-row">
              <span className="stat-row__dot stat-row__dot--orange" />
              <span>Ödünçte: {loading ? "–" : (stats.loanedCount ?? 0)}</span>
            </div>
          </div>
        </div>

        {/* Kart 2: Son ödünçler */}
        <div className="card dashboard-card">
          <div className="card__header">
            <span className="card__title">Son ödünçler</span>
            <button
              type="button"
              className="btn btn--ghost"
              onClick={() => navigate("/admin/oduncler")}
            >
              Tümü
            </button>
          </div>
          <div className="card__body">
            {recentClaims.length === 0 && !loading ? (
              <p className="dashboard-empty">Henüz ödünç kaydı yok.</p>
            ) : (
              <ul className="dashboard-list">
                {recentClaims.map((c) => (
                  <li
                    key={c.id}
                    className="dashboard-list__item"
                    onClick={() =>
                      c.book && navigate(`/admin/kitap/${c.book.id}`)
                    }
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) =>
                      e.key === "Enter" &&
                      c.book &&
                      navigate(`/admin/kitap/${c.book.id}`)
                    }
                  >
                    <span className="dashboard-list__primary">
                      {c.book?.name}
                    </span>
                    <span className="dashboard-list__secondary">
                      {c.user?.name} {c.user?.surname} ·{" "}
                      {formatDate(c.giveDate)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Kart 3: Özet */}
        <div className="card dashboard-card">
          <div className="card__header">
            <span className="card__title">Özet</span>
          </div>
          <div className="card__body">
            <div className="summary-metrics">
              <div className="summary-metrics__item">
                <span className="summary-metrics__value">
                  {loading ? "–" : stats.totalUsers}
                </span>
                <span className="summary-metrics__label">Kayıtlı üye</span>
              </div>
              <div className="summary-metrics__item">
                <span className="summary-metrics__value">
                  {loading ? "–" : stats.loanedCount}
                </span>
                <span className="summary-metrics__label">Açık ödünç</span>
              </div>
              <div className="summary-metrics__item">
                <span className="summary-metrics__value">
                  {loading ? "–" : stats.totalBooks}
                </span>
                <span className="summary-metrics__label">Toplam kitap</span>
              </div>
            </div>
          </div>
        </div>

        {/* Kart 4: Hızlı işlemler */}
        <div className="card dashboard-card">
          <div className="card__header">
            <span className="card__title">Hızlı işlemler</span>
          </div>
          <div className="card__body">
            <div className="quick-actions">
              <button
                type="button"
                className="quick-actions__btn"
                onClick={() => navigate("/admin/odunc-formu")}
              >
                Ödünç ver
              </button>
              <button
                type="button"
                className="quick-actions__btn"
                onClick={() => navigate("/admin/kitap-ekle")}
              >
                Kitap ekle
              </button>
              <button
                type="button"
                className="quick-actions__btn"
                onClick={() => navigate("/admin/kullanici-kaydet")}
              >
                Kullanıcı kaydet
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
