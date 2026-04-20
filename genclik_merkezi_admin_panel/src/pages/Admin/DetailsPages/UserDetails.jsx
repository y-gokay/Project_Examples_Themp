import { useEffect, useState } from "react";
import { requestWithAuth } from "../../../helpers/requests";
import { useParams } from "react-router-dom";
import { formatDate } from "../../../helpers/formatDate";
import axios from "axios";
import { errorToast, successToast } from "../../../helpers/toast";

function UserDetails() {
    const { id } = useParams();
    const [user, setUser] = useState(null);
    const [recentBooks, setRecentBooks] = useState([]);
    const [qrCodeUrl, setQrCodeUrl] = useState("");
    const ApiEndpoint = `${import.meta.env.VITE_APP_API_URL}`;
    const [passwordForm, setPasswordForm] = useState({
        newPassword: "",
        confirmPassword: "",
        loading: false,
    });

    const getDetails = async () => {
        try {
            const resp = await requestWithAuth("get", "/admin/get-user-details/", id);
            setUser(resp.data.user);
            setRecentBooks(resp.data.user?.userBooks ?? []);
        } catch (error) {
            console.log(error);
        }
    };

    const fetchQRCode = async () => {
        try {
            const response = await axios.get(ApiEndpoint + "/admin/get-user-qr/" + id, {
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

    const handleChangePassword = async (e) => {
        e.preventDefault();

        if (!passwordForm.newPassword || passwordForm.newPassword.length < 8) {
            errorToast("Şifre en az 8 karakter olmalıdır");
            return;
        }

        if (!/[A-Za-z]/.test(passwordForm.newPassword)) {
            errorToast("Şifre en az bir harf içermelidir");
            return;
        }

        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            errorToast("Şifreler uyuşmuyor");
            return;
        }

        try {
            setPasswordForm((prev) => ({ ...prev, loading: true }));
            const resp = await requestWithAuth(
                "post",
                "/admin/change-user-password",
                "",
                "",
                { userID: id, newPassword: passwordForm.newPassword }
            );

            if (resp.success === 1) {
                successToast("Şifre başarıyla güncellendi");
                setPasswordForm({
                    newPassword: "",
                    confirmPassword: "",
                    loading: false,
                });
            } else {
                errorToast(resp.message || "Şifre güncellenemedi");
                setPasswordForm((prev) => ({ ...prev, loading: false }));
            }
        } catch (error) {
            console.log(error);
            errorToast("Şifre güncellenirken bir hata oluştu");
            setPasswordForm((prev) => ({ ...prev, loading: false }));
        }
    };

    useEffect(() => {
        getDetails();
        fetchQRCode();
    }, []);

    if (!user) return <p>Yükleniyor...</p>;

    return (
        <div className="detail-page">
            <div className="detail-qr-wrap">
                {qrCodeUrl ? (
                    <img src={qrCodeUrl} alt="QR Code" style={{ maxWidth: "200px" }} />
                ) : (
                    <p style={{ color: "var(--text-muted)" }}>QR kod yükleniyor...</p>
                )}
            </div>

            <h1 className="detail-title">{user.name} {user.surname}</h1>
            <p className="detail-meta">{formatDate(user.createdAt)} tarihinden beri üye</p>

            <div className="detail-stats">
                <span><strong>TC:</strong> {user.tc}</span>
                <span><strong>Telefon:</strong> {user.phoneNumber}</span>
                <span><strong>Doğum tarihi:</strong> {formatDate(user.birthDay).slice(0, 10)}</span>
            </div>

            <div className="content-card" style={{ marginTop: "24px" }}>
                <h2 className="detail-section-title">Şifre Değiştir</h2>
                <form onSubmit={handleChangePassword} className="password-form">
                    <div className="input-wrap">
                        <label>Yeni şifre</label>
                        <input
                            className="input"
                            type="password"
                            value={passwordForm.newPassword}
                            onChange={(e) =>
                                setPasswordForm((prev) => ({
                                    ...prev,
                                    newPassword: e.target.value,
                                }))
                            }
                            placeholder="Yeni şifre"
                        />
                    </div>
                    <div className="input-wrap">
                        <label>Yeni şifre (tekrar)</label>
                        <input
                            className="input"
                            type="password"
                            value={passwordForm.confirmPassword}
                            onChange={(e) =>
                                setPasswordForm((prev) => ({
                                    ...prev,
                                    confirmPassword: e.target.value,
                                }))
                            }
                            placeholder="Yeni şifre (tekrar)"
                        />
                    </div>
                    <button
                        type="submit"
                        className="btn btn--primary"
                        disabled={passwordForm.loading}
                    >
                        {passwordForm.loading ? "Kaydediliyor..." : "Şifreyi Güncelle"}
                    </button>
                </form>
            </div>

            <div className="content-card">
                <h2 className="detail-section-title">Alınan kitaplar</h2>
                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Kitap Adı</th>
                                <th>Alınma Tarihi</th>
                                <th>En Geç Teslim</th>
                                <th>Teslim Tarihi</th>
                                <th>Durum</th>
                                <th>Süre dolmuş</th>
                                <th>Teslim Eden Admin</th>
                                <th>Teslim Alan Admin</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentBooks.length > 0 ? (
                                recentBooks.map((ub) => (
                                    <tr key={ub.id}>
                                        <td>{ub.book?.name}</td>
                                        <td>{formatDate(ub.giveDate)}</td>
                                        <td>{formatDate(ub.endDate)}</td>
                                        <td>{ub.deliverDate ? formatDate(ub.deliverDate) : "-"}</td>
                                        <td>
                                            {ub.isDelivered
                                                ? (ub.deliverDate && ub.endDate && new Date(ub.deliverDate) > new Date(ub.endDate)
                                                    ? "Geç teslim edildi"
                                                    : "Teslim edildi")
                                                : (ub.endDate && new Date() > new Date(ub.endDate)
                                                    ? "Teslim edilmedi (Süresi geçti)"
                                                    : "Teslim edilmedi")}
                                        </td>
                                        <td>{ub.isExpired ? "Evet" : "Hayır"}</td>
                                        <td>
                                            {ub.giveAdmin
                                                ? (ub.giveAdmin.name || ub.giveAdmin.surname
                                                    ? `${ub.giveAdmin.name || ""} ${ub.giveAdmin.surname || ""}`
                                                    : ub.giveAdmin.email)
                                                : "-"}
                                        </td>
                                        <td>
                                            {ub.receiveAdmin
                                                ? (ub.receiveAdmin.name || ub.receiveAdmin.surname
                                                    ? `${ub.receiveAdmin.name || ""} ${ub.receiveAdmin.surname || ""}`
                                                    : ub.receiveAdmin.email)
                                                : "-"}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="8" className="text-center" style={{ padding: "24px", color: "var(--text-muted)" }}>Henüz kayıt yok.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default UserDetails;
