import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { requestWithAuth } from "../../../helpers/requests";
import { formatDate } from "../../../helpers/formatDate";
import axios from "axios";

function BookDetails() {
    const { id } = useParams();
    const [book, setBook] = useState(null);
    const [recentBooks, setRecentBooks] = useState([]);
    const [qrCodeUrl, setQrCodeUrl] = useState("");
    const ApiEndpoint = `${import.meta.env.VITE_APP_API_URL}`;

    const getDetails = async () => {
        try {
            const resp = await requestWithAuth("get", "/admin/get-book-details/", id);
            setBook(resp.data.book);
            setRecentBooks(resp.data.book?.userBooks ?? []);
        } catch (error) {
            console.log(error);
        }
    };

    const fetchQRCode = async () => {
        try {
            const response = await axios.get(ApiEndpoint + "/admin/getBookQR/" + id, {
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

    useEffect(() => {
        getDetails();
        fetchQRCode();
    }, []);

    if (!book) return <p>Yükleniyor...</p>;

    return (
        <div className="detail-page">
                <div className="detail-qr-wrap">
                    {qrCodeUrl ? (
                        <img src={qrCodeUrl} alt="QR Code" />
                    ) : (
                        <p style={{ color: "var(--text-muted)" }}>QR kod yükleniyor...</p>
                    )}
                </div>

                <h1 className="detail-title">{book.name}</h1>
                <p className="detail-meta">{formatDate(book.createdAt)} tarihinde eklendi</p>

                <div className="detail-stats">
                    <span><strong>Yazar:</strong> {book.author}</span>
                    <span><strong>Yayıncı:</strong> {book.publisher}</span>
                    <span><strong>Sayfa sayısı:</strong> {book.pageCount}</span>
                </div>

                <div className="content-card">
                    <h2 className="detail-section-title">Bu kitabı alanlar</h2>
                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Kişi</th>
                                    <th>TC</th>
                                    <th>Telefon</th>
                                    <th>Alınma Tarihi</th>
                                    <th>Son Teslim</th>
                                    <th>Durum</th>
                                    <th>Süre dolmuş</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentBooks.length > 0 ? (
                                    recentBooks.map((ub) => (
                                        <tr key={ub.id}>
                                            <td>{ub.user?.name} {ub.user?.surname}</td>
                                            <td>{ub.user?.tc}</td>
                                            <td>{ub.user?.phoneNumber}</td>
                                            <td>{formatDate(ub.giveDate)}</td>
                                            <td>{formatDate(ub.endDate)}</td>
                                            <td>{ub.isDelivered ? "Teslim edildi" : "Teslim edilmedi"}</td>
                                            <td>{ub.isExpired ? "Evet" : "Hayır"}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="7" className="text-center" style={{ padding: "24px", color: "var(--text-muted)" }}>Henüz kayıt yok.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
        </div>
    );
}

export default BookDetails;
