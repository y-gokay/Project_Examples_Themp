import { useState } from "react";
import Modal from "../../../components/Modal/Modal";

export default function CreateAnnouncement({ open, handleClose, fetchAnnouncements, page }) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    image: null,
  });

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData({
      ...formData,
      [name]: files ? files[0] : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = new FormData();
    data.append("title", formData.title);
    data.append("description", formData.description);
    if (formData.image) {
      data.append("image", formData.image);
    }

    const ApiEndpoint = `${import.meta.env.VITE_APP_API_URL}`;
    try {
      const response = await fetch(`${ApiEndpoint}/admin/create-announcement`, {
        method: "POST",
        body: data,
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      await response.json();
      handleClose();
      setFormData({ title: "", description: "", image: null });
      fetchAnnouncements(page);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <Modal open={open} onClose={handleClose} title="Yeni Duyuru" maxWidth="480px">
      <form onSubmit={handleSubmit}>
        <div className="input-wrap">
          <label htmlFor="title">Başlık</label>
          <input
            type="text"
            id="title"
            name="title"
            className="input"
            value={formData.title}
            onChange={handleChange}
            required
            placeholder="Duyuru başlığı"
          />
        </div>
        <div className="input-wrap">
          <label htmlFor="description">Açıklama</label>
          <textarea
            id="description"
            name="description"
            className="input"
            value={formData.description}
            onChange={handleChange}
            required
            placeholder="Açıklama"
            rows={4}
          />
        </div>
        <div className="input-wrap">
          <label htmlFor="image">Resim</label>
          <input type="file" id="image" name="image" accept="image/*" onChange={handleChange} style={{ fontSize: "13px" }} />
        </div>
        <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end", marginTop: "20px" }}>
          <button type="button" className="btn btn--secondary" onClick={handleClose}>
            İptal
          </button>
          <button type="submit" className="btn btn--primary">
            Oluştur
          </button>
        </div>
      </form>
    </Modal>
  );
}
