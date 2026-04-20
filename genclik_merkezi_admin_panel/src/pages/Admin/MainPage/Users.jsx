import axios from "axios";
import { useEffect, useState } from "react";
import { formatDate } from "../../../helpers/formatDate";
import EditDialog from "../dialogs/EditDialog";
import { successToast } from "../../../helpers/toast";
import GiveDialog from "../dialogs/GiveDialog";
import ReactPaginate from 'react-paginate';
import { requestWithAuth } from "../../../helpers/requests";
import { useNavigate } from "react-router-dom";

function Users() {
    const [searchInput, setSearchInput] = useState("");
    const [users, setUsers] = useState([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const ApiEndpoint = `${import.meta.env.VITE_APP_API_URL}`;

    const fetchUsers = async (newPage) => {
        try {

            const response = await requestWithAuth("post", "/admin/get-users?page=", newPage, "", { name: searchInput })
            console.log(response);
            setUsers(response.data.users);
            setTotalPages(response.data.totalPages);
        } catch (error) {
            setUsers([]);
            console.error("Error fetching books:", error);
        }
    };

    useEffect(() => {
        fetchUsers(page);
    }, [searchInput, page]);

    const handlePageChange = ({ selected }) => {
        setPage(selected + 1); // react-paginate uses 0-based index
    };

    const navigate = useNavigate()

    return (
        <div className="w-100">
            <h1 className="page-title">Kullanıcılar</h1>
            <p className="page-subtitle">Kayıtlı kullanıcıları görüntüleyin ve yönetin.</p>

            <div className="content-card">
                <div className="search-wrap">
                    <i className="fa-solid fa-magnifying-glass search-icon" />
                    <input
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        placeholder="Ad veya telefon ile ara..."
                        id="search"
                        type="text"
                    />
                </div>

                <div className="table-containerr">
                    <table>
                        <thead>
                            <tr>
                                <th>İsim</th>
                                <th>TC</th>
                                <th>Telefon</th>
                                <th>Kayıt Tarihi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users?.length > 0 ? (
                                users.map((user) => (
                                    <tr
                                        key={user.id}
                                        data-clickable
                                        onClick={() => navigate("/admin/kullanici/" + user.id)}
                                    >
                                        <td data-label="İsim">{user.name} {user.surname}</td>
                                        <td data-label="TC">{user.tc}</td>
                                        <td data-label="Telefon">{user.phoneNumber}</td>
                                        <td data-label="Kayıt Tarihi">{formatDate(user.createdAt)}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" className="text-center" style={{ padding: '32px', color: 'var(--text-muted)' }}>Kayıt bulunamadı.</td>
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

export default Users;
