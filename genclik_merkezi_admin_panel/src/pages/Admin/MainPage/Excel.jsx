import axios from "axios";
import { useState } from "react";
import { successToast } from "../../../helpers/toast";

function Excel() {
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);

    const handleDownloadClick = () => {
        // Open Facebook in a new tab
        window.open("http://localhost:5000/api/admin/download", "_blank");
    };

    const handleDownloadClick2 = () => {
        // Open Facebook in a new tab
        window.open("http://localhost:5000/api/admin/downloadClaims", "_blank");
    };
    const handleFileChange = async (event) => {
        const selectedFile = event.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);

            // Create FormData object and append the file

        }
    };

    const ApiEndpoint = `${import.meta.env.VITE_APP_API_URL}`;
    const handleYukle = async () => {
        if (!file || uploading) return;
        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);
        try {
            const response = await axios.post(ApiEndpoint + "/admin/upload", formData, {
                headers: {
                    Authorization: "Bearer " + localStorage.getItem("token")
                }
            });

            if(response.data.success == 1 ){
                successToast("Excel tablosu başarıyla aktarıldı")
            }
        } finally {
            setUploading(false);
        }
    }

    return (
        <div className="w-100">
            <h1 className="page-title">Excel İşlemleri</h1>
            <p className="page-subtitle">Kitapları veya ödünçleri indirin, Excel dosyası yükleyin.</p>

            <div className="content-card">
                <div className="d-flex flex-wrap justify-content-center align-items-center" style={{ gap: '24px', padding: '16px 0' }}>
                    <label
                        className="excellabel"
                        onClick={handleDownloadClick2}
                        style={{ cursor: 'pointer' }}
                    >
                        <i className="fa-solid fa-3x fa-download" style={{ color: 'var(--accent)', marginBottom: '8px' }} />
                        <span>Ödünçleri indir</span>
                    </label>
                    <label
                        className="excellabel"
                        onClick={handleDownloadClick}
                        style={{ cursor: 'pointer' }}
                    >
                        <i className="fa-solid fa-3x fa-download" style={{ color: 'var(--accent)', marginBottom: '8px' }} />
                        <span>Kitapları indir</span>
                    </label>
                    <label className="excellabel" htmlFor="uploadd" style={{ cursor: 'pointer' }}>
                        <i className="fa-solid fa-3x fa-upload" style={{ color: 'var(--accent)', marginBottom: '8px' }} />
                        <span>Excel yükle</span>
                        <input
                            type="file"
                            id="uploadd"
                            className="d-none"
                            onChange={handleFileChange}
                        />
                        {file && (
                            <div className="mt-2 text-center d-flex flex-column align-items-center">
                                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{file.name}</span>
                                <button type="button" onClick={handleYukle} className="btn-accent mt-2" disabled={uploading}>
                                    {uploading ? "Yükleniyor..." : "Yükle"}
                                </button>
                            </div>
                        )}
                    </label>
                </div>
            </div>
        </div>
    );
}

export default Excel;
