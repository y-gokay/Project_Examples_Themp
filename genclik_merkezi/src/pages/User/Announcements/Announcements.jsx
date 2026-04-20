import React, { useEffect, useState } from "react";
import "./announcements.css";
import { requestWithAuth } from "../../../helpers/requests";
import { formatDate } from "../../../helpers/formatDate";
import { Dialog, DialogContent, DialogTitle, IconButton } from "@mui/material";

const Announcements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [open, setOpen] = useState(false);

  const getAnnouncements = async () => {
    try {
      const resp = await requestWithAuth("get", "/admin/get-announcements");
      setAnnouncements(resp.data.announcements);
    } catch (error) {
      console.error("Error fetching announcements:", error);
    }
  };

  useEffect(() => {
    getAnnouncements();
  }, []);

  const handleOpen = (announcement) => {
    setSelectedAnnouncement(announcement);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setTimeout(() => setSelectedAnnouncement(null), 200); // transition bittikten sonra temizle
  };

  return (
    <div className="announcements-container">
      <div className="page-header">
        <h1 className="page-title">Duyurular ve Etkinlikler</h1>
        <p className="page-subtitle">
          Kütüphanemizle ilgili en güncel haberler, etkinlik takvimi ve önemli
          duyuruları buradan takip edebilirsiniz.
        </p>
      </div>

      <div className="announcements-grid">
        {announcements?.length > 0 ? (
          announcements.map((announcement) => (
            <div
              key={announcement.id}
              className="announcement-card"
              onClick={() => handleOpen(announcement)}
              style={{ cursor: "pointer" }}
            >
              <div className="announcement-img-container">
                <img
                  src={
                    announcement.imageUrl ||
                    "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                  }
                  alt={announcement.title}
                  className="announcement-img"
                />
              </div>
              <div className="announcement-content">
                <span className="announcement-date">
                  <i className="fa-regular fa-calendar"></i>
                  {formatDate(announcement.createdAt).slice(0, 10)}
                </span>
                <h3 className="announcement-title">{announcement.title}</h3>
                <p className="announcement-text">{announcement.description}</p>
                <button className="read-more-btn">
                  Devamını Oku <i className="fa-solid fa-arrow-right"></i>
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="no-announcements">
            <i className="fa-regular fa-newspaper fa-3x mb-3"></i>
            <p>Henüz yayınlanmış bir duyuru bulunmamaktadır.</p>
          </div>
        )}
      </div>

      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          style: { borderRadius: "12px" },
        }}
      >
        <DialogTitle
          sx={{
            m: 0,
            p: 2,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-heading)",
              fontWeight: 700,
              color: "var(--primary-color)",
              fontSize: "1.4rem",
            }}
          >
            {selectedAnnouncement?.title}
          </span>
          <IconButton
            onClick={handleClose}
            sx={{ color: (theme) => theme.palette.grey[500] }}
          >
            <i className="fa-solid fa-xmark"></i>
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {selectedAnnouncement && (
            <>
              <img
                src={
                  selectedAnnouncement.imageUrl ||
                  "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                }
                alt={selectedAnnouncement.title}
                style={{
                  width: "100%",
                  maxHeight: "400px",
                  objectFit: "cover",
                  borderRadius: "8px",
                  marginBottom: "1.5rem",
                }}
              />
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  color: "var(--text-light)",
                  marginBottom: "1.5rem",
                  fontSize: "0.95rem",
                }}
              >
                <i className="fa-regular fa-calendar"></i>
                {formatDate(selectedAnnouncement.createdAt).slice(0, 10)}
              </div>
              <p
                style={{
                  color: "var(--text-secondary)",
                  lineHeight: 1.7,
                  fontSize: "1.05rem",
                  whiteSpace: "pre-wrap",
                  margin: 0,
                }}
              >
                {selectedAnnouncement.description}
              </p>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Announcements;
