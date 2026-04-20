
import { useState } from "react";
import "./mainpage.css"
import Books from "./Books";
import Excel from "./Excel";
import ClaimForm from "./ClaimForm";
import CreateBook from "./CreateBook";
import Claims from "./Claims";
import QuickDeliver from "../dialogs/QuickDeliver";
import Users from "./Users";
import Announcements from "./Announcements";
import RegisterUserAdmin from "./RegisterUserAdmin";

const NAV_ITEMS = [
    {
        label: "Kullanıcılar",
        group: "Kullanıcı Yönetimi",
        page: 0,
        icon: (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
        ),
    },
    {
        label: "Kullanıcı Kaydet",
        group: null,
        page: 11,
        icon: (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                <line x1="16" y1="11" x2="22" y2="11" /><line x1="19" y1="8" x2="19" y2="14" />
            </svg>
        ),
    },
    {
        label: "Kitaplar",
        group: "Kütüphane",
        page: 1,
        icon: (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            </svg>
        ),
    },
    {
        label: "Kitap Ekle",
        group: null,
        page: 2,
        icon: (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" /><line x1="12" y1="18" x2="12" y2="12" />
                <line x1="9" y1="15" x2="15" y2="15" />
            </svg>
        ),
    },
    {
        label: "Ödünç Formu",
        group: "Ödünç İşlemleri",
        page: 3,
        icon: (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
            </svg>
        ),
    },
    {
        label: "Ödünç Verilmişler",
        group: null,
        page: 4,
        icon: (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
            </svg>
        ),
    },
    {
        label: "Duyurular",
        group: "Diğer",
        page: 7,
        icon: (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
        ),
    },
    {
        label: "Excel İşlemleri",
        group: null,
        page: 6,
        icon: (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10 9 9 9 8 9" />
            </svg>
        ),
    },
];

function MainPage() {
    const [open, setOpen] = useState(false);
    const [showingPage, setShowingPage] = useState(0);

    const activeItem = NAV_ITEMS.find(i => i.page === showingPage);

    return (
        <div className="admin-shell">
            <QuickDeliver open={open} handleClose={() => setOpen(false)} />

            {/* ── Sidebar ── */}
            <aside className="admin-sidebar">
                {NAV_ITEMS.map((item, idx) => {
                    const prev = idx > 0 ? NAV_ITEMS[idx - 1] : null;
                    const showGroupLabel = item.group && (!prev || prev.group !== item.group);
                    return (
                        <span key={item.page}>
                            {showGroupLabel && (
                                <span>
                                    {idx !== 0 && <div className="sidebar-divider" />}
                                    <div className="sidebar-section-label">{item.group}</div>
                                </span>
                            )}
                            <button
                                onClick={() => setShowingPage(item.page)}
                                className={`sidebar-btn ${showingPage === item.page ? "active" : ""}`}
                            >
                                {item.icon}
                                {item.label}
                            </button>
                        </span>
                    );
                })}

                <div className="sidebar-divider" />
                <button onClick={() => setOpen(true)} className="sidebar-quick-btn">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                    </svg>
                    Hızlı Teslim
                </button>
            </aside>

            {/* ── Content ── */}
            <main className="admin-content">
                {showingPage === 0 && <Users />}
                {showingPage === 11 && <RegisterUserAdmin />}
                {showingPage === 1 && <Books />}
                {showingPage === 2 && <CreateBook />}
                {showingPage === 3 && <ClaimForm />}
                {showingPage === 4 && <Claims />}
                {showingPage === 6 && <Excel />}
                {showingPage === 7 && <Announcements />}
            </main>
        </div>
    );
}

export default MainPage;