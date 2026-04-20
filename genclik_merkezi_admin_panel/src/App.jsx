import MainLayout from "./Layout/MainLayout";
import { Navigate, Route, Routes } from "react-router-dom";
import { useSelector } from "react-redux";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import LoginPage from "./pages/Admin/LoginPage/LoginPage";
import AdminLayout from "./components/AdminLayout/AdminLayout";
import Dashboard from "./pages/Admin/Dashboard/Dashboard";
import Users from "./pages/Admin/MainPage/Users";
import RegisterUserAdmin from "./pages/Admin/MainPage/RegisterUserAdmin";
import Books from "./pages/Admin/MainPage/Books";
import CreateBook from "./pages/Admin/MainPage/CreateBook";
import ClaimForm from "./pages/Admin/MainPage/ClaimForm";
import Claims from "./pages/Admin/MainPage/Claims";
import Announcements from "./pages/Admin/MainPage/Announcements";
import Excel from "./pages/Admin/MainPage/Excel";
import BookDetails from "./pages/Admin/DetailsPages/BookDetails";
import UserDetails from "./pages/Admin/DetailsPages/UserDetails";

function App() {
  const logged = useSelector((state) => state.auth.logged);

  return (
    <MainLayout>
      <Routes>
        <Route path="/" element={<Navigate to="/admin" replace />} />
        <Route
          path="/admin"
          element={logged ? <AdminLayout /> : <LoginPage />}
        >
          <Route index element={<Navigate to="anasayfa" replace />} />
          <Route path="anasayfa" element={<Dashboard />} />
          <Route path="kullanıcilar" element={<Users />} />
          <Route path="kullanici-kaydet" element={<RegisterUserAdmin />} />
          <Route path="kitaplar" element={<Books />} />
          <Route path="kitap-ekle" element={<CreateBook />} />
          <Route path="odunc-formu" element={<ClaimForm />} />
          <Route path="oduncler" element={<Claims />} />
          <Route path="duyurular" element={<Announcements />} />
          <Route path="excel" element={<Excel />} />
          <Route path="kitap/:id" element={<BookDetails />} />
          <Route path="kullanici/:id" element={<UserDetails />} />
        </Route>
      </Routes>
      <ToastContainer />
    </MainLayout>
  );
}

export default App;
