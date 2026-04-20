import "./usersearchbook.css";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import ReactPaginate from 'react-paginate';
import { requestWithoutAuth } from "../../../helpers/requests";

function UserSearchBooks() {
    const [searchParams] = useSearchParams();
    const [searchInput, setSearchInput] = useState(searchParams.get('q') || "");
    const [books, setBooks] = useState([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const fetchBooks = async (newPage) => {
        try {
            const response = await requestWithoutAuth("post", '/user/get-books?page=', newPage, null, { name: searchInput });
            setBooks(response.data.books);
            setTotalPages(response.data.totalPages);
        } catch (error) {
            setBooks([]);
            console.error("Error fetching books:", error);
        }
    };

    useEffect(() => {
        const q = searchParams.get('q');
        if (q !== null && q !== searchInput) {
            setSearchInput(q);
        }
    }, [searchParams]);

    useEffect(() => {
        fetchBooks(page);
    }, [searchInput, page]);

    const handlePageChange = ({ selected }) => {
        setPage(selected + 1);
        // Sayfa değiştiğinde liste başına kaydır
        window.scrollTo({
            top: 0,
            left: 0,
            behavior: "smooth",
        });
    };

    const isNewBook = (book) => {
        const created = book?.createdAt ? new Date(book.createdAt).getTime() : 0;
        const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
        return created >= thirtyDaysAgo;
    };

    return (
        <div className="page-container d-flex flex-column">

            {/* Search Header */}
            <div className="search-header">
                <div className="search-wrapper">
                    <i className="fa-solid fa-magnifying-glass search-icon"></i>
                    <input
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        placeholder="Kitap Adı, Yazar veya Yayınevi Ara..."
                        className="search-input-modern"
                        type="text"
                    />
                </div>
            </div>

            {/* Books Grid */}
            <div className="books-grid">
                {books?.length > 0 ? (
                    books.map((book) => (
                        <div key={book.id} className="book-card">
                            <div className="book-img-container">
                                {isNewBook(book) && <span className="book-badge-new">Yeni Eklendi</span>}
                                <img
                                    src={book.imageUrl || "https://static.vecteezy.com/system/resources/thumbnails/009/384/332/small_2x/old-vintage-book-clipart-design-illustration-free-png.png"}
                                    alt={book.name}
                                    className="book-img"
                                />
                            </div>
                            <div className="book-info">
                                <h3 className="book-title" title={book.name}>{book.name}</h3>
                                <p className="book-meta"><i className="fa-solid fa-pen-nib me-2"></i>{book.author}</p>
                                <p className="book-meta"><i className="fa-solid fa-building me-2"></i>{book.publisher}</p>
                                <div className={`book-status ${book.isEnable ? 'status-available' : 'status-unavailable'}`}>
                                    <i className={`fa-solid fa-circle me-2`}></i>
                                    {book.isEnable ? "Müsait" : "Ödünç Verilmiş"}
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="no-results">
                        <i className="fa-regular fa-face-frown fa-3x mb-3"></i>
                        <p>Aradığınız kriterlere uygun kitap bulunamadı.</p>
                    </div>
                )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="pagination-container">
                    <ReactPaginate
                        previousLabel={<i className="fa-solid fa-chevron-left"></i>}
                        nextLabel={<i className="fa-solid fa-chevron-right"></i>}
                        breakLabel={"..."}
                        pageCount={totalPages}
                        marginPagesDisplayed={1}
                        pageRangeDisplayed={3}
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
            )}
        </div>
    );
}

export default UserSearchBooks;