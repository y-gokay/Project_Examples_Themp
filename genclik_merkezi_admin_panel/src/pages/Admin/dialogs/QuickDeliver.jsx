import { useState, useCallback, useEffect } from "react";
import _ from "lodash";
import Modal from "../../../components/Modal/Modal";
import { errorToast, successToast } from "../../../helpers/toast";
import { requestWithAuth } from "../../../helpers/requests";

export default function QuickDeliver({ open, handleClose }) {
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
  const [bookSearch, setBookSearch] = useState({ barcode: "" });
  const [bookInfo, setBookInfo] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setBookSearch({ barcode: "" });
      setBookForm({
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
    }
  }, [open]);

  const debounceHandleBarcode = useCallback(
    _.debounce(async (entered) => {
      try {
        if (entered.trim() === "") {
          setBookInfo(true);
          setBookForm({
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
          return;
        }

        const resp = await requestWithAuth("post", "/admin/get-claimed-book-by-barcode", "", "", { barcode: entered });

        if (resp.success === 1) {
          setBookInfo(true);
          setBookForm({
            id: resp.data.book.id,
            name: resp.data.book.name,
            barcode: resp.data.book.barcode,
            category: resp.data.book.category,
            publishYear: resp.data.book.publishYear,
            publisher: resp.data.book.publisher,
            translatorName: resp.data.book.translatorName,
            author: resp.data.book.author,
            founded: true,
          });
        } else {
          setBookInfo(false);
          setBookForm({
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
        }
      } catch (error) {
        setBookInfo(false);
      }
    }, 300),
    []
  );

  const handleChangeBarcode = (e) => {
    const entered = e.target.value;
    setBookSearch((prev) => ({ ...prev, barcode: entered }));
    debounceHandleBarcode(entered);
  };

  const handleReceive = async () => {
    try {
      if (!bookForm.id || loading) return;
      setLoading(true);
      const response = await requestWithAuth("post", "/admin/receive-book-with-bookID", "", "", {
        bookID: bookForm.id,
      });

      handleClose();
      if (response.success === 1) {
        successToast("Başarıyla teslim alındı");
      } else {
        errorToast(response.data);
      }
    } catch (error) {
      console.error("Error receiving book:", error);
      errorToast(error?.response?.data || "Bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={handleClose} title="Hızlı Teslim" maxWidth="420px">
      <div className="quick-deliver-form">
        <div className="input-wrap">
          <label>Barkod</label>
          <input
            className="input"
            type="text"
            value={bookSearch.barcode}
            onChange={handleChangeBarcode}
            placeholder="Barkod girin veya tarayın"
            autoFocus
          />
        </div>
        {!bookInfo && bookSearch.barcode && <p className="claim-form-error">Kitap bulunamadı.</p>}
        {bookForm.founded && (
          <div className="quick-deliver-book">
            <div className="quick-deliver-book__cover">
              <img src="https://yayinlar.tubitak.gov.tr/themes/classic/assets/img/dummies/bg-book.png" alt="" />
            </div>
            <div className="quick-deliver-book__info">
              <div className="quick-deliver-book__name">{bookForm.name}</div>
              <div className="quick-deliver-book__meta">{bookForm.author}</div>
              <div className="quick-deliver-book__meta">{bookForm.publisher}</div>
              <div className="quick-deliver-book__meta">{bookForm.category}</div>
            </div>
            <button
              type="button"
              className="btn btn--primary w-100 mt-2"
              onClick={handleReceive}
              disabled={loading}
            >
              {loading ? "Teslim alınıyor..." : "Teslim Al"}
            </button>
          </div>
        )}
      </div>
    </Modal>
  );
}
