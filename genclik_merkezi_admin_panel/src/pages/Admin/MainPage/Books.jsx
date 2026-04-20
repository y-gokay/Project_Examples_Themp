import axios from "axios";
import { useEffect, useState } from "react";
import { formatDate } from "../../../helpers/formatDate";
import EditDialog from "../dialogs/EditDialog";
import DeleteConfirmModal from "../dialogs/DeleteConfirmModal";
import { successToast } from "../../../helpers/toast";
import GiveDialog from "../dialogs/GiveDialog";
import ReactPaginate from 'react-paginate';
import { useNavigate } from "react-router-dom";

function Books() {
    const [open, setOpen] = useState(false);
    const [openGive, setOpenGive] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [book, setBook] = useState(null);
    const [searchInput, setSearchInput] = useState("");
    const [books, setBooks] = useState([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalBooks, setTotalBooks] = useState(0);

    const ApiEndpoint = `${import.meta.env.VITE_APP_API_URL}`;

    const fetchBooks = async (newPage) => {
        try {
            const response = await axios.post(
                `${ApiEndpoint}/admin/get-books?page=${newPage}`,
                { name: searchInput },
                { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
            );

            setBooks(response.data.data.books);
            setTotalPages(response.data.data.totalPages);
            setTotalBooks(response.data.data.totalBooks || 0);
        } catch (error) {
            setBooks([]);
            console.error("Error fetching books:", error);
        }
    };

    useEffect(() => {
        fetchBooks(page);
    }, [searchInput, page]);

    const handlePageChange = ({ selected }) => {
        setPage(selected + 1); // react-paginate uses 0-based index
    };

    const deleteBook = async (bookID) => {
        try {
            const response = await axios.delete(
                `${ApiEndpoint}/admin/delete-book/${bookID}`,
                { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
            );

            if (response.data.success) {
                successToast("Başarıyla silindi");
                setDeleteTarget(null);
                fetchBooks(page);
            }
        } catch (error) {
            console.error("Error deleting book:", error);
        }
    };

    const navigate = useNavigate();
    return (
        <div className="w-100">
            <EditDialog
                fetchBooks={fetchBooks}
                page={page}
                open={open}
                handleClose={() => setOpen(false)}
            />
            <GiveDialog
                fetchBooks={fetchBooks}
                page={page}
                book={book}
                open={openGive}
                handleClose={() => setOpenGive(false)}
            />
            <DeleteConfirmModal
                open={deleteTarget}
                onClose={() => setDeleteTarget(null)}
                onConfirm={() => deleteTarget && deleteBook(deleteTarget.id)}
                title="Kitabı silmek istediğinize emin misiniz?"
                message={`"${deleteTarget?.name}" kitabı silinecek. Bu işlem geri alınamaz.`}
            />

            <h1 className="page-title">
                Kitaplar
                {typeof totalBooks === "number" && totalBooks > 0 && (
                    <span style={{ marginLeft: "8px", fontSize: "0.9em", color: "var(--text-muted)" }}>
                        ({totalBooks})
                    </span>
                )}
            </h1>
            <p className="page-subtitle">Kütüphane kitaplarını listeleyin ve yönetin.</p>

            <div className="content-card">
                <div className="search-wrap">
                    <i className="fa-solid fa-magnifying-glass search-icon" />
                    <input
                        value={searchInput}
                        onChange={(e) => { setPage(1); setSearchInput(e.target.value); }}
                        placeholder="Kitap adı, yazar veya yayınevi ile ara..."
                        id="search"
                        type="text"
                    />
                </div>

                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Kitap Adı</th>
                                <th>Yazar</th>
                                <th>Yayınevi</th>
                                <th>Kategori</th>
                                <th>Durum</th>
                                <th>Basım Yılı</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {books.length > 0 ? (
                                books.map((b) => (
                                    <tr
                                        key={b.id}
                                        data-clickable
                                        onClick={() => navigate("/admin/kitap/" + b.id)}
                                    >
                                        <td data-label="Kitap Adı">{b.name}</td>
                                        <td data-label="Yazar">{b.author}</td>
                                        <td data-label="Yayınevi">{b.publisher}</td>
                                        <td data-label="Kategori">{b.category}</td>
                                        <td data-label="Durum">
                                            <span style={{ color: b.isEnable ? "var(--success)" : "var(--warning)" }}>
                                                {b.isEnable ? "Serbest" : "Ödünçte"}
                                            </span>
                                        </td>
                                        <td data-label="Basım Yılı">{b.publishYear}</td>
                                        <td data-label="İşlemler" onClick={(e) => e.stopPropagation()}>
                                            <button
                                                type="button"
                                                className="btn-icon mx-2"
                                                onClick={() => { setBook(b); setOpen(b); }}
                                                title="Düzenle"
                                            >
                                                <i className="fa-solid fa-pen" />
                                            </button>
                                            <button
                                                type="button"
                                                className="btn-icon danger mx-2"
                                                onClick={(e) => { e.stopPropagation(); setDeleteTarget(b); }}
                                                title="Sil"
                                            >
                                                <i className="fa-solid fa-trash" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="7" className="text-center" style={{ padding: '32px', color: 'var(--text-muted)' }}>Kayıt bulunamadı.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="d-flex justify-content-center w-100">
                    <ReactPaginate
                    previousLabel={<i className="fa-solid fa-arrow-left"></i>}
                    nextLabel={<i className="fa-solid fa-arrow-right"></i>}
                    breakLabel={"..."}
                    pageCount={totalPages}
                    marginPagesDisplayed={2}
                    pageRangeDisplayed={1}
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

export default Books;
