import axios from "axios";
import { useEffect, useState } from "react";
import { formatDate } from "../../../helpers/formatDate";
import ReactPaginate from 'react-paginate';
import { requestWithAuth, requestWithoutAuth } from "../../../helpers/requests";
import CreateAnnouncement from "../dialogs/CreateAnnouncement";

function Announcements() {
    const [searchInput, setSearchInput] = useState("");

    const [announcements, setAnnouncements] = useState([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const [open, setOpen] = useState(false);
    const [loadingList, setLoadingList] = useState(false);
    const [deletingId, setDeletingId] = useState(null);


    const fetchAnnouncements = async (newPage) => {
        try {
            setLoadingList(true);
            const response = await requestWithoutAuth("get", "/admin/get-announcements?page=", newPage);
            setAnnouncements(response.data.announcements);
            setTotalPages(response.data.totalPages);
        } catch (error) {
            setAnnouncements([]);
            console.error("Error fetching books:", error);
        } finally {
            setLoadingList(false);
        }
    };

    useEffect(() => {
        fetchAnnouncements(page);
    }, [searchInput, page]);

    const handlePageChange = ({ selected }) => {
        setPage(selected + 1); // react-paginate uses 0-based index
    };

    const deleteAnnouncement = async (id) => {
        try {
            setDeletingId(id);
            const response = await requestWithAuth("delete", "/admin/delete-announcement/", id)
            fetchAnnouncements(page);
        } catch (error) {
            console.error("Error fetching ann:", error);
        } finally {
            setDeletingId(null);
        }
    }

    return (
        <div className="w-100">
            <CreateAnnouncement
                page={page}
                fetchAnnouncements={fetchAnnouncements}
                open={open}
                handleClose={() => setOpen(false)}
            />

            <h1 className="page-title">Duyurular</h1>
            <p className="page-subtitle">Duyuruları oluşturun ve yönetin.</p>

            <div className="content-card">
                <div className="d-flex justify-content-between align-items-center" style={{ marginBottom: '20px' }}>
                    <span></span>
                    <button type="button" className="btn btn--primary" onClick={() => setOpen(true)}>
                        Yeni Duyuru
                    </button>
                </div>

                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Başlık</th>
                                <th>Açıklama</th>
                                <th>Resim URL</th>
                                <th>Yayın Tarihi</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {loadingList ? (
                                <tr>
                                    <td colSpan="5" className="text-center" style={{ padding: '32px', color: 'var(--text-muted)' }}>Yükleniyor...</td>
                                </tr>
                            ) : announcements?.length > 0 ? (
                                announcements.map((announcement) => (
                                    <tr key={announcement.id}>
                                        <td data-label="Başlık">{announcement.title}</td>
                                        <td data-label="Açıklama">{announcement.description}</td>
                                        <td data-label="Resim URL">{announcement.imageUrl}</td>
                                        <td data-label="Yayın Tarihi">{formatDate(announcement.createdAt)}</td>
                                        <td data-label="İşlemler">
                                            <button
                                                type="button"
                                                className="btn-icon danger"
                                                onClick={() => deleteAnnouncement(announcement.id)}
                                                title="Sil"
                                                disabled={deletingId === announcement.id}
                                            >
                                                <i className="fa-solid fa-trash" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="text-center" style={{ padding: '32px', color: 'var(--text-muted)' }}>Kayıt bulunamadı.</td>
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

export default Announcements;
