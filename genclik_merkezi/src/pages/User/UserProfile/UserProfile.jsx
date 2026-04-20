import { useEffect, useState } from "react";
import "./profile.css";
import axios from "axios";
import { requestWithAuth } from "../../../helpers/requests";
import { formatDate } from "../../../helpers/formatDate";
import { useDispatch } from "react-redux";
import { setNotifications } from "../../../redux/features/authSlice";
import { useNavigate } from "react-router-dom";
import { errorToast, successToast } from "../../../helpers/toast";

function UserProfile() {
  const [user, setUser] = useState({});
  const [recentBooks, setRecentBooks] = useState([]);
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const ApiEndpoint = `${import.meta.env.VITE_APP_API_URL}`;
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    loading: false,
  });

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const fetchQRCode = async () => {
    try {
      const response = await axios.get(ApiEndpoint + "/user/getMyQR", {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
          "Content-Type": "application/json",
        },
        responseType: "blob",
      });

      const url = URL.createObjectURL(response.data);
      setQrCodeUrl(url);
    } catch (error) {
      console.error("Error fetching QR code:", error);
    }
  };

  const fetchUserDetails = async () => {
    try {
      const resp = await requestWithAuth("get", "/user/get-my-details", "", {
        dispatch,
      });
      setUser(resp.data.user);
      dispatch(setNotifications(resp.data.user.notifications));
    } catch (error) {
      console.error("Error fetching user:", error);
    }
  };

  const fetchUserRecentBooks = async () => {
    try {
      const resp = await requestWithAuth("get", "/user/get-recent-books", "", {
        dispatch,
        navigate,
      });
      setRecentBooks(resp.data.books);
    } catch (error) {
      console.error("Error fetching user:", error);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (!passwordForm.currentPassword) {
      errorToast("Mevcut şifrenizi giriniz");
      return;
    }

    if (!passwordForm.newPassword || passwordForm.newPassword.length < 8) {
      errorToast("Yeni şifre en az 8 karakter olmalıdır");
      return;
    }

    if (!/[A-Za-z]/.test(passwordForm.newPassword)) {
      errorToast("Yeni şifre en az bir harf içermelidir");
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      errorToast("Yeni şifreler uyuşmuyor");
      return;
    }

    try {
      setPasswordForm((prev) => ({ ...prev, loading: true }));

      const resp = await requestWithAuth(
        "post",
        "/user/change-my-password",
        "",
        { dispatch, navigate },
        {
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        },
      );

      if (resp.success === 1) {
        successToast("Şifreniz başarıyla güncellendi");
        setPasswordForm({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
          loading: false,
        });
      } else {
        errorToast(resp.message || "Şifreniz güncellenemedi");
        setPasswordForm((prev) => ({ ...prev, loading: false }));
      }
    } catch (error) {
      console.error(error);
      errorToast("Şifreniz güncellenirken bir hata oluştu");
      setPasswordForm((prev) => ({ ...prev, loading: false }));
    }
  };

  useEffect(() => {
    fetchQRCode();
    fetchUserDetails();
    fetchUserRecentBooks();
  }, []);

  return (
    <div className="profile-container">
      {user && (
        <>
          {/* User Info Card */}
          <div className="profile-card">
            <div className="profile-header-content">
              <div className="profile-avatar">
                {qrCodeUrl ? (
                  <img src={qrCodeUrl} alt="QR Code" className="qr-code-img" />
                ) : (
                  <div
                    className="spinner-border text-secondary"
                    role="status"
                  ></div>
                )}
              </div>
              <h2 className="profile-name">
                {user?.name} {user?.surname}
              </h2>
              <span className="profile-date">
                <i className="fa-regular fa-calendar me-2"></i>
                {formatDate(user?.createdAt).slice(0, 10)} tarihinden beri üye
              </span>
            </div>

            <div className="stats-grid">
              <div className="stat-box">
                <div className="stat-icon">
                  <i className="fa-solid fa-id-card"></i>
                </div>
                <div className="stat-info">
                  <span className="stat-label">TC Kimlik No</span>
                  <span className="stat-value">{user?.tc}</span>
                </div>
              </div>
              <div className="stat-box">
                <div className="stat-icon">
                  <i className="fa-solid fa-phone"></i>
                </div>
                <div className="stat-info">
                  <span className="stat-label">Telefon</span>
                  <span className="stat-value">{user?.phoneNumber}</span>
                </div>
              </div>
              <div className="stat-box">
                <div className="stat-icon">
                  <i className="fa-solid fa-cake-candles"></i>
                </div>
                <div className="stat-info">
                  <span className="stat-label">Doğum Tarihi</span>
                  <span className="stat-value">
                    {formatDate(user?.birthDay).slice(0, 10)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Password Change Section */}
          <div className="profile-card" style={{ marginTop: "24px" }}>
            <h3 className="section-title">Şifre Değiştir</h3>
            <form onSubmit={handleChangePassword} className="password-form">
              <div className="form-group">
                <label className="stat-label">Mevcut şifre</label>
                <input
                  type="password"
                  className="modern-input"
                  placeholder="Mevcut şifreniz"
                  value={passwordForm.currentPassword}
                  onChange={(e) =>
                    setPasswordForm((prev) => ({
                      ...prev,
                      currentPassword: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="form-group">
                <label className="stat-label">Yeni şifre</label>
                <input
                  type="password"
                  className="modern-input"
                  placeholder="Yeni şifre"
                  value={passwordForm.newPassword}
                  onChange={(e) =>
                    setPasswordForm((prev) => ({
                      ...prev,
                      newPassword: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="form-group">
                <label className="stat-label">Yeni şifre (tekrar)</label>
                <input
                  type="password"
                  className="modern-input"
                  placeholder="Yeni şifre (tekrar)"
                  value={passwordForm.confirmPassword}
                  onChange={(e) =>
                    setPasswordForm((prev) => ({
                      ...prev,
                      confirmPassword: e.target.value,
                    }))
                  }
                />
              </div>
              <button
                type="submit"
                className="auth-btn"
                disabled={passwordForm.loading}
              >
                {passwordForm.loading ? "Kaydediliyor..." : "Şifreyi Güncelle"}
              </button>
            </form>
          </div>

          {/* Book History Section */}
          <h3 className="section-title">Kitap Geçmişi</h3>
          <div className="book-list-container">
            {recentBooks?.length > 0 ? (
              recentBooks.map((book) => (
                <div className="history-card" key={book?.id}>
                  <div className="history-book-info">
                    <div className="history-title">{book?.book?.name}</div>
                    <div className="history-dates">
                      <span>
                        <i className="fa-solid fa-arrow-right-from-bracket me-2 text-success"></i>
                        Alınma: {formatDate(book?.giveDate).slice(0, 10)}
                      </span>
                      <span>
                        <i className="fa-solid fa-arrow-right-to-bracket me-2 text-danger"></i>
                        Son Teslim: {formatDate(book?.endDate).slice(0, 10)}
                      </span>
                    </div>
                  </div>

                  <div className="d-flex flex-column align-items-end gap-2">
                    <div
                      className={`status-badge ${book?.isDelivered ? "delivered" : "active"}`}
                    >
                      {book?.isDelivered
                        ? "Teslim Edildi"
                        : "Teslim Bekleniyor"}
                    </div>
                    {book?.isExpired && !book?.isDelivered && (
                      <div className="expired-warning">
                        <i className="fa-solid fa-circle-exclamation"></i>
                        Süresi Geçmiş!
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-muted p-4">
                Henüz ödünç alınan kitap bulunmamaktadır.
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default UserProfile;
