import axios from "axios";
import { useState, useCallback } from "react";
import { errorToast, successToast } from "../../../helpers/toast";
import QRReader from "./QRReader";
import { requestWithAuth } from "../../../helpers/requests";
import _ from "lodash";

const ApiEndpoint = `${import.meta.env.VITE_APP_API_URL}`;

function ClaimForm() {
  const [tc, setTc] = useState("");
  const [userformData, setUserFormData] = useState({
    userTC: "",
    phoneNumber: "",
    name: "",
    surname: "",
    email: "",
    userID: "",
    founded: false,
  });
  const [userInfo, setUserInfo] = useState(true);
  const [qrOn, setQrOn] = useState(false);
  const [bookForm, setBookForm] = useState({
    id: "",
    name: "",
    barcode: "",
    category: "",
    publishYear: "",
    publisher: "",
    translatorName: "",
    author: "",
    founded: false,
  });
  const [bookSearch, setBookSearch] = useState({ bookName: "", barcode: "" });
  const [bookInfo, setBookInfo] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const debounceHandleChangeBarcode = useCallback(
    _.debounce(async (entered) => {
      try {
        const resp = await requestWithAuth("post", "/admin/get-book-by-barcode", "", "", { barcode: entered });
        if (resp.success == 1) {
          setBookInfo(true);
          setBookForm({ ...resp.data.book, founded: true });
        } else {
          setBookInfo(false);
          setBookForm({ id: "", name: "", barcode: "", category: "", publishYear: "", publisher: "", translatorName: "", author: "", founded: false });
        }
        if (entered === "") setBookInfo(true);
      } catch (error) {
        setBookInfo(false);
      }
    }, 300),
    []
  );

  const handleChangeBarcode = (e) => {
    const entered = e.target.value;
    setBookSearch((prev) => ({ ...prev, barcode: entered }));
    debounceHandleChangeBarcode(entered);
  };

  const handleChangeName = async (e) => {
    const entered = e.target.value;
    setBookSearch((prev) => ({ ...prev, bookName: entered }));
    try {
      const resp = await requestWithAuth("post", "/admin/get-book-by-barcode", "", "", { name: entered });
      if (resp.success == 1) {
        setBookInfo(true);
        setBookForm({ ...resp.data.book, founded: true });
      } else {
        setBookInfo(false);
        setBookForm({ id: "", name: "", barcode: "", category: "", publishYear: "", publisher: "", translatorName: "", author: "", founded: false });
      }
      if (entered === "") setBookInfo(true);
    } catch (error) {
      setBookInfo(false);
    }
  };

  const handleTcLookup = async (value) => {
    setTc(value);
    if (value.length === 11) {
      try {
        const resp = await requestWithAuth("get", "/admin/get-user-by-tc/", value);
        if (resp.success == 1) {
          setUserFormData({ ...resp.data.user, founded: true });
          setUserInfo(true);
        } else setUserInfo(false);
      } catch {
        setUserInfo(false);
      }
    } else if (value.length > 0) {
      setUserFormData({ userTC: "", phoneNumber: "", name: "", surname: "", email: "", userID: "", founded: false });
      setUserInfo(false);
    } else {
      setUserFormData({ userTC: "", phoneNumber: "", name: "", surname: "", email: "", userID: "", founded: false });
      setUserInfo(true);
    }
  };

  const handleTcInput = (value) => {
    let v = String(value).replace(/\D/g, "");
    if (!v) {
      setTc("");
      setUserFormData({ userTC: "", phoneNumber: "", name: "", surname: "", email: "", userID: "", founded: false });
      setUserInfo(true);
      return;
    }
    if (v.length > 11) {
      v = v.slice(0, 11);
    }
    setTc(v);
    handleTcLookup(v);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const body = { bookID: bookForm.id, tc, bookName: bookForm.name };
      setSubmitting(true);
      const response = await axios.post(ApiEndpoint + "/admin/give-book", body, {
        headers: { Authorization: "Bearer " + localStorage.getItem("token") },
      });
      if (response.data.success == 1) {
        successToast("Başarıyla ödünç verildi");
        setTc("");
        setBookSearch({ bookName: "", barcode: "" });
        setBookForm({ id: "", name: "", barcode: "", category: "", publishYear: "", publisher: "", translatorName: "", author: "", founded: false });
        setUserFormData({ userTC: "", phoneNumber: "", name: "", surname: "", email: "", userID: "", founded: false });
      } else {
        errorToast(response.data.data);
      }
    } catch (error) {
      errorToast(error?.response?.data?.data || "Bir hata oluştu");
    } finally {
      setSubmitting(false);
    }
  };

  const toggleQrScanner = () => setQrOn(!qrOn);
  const onScanSuccess = async (result) => {
    handleTcInput(result);
    setQrOn(false);
  };

  return (
    <div className="w-100">
      <h1 className="page-title">Ödünç Ver</h1>
      <p className="page-subtitle">TC kimlik numarası ve barkod ile kitap ödünç verin.</p>

      <form onSubmit={handleSubmit}>
        <div className="claim-form-grid">
          {/* Kullanıcı bilgisi */}
          <div className="card claim-form-card">
            <div className="card__header">
              <span className="card__title">Kullanıcı</span>
            </div>
            <div className="card__body">
              <QRReader isQrOn={qrOn} onToggleQrScanner={toggleQrScanner} onScanSuccess={onScanSuccess} />
              <div className="input-wrap">
                <label>TC Kimlik Numarası</label>
                <input
                  className="input"
                  type="text"
                  value={tc}
                  onChange={(e) => handleTcInput(e.target.value)}
                  placeholder="TC Kimlik No (11 hane)"
                  maxLength={11}
                />
              </div>
              {userformData.founded && (
                <div className="claim-form-info">
                  <div className="claim-form-info-row">
                    <span className="claim-form-info-label">Ad Soyad</span>
                    <span>{userformData.name} {userformData.surname}</span>
                  </div>
                  <div className="claim-form-info-row">
                    <span className="claim-form-info-label">TC</span>
                    <span>{userformData.tc || userformData.userTC}</span>
                  </div>
                </div>
              )}
              {!userInfo && tc.length === 11 && (
                <p className="claim-form-error">Kullanıcı bulunamadı.</p>
              )}
            </div>
          </div>

          {/* Kitap bilgisi */}
          <div className="card claim-form-card">
            <div className="card__header">
              <span className="card__title">Kitap</span>
            </div>
            <div className="card__body">
              <div className="input-wrap">
                <label>Barkod</label>
                <input className="input" type="text" value={bookSearch.barcode} onChange={handleChangeBarcode} placeholder="Barkod girin veya tarayın" />
              </div>
              <div className="input-wrap">
                <label>Kitap adı</label>
                <input className="input" type="text" value={bookSearch.bookName} onChange={handleChangeName} placeholder="Kitap adı ile ara" />
              </div>
              {bookForm.founded && (
                <div className="claim-form-info">
                  <div className="claim-form-info-row">
                    <span className="claim-form-info-label">Kitap</span>
                    <span>{bookForm.name}</span>
                  </div>
                  <div className="claim-form-info-row">
                    <span className="claim-form-info-label">Yazar</span>
                    <span>{bookForm.author}</span>
                  </div>
                  <div className="claim-form-info-row">
                    <span className="claim-form-info-label">Yayınevi</span>
                    <span>{bookForm.publisher}</span>
                  </div>
                </div>
              )}
              {!bookInfo && (bookSearch.barcode || bookSearch.bookName) && (
                <p className="claim-form-error">Kitap bulunamadı.</p>
              )}
            </div>
          </div>
        </div>

        <div className="claim-form-submit">
          <button
            type="submit"
            className="btn btn--primary"
            disabled={!bookForm.founded || !userformData.founded || submitting}
          >
            {submitting ? "Ödünç veriliyor..." : "Ödünç Ver"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default ClaimForm;
