import { useEffect, useState } from "react";
import HeroSection from "./HeroSection";
import QuoteSection from "./QuoteSection";

import "./UserMainPage.css";
import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";
import { requestWithAuth } from "../../../helpers/requests";
import { formatDate } from "../../../helpers/formatDate";
import { Dialog, DialogContent, DialogTitle, IconButton } from "@mui/material";

function UserMainPage() {
  const [announcements, setAnnouncements] = useState([]);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

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

  const handleAnnouncementClick = (announcement) => {
    setSelectedAnnouncement(announcement);
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setTimeout(() => setSelectedAnnouncement(null), 200);
  };

  const responsiveNews = {
    desktop: { breakpoint: { max: 3000, min: 1024 }, items: 3 },
    tablet: { breakpoint: { max: 1024, min: 768 }, items: 2 },
    mobile: { breakpoint: { max: 768, min: 0 }, items: 1 },
  };

  return (
    <div
      className="d-flex flex-column"
      style={{ background: "var(--bg-body)" }}
    >
      {/* 1. Hero Section */}
      <HeroSection />

      {/* Quote Section */}
      <QuoteSection />

      {/* Announcements Section */}
      <div className="section-container text-center bg-white py-5">
        <span className="titlee">Duyurular & Haberler</span>
        <div className="mt-4 px-4">
          {announcements?.length > 0 ? (
            <Carousel
              responsive={responsiveNews}
              infinite
              autoPlay
              autoPlaySpeed={4000}
              containerClass="carousel-container"
              itemClass="px-2"
            >
              {announcements.map((element) => (
                <div
                  key={element.id}
                  className="modern-card"
                  style={{
                    height: "420px",
                    cursor: "pointer",
                    display: "flex",
                    flexDirection: "column",
                  }}
                  onClick={() => handleAnnouncementClick(element)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) =>
                    e.key === "Enter" && handleAnnouncementClick(element)
                  }
                >
                  <div
                    className="modern-card-img-wrapper"
                    style={{ height: "60%" }}
                  >
                    <img
                      className="modern-card-img"
                      src={element.imageUrl}
                      alt={element.title}
                    />
                  </div>
                  <div className="modern-card-body text-start">
                    <h5 className="modern-card-title">{element.title}</h5>
                    <p className="modern-card-text">
                      {element.description.length > 120
                        ? element.description.substring(0, 120) + "..."
                        : element.description}
                    </p>
                  </div>
                </div>
              ))}
            </Carousel>
          ) : (
            <div className="no-announcements" style={{ padding: "3rem 0" }}>
              <i className="fa-regular fa-newspaper fa-3x mb-3"></i>
              <p className="mb-1">
                Şu an görüntülenecek bir duyuru veya haber bulunmamaktadır.
              </p>
              <p className="text-muted" style={{ fontSize: "0.9rem" }}>
                Yeni duyuru ve etkinlikler eklendiğinde burada görebilirsiniz.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Padding bottom for footer */}
      <div style={{ height: "4rem" }}></div>

      <Dialog
        open={modalOpen}
        onClose={handleModalClose}
        maxWidth="md"
        fullWidth
        PaperProps={{ style: { borderRadius: "12px" } }}
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
            onClick={handleModalClose}
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
}

export default UserMainPage;
