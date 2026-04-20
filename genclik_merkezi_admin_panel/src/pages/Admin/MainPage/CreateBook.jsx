import axios from "axios";
import { useEffect, useState } from "react";
import { errorToast, successToast } from "../../../helpers/toast";

function CreateBook() {
    const [formData, setFormData] = useState({
        "name": "",
        "author": "",
        "barcode": "",
        "publisher": "",
        "translatorName": "",
        "publishYear": "",
        "category": "",
        "customCategory": "",
    });
    const [useCustomCategory, setUseCustomCategory] = useState(false);

    const ApiEndpoint = `${import.meta.env.VITE_APP_API_URL}`;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevFormData => ({
            ...prevFormData,
            [name]: value
        }));
    };

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

    const handleCategorySelect = (e) => {
        const value = e.target.value;
        if (value === "DİĞER") {
            setFormData(prev => ({
                ...prev,
                category: "",
                customCategory: prev.customCategory || "",
            }));
            setUseCustomCategory(true);
        } else {
            setFormData(prev => ({
                ...prev,
                category: value,
                customCategory: "",
            }));
            setUseCustomCategory(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        // Handle form submission logic here

        const rawCategory = formData.category || formData.customCategory;
        if (!rawCategory || !rawCategory.trim()) {
            errorToast("Kategori seçmek veya yazmak zorunludur.");
            return;
        }

        const categoryValue = (formData.category || formData.customCategory || "").toUpperCase();

        const payload = {
            ...formData,
            category: categoryValue,
        };

        const response = await axios.post(ApiEndpoint + "/admin/create-book", payload, {
            headers: {
                Authorization: "Bearer " + localStorage.getItem("token")
            }
        })

        if (response.data.success == 1) {
            successToast("Başarıyla kaydedildi")
            setFormData({
                "name": "",
                "author": "",
                "barcode": "",
                "publisher": "",
                "translatorName": "",
                "publishYear": "",
                "category": "",
                "customCategory": "",
            })
            setUseCustomCategory(false);
        }else{
            errorToast(response.data.data || "Hata")
        }

    };

    return (
        <div className="w-100">
            <h1 className="page-title">Kitap Ekle</h1>
            <p className="page-subtitle">Yeni kitap bilgilerini girin.</p>

            <div className="form-container formrespon">
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <input
                            className="inpodunc"
                            type="text"
                            name="barcode"
                            value={formData.barcode}
                            onChange={handleChange}
                            placeholder="Barkod"
                        />
                    </div>
                    <div className="form-group">
                        <input
                            className="inpodunc"
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Kitap adı *"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <input
                            className="inpodunc"
                            type="text"
                            name="author"
                            value={formData.author}
                            onChange={handleChange}
                            placeholder="Yazar *"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <input
                            className="inpodunc"
                            type="text"
                            name="publisher"
                            value={formData.publisher}
                            onChange={handleChange}
                            placeholder="Yayınevi *"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <select
                            className="inpodunc"
                            name="categorySelect"
                            value={
                                useCustomCategory
                                    ? "DİĞER"
                                    : formData.category || ""
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
                        <div className="form-group">
                            <input
                                className="inpodunc"
                                type="text"
                                name="customCategory"
                                value={formData.customCategory}
                                onChange={handleChange}
                                placeholder="Diğer kategori"
                            />
                        </div>
                    )}
                    <div className="form-group">
                        <input
                            className="inpodunc"
                            type="text"
                            name="translatorName"
                            value={formData.translatorName}
                            onChange={handleChange}
                            placeholder="Çevirmen"
                        />
                    </div>
                    <div className="form-group">
                        <input
                            className="inpodunc"
                            type="text"
                            name="publishYear"
                            value={formData.publishYear}
                            onChange={handleChange}
                            placeholder="Basım yılı"
                        />
                    </div>
                    <button type="submit" className="buttonn">Kaydet</button>
                </form>
            </div>
        </div>
    );
}

export default CreateBook;
