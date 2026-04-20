import { useState, useEffect } from "react";
import axios from "axios";
import { formatDate } from "../../../helpers/formatDate";
import { successToast } from "../../../helpers/toast";
import ReactPaginate from 'react-paginate';

function Claims() {

    const [searchInput, setSearchInput] = useState("");
    const [books, setBooks] = useState([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1); // Total pages state
    const [showDelivered, setShowDelivered] = useState(false);
    const [loadingList, setLoadingList] = useState(false);
    const [actionLoadingId, setActionLoadingId] = useState(null);

    const ApiEndpoint = `${import.meta.env.VITE_APP_API_URL}`;

    const fetchBooks = async (newPage) => {
        try {
            setLoadingList(true);
            const body = {
                name: searchInput,
                ...(showDelivered ? {} : { isDelivered: false }),
            };

            const response = await axios.post(
                `${ApiEndpoint}/admin/get-claims?page=${newPage}`,
                body,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                }
            );

            setBooks(response.data.data.claims.result);
            setTotalPages(response.data.data.claims.pagination.total_page);
        } catch (error) {
            setBooks([]);
            console.error("Error fetching books:", error);
        } finally {
            setLoadingList(false);
        }
    };

    useEffect(() => {
        fetchBooks(page);
    }, [searchInput, page, showDelivered]);

    const handlePageChange = ({ selected }) => {
        setPage(selected + 1); // react-paginate uses 0-based index
    };

    const handleReceive = async (id) => {
        try {
            setActionLoadingId(id);
            const response = await axios.post(
                `${ApiEndpoint}/admin/receive-book`,
                { bookID: id },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                }
            );

            if (response.data.success === 1) {
                successToast("Başarıyla teslim alındı");
                fetchBooks(page);
            }
        } catch (error) {
            console.error("Error receiving book:", error);
        } finally {
            setActionLoadingId(null);
        }
    };

    const handleExtend = async (id) => {
        try {
            setActionLoadingId(id);
            const response = await axios.post(
                `${ApiEndpoint}/admin/extend-delivery-time/${id}`,
                { bookID: id },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                }
            );

            if (response.data.success === 1) {
                successToast("Başarıyla uzatıldı.");
                fetchBooks(page);
            }
        } catch (error) {
            console.error("Error extending delivery time:", error);
        } finally {
            setActionLoadingId(null);
        }
    };

    const getStatusText = (book) => {
        const now = new Date();
        const end = book.endDate ? new Date(book.endDate) : null;
        const deliveredAt = book.deliverDate ? new Date(book.deliverDate) : null;

        if (book.isDelivered) {
            if (end && deliveredAt && deliveredAt > end) {
                return "Geç teslim edildi";
            }
            return "Teslim edildi";
        }

        if (end && now > end) {
            return "Teslim edilmedi (Süresi geçti)";
        }

        return "Teslim edilmedi";
    };

    const getStatusColor = (book) => {
        const now = new Date();
        const end = book.endDate ? new Date(book.endDate) : null;
        const deliveredAt = book.deliverDate ? new Date(book.deliverDate) : null;

        if (book.isDelivered) {
            if (end && deliveredAt && deliveredAt > end) {
                return "var(--danger)";
            }
            return "var(--success)";
        }

        if (end && now > end) {
            return "var(--danger)";
        }

        return "var(--warning)";
    };

    return (
        <div className="w-100">
            <h1 className="page-title">Ödünç Verilmişler</h1>
            <p className="page-subtitle">Ödünç verilen kitapları listeleyin ve teslim alın.</p>

            <div className="content-card">
                <div className="search-wrap-container" style={{ flexWrap: 'wrap' }}>
                    <div className="search-wrap">
                        <i className="fa-solid fa-magnifying-glass search-icon" />
                        <input
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            placeholder="Kitap adı veya ödünç alan..."
                            id="search"
                            type="text"
                        />
                    </div>
                    <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.9rem", whiteSpace: "nowrap" }}>
                        <input
                            type="checkbox"
                            checked={showDelivered}
                            onChange={(e) => setShowDelivered(e.target.checked)}
                        />
                        Teslim edilmişleri göster
                    </label>
                </div>

                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Kitap</th>
                                <th>Ödünç Alan</th>
                                <th>Telefon</th>
                                <th>Alınma Tarihi</th>
                                <th>En Geç Teslim Tarihi</th>
                                <th>Teslim Tarihi</th>
                                <th>Teslim Eden Admin</th>
                                <th>Teslim Alan Admin</th>
                                <th>Durum</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {loadingList ? (
                                <tr>
                                    <td colSpan="10" className="text-center" style={{ padding: '32px', color: 'var(--text-muted)' }}>Yükleniyor...</td>
                                </tr>
                            ) : books.length > 0 ? (
                                books.map((book) => (
                                    <tr key={book.id}>
                                        <td data-label="Kitap">{book.book?.name}</td>
                                        <td data-label="Ödünç Alan">{book.user?.name} {book.user?.surname}</td>
                                        <td data-label="Telefon">{book.user?.phoneNumber}</td>
                                        <td data-label="Alınma Tarihi">{formatDate(book.giveDate)}</td>
                                        <td data-label="En Geç Teslim Tarihi">{formatDate(book.endDate)}</td>
                                        <td data-label="Teslim Tarihi">{book.deliverDate ? formatDate(book.deliverDate) : "-"}</td>
                                        <td data-label="Teslim Eden Admin">
                                            {book.giveAdmin
                                                ? (book.giveAdmin.name || book.giveAdmin.surname
                                                    ? `${book.giveAdmin.name || ""} ${book.giveAdmin.surname || ""}`
                                                    : book.giveAdmin.email)
                                                : "-"}
                                        </td>
                                        <td data-label="Teslim Alan Admin">
                                            {book.receiveAdmin
                                                ? (book.receiveAdmin.name || book.receiveAdmin.surname
                                                    ? `${book.receiveAdmin.name || ""} ${book.receiveAdmin.surname || ""}`
                                                    : book.receiveAdmin.email)
                                                : "-"}
                                        </td>
                                        <td data-label="Durum">
                                            <span style={{ color: getStatusColor(book) }}>
                                                {getStatusText(book)}
                                            </span>
                                        </td>
                                        <td data-label="İşlemler">
                                            {!book.isDelivered && (
                                                <span>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleExtend(book.id)}
                                                        className="btn btn--secondary mx-2"
                                                        disabled={actionLoadingId === book.id}
                                                    >
                                                        {actionLoadingId === book.id ? "Uzatılıyor..." : "Uzat"}
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleReceive(book.id)}
                                                        className="btn btn--primary mx-2"
                                                        disabled={actionLoadingId === book.id}
                                                    >
                                                        {actionLoadingId === book.id ? "Teslim alınıyor..." : "Teslim al"}
                                                    </button>
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="10" className="text-center" style={{ padding: '32px', color: 'var(--text-muted)' }}>Kayıt bulunamadı.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="d-flex justify-content-center">
                    <ReactPaginate
                    previousLabel={<i className="fa-solid fa-arrow-left"></i>}
                    nextLabel={<i className="fa-solid fa-arrow-right"></i>}
                    breakLabel={"..."}
                    pageCount={totalPages}
                    marginPagesDisplayed={2}
                    pageRangeDisplayed={5}
                    onPageChange={handlePageChange}
                    containerClassName={"pagination"}
                    pageClassName={"page-item"}
                    pageLinkClassName={"page-link"}
                    previousClassName={"page-item"}
                    previousLinkClassName={"page-link"}
                    nextClassName={"page-item"}
                    nextLinkClassName={"page-link"}
                    breakClassName={"page-item"}
                    breakLinkClassName={"page-link"}
                    activeClassName={"active"}
                    />
                </div>
            </div>
        </div>
    );
}

export default Claims;