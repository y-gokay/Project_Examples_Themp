import { useState, useEffect } from "react";
import axios from "axios";
import { errorToast, successToast } from "../../../helpers/toast";
import Modal from "../../../components/Modal/Modal";

export default function EditDialog({ open, handleClose, fetchBooks, page }) {
  const [formData, setFormData] = useState({
    bookID: "",
    barcode: "",
    name: "",
    author: "",
    pageCount: "",
    publisher: "",
    category: "",
    translatorName: "",
    publishYear: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [useCustomCategory, setUseCustomCategory] = useState(false);
  const categoryOptions = [
    "DİĞER",
    "ROMAN",
    "ÖYKÜ",
    "HİKAYE",
    "ŞİİR",
    "TARİH",
    "BİLİM",
    "FELSEFE",
    "ÇOCUK",
    "EĞİTİM",
    "BİYOGRAFİ",
    "İNCELEME",
    "SOSYOLOJİ",
    "PSİKOLOJİ",
    "DİN",
    "SANAT",
  ];

  useEffect(() => {
    if (open) {
      const initialCategory = open?.category ?? "";
      setFormData({
        bookID: open?.id,
        barcode: open?.barcode ?? "",
        name: open?.name ?? "",
        author: open?.author ?? "",
        pageCount: open?.pageCount ?? "",
        publisher: open?.publisher ?? "",
        category: initialCategory,
        translatorName: open?.translatorName ?? "",
        publishYear: open?.publishYear ?? "",
      });
      const upper = (initialCategory || "").toUpperCase();
      setUseCustomCategory(!!initialCategory && !categoryOptions.includes(upper));
    }
  }, [open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCategorySelect = (e) => {
    const value = e.target.value;
    if (value === "DİĞER") {
      setFormData(prev => ({
        ...prev,
        category: prev.category || "",
      }));
      setUseCustomCategory(true);
    } else {
      setFormData(prev => ({
        ...prev,
        category: value,
      }));
      setUseCustomCategory(false);
    }
  };

  const ApiEndpoint = `${import.meta.env.VITE_APP_API_URL}`;
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (submitting) return;
      setSubmitting(true);
      const payload = {
        ...formData,
        category: formData.category ? formData.category.toUpperCase() : "",
      };
      const response = await axios.patch(ApiEndpoint + "/admin/update-book", payload, {
        headers: { Authorization: "Bearer " + localStorage.getItem("token") },
      });
      if (response.data.success == 1) {
        successToast("Başarıyla kaydedildi");
        handleClose();
        fetchBooks(page);
      } else {
        errorToast(response.data.data || "Hata");
      }
    } catch (err) {
      errorToast("Bir hata oluştu");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal open={!!open} onClose={handleClose} title="Kitap Düzenle" maxWidth="480px">
      <form onSubmit={handleSubmit}>
        <div className="input-wrap">
          <label>Barkod</label>
          <input className="input" type="text" name="barcode" value={formData.barcode} onChange={handleChange} />
        </div>
        <div className="input-wrap">
          <label>Kitap Adı</label>
          <input className="input" type="text" name="name" value={formData.name} onChange={handleChange} required />
        </div>
        <div className="input-wrap">
          <label>Yazar</label>
          <input className="input" type="text" name="author" value={formData.author} onChange={handleChange} />
        </div>
        <div className="input-wrap">
          <label>Yayıncı</label>
          <input className="input" type="text" name="publisher" value={formData.publisher} onChange={handleChange} />
        </div>
        <div className="input-wrap">
          <label>Kategori</label>
          <select
            className="input"
            name="categorySelect"
            value={
              useCustomCategory
                ? "DİĞER"
                : (() => {
                    const upper = (formData.category || "").toUpperCase();
                    return categoryOptions.includes(upper) ? upper : "";
                  })()
            }
            onChange={handleCategorySelect}
          >
            <option value="">Kategori seçin</option>
            {categoryOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
        {useCustomCategory && (
          <div className="input-wrap">
            <label>Diğer kategori</label>
            <input
              className="input"
              type="text"
              name="category"
              value={formData.category}
              onChange={handleChange}
            />
          </div>
        )}
        <div className="input-wrap">
          <label>Çevirmen</label>
          <input className="input" type="text" name="translatorName" value={formData.translatorName} onChange={handleChange} />
        </div>
        <div className="input-wrap">
          <label>Basım Yılı</label>
          <input className="input" type="text" name="publishYear" value={formData.publishYear} onChange={handleChange} />
        </div>
        <div className="input-wrap">
          <label>Sayfa Sayısı</label>
          <input className="input" type="text" name="pageCount" value={formData.pageCount} onChange={handleChange} />
        </div>
        <div className="d-flex justify-content-between align-items-center" style={{ gap: "12px", marginTop: "20px" }}>
          <button type="button" className="btn btn--secondary" onClick={handleClose} disabled={submitting}>
            İptal
          </button>
          <button type="submit" className="btn btn--primary" disabled={submitting}>
            {submitting ? "Kaydediliyor..." : "Kaydet"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
