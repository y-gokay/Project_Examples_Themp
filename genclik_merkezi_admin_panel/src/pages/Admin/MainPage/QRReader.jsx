import { useEffect, useRef } from "react";
import QrScanner from "qr-scanner";
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
const QRReader = ({ isQrOn, onToggleQrScanner, onScanSuccess }) => {
  const scanner = useRef();
  const videoEl = useRef(null);
  const qrBoxEl = useRef(null);

  // Fail
  const audioEl = useRef(new Audio("../../../public/beep.mp3")); // Add path to your success sound file

  const onScanFail = (err) => {
    console.log(err);
  };
  useEffect(() => {
    if (isQrOn && videoEl.current && !scanner.current) {
      // 👉 Instantiate the QR Scanner
      scanner.current = new QrScanner(videoEl.current, (result) => {
        audioEl.current.play(); // Play sound on successful scan
        onScanSuccess(result.data);
        onToggleQrScanner(); // Stop QR scanner after successful scan
      }, {
        onDecodeError: onScanFail,
        preferredCamera: "environment",
        highlightScanRegion: true,
        highlightCodeOutline: true,
        overlay: qrBoxEl.current || undefined,
      });

      // 🚀 Start QR Scanner
      scanner.current
        .start()
        .catch((err) => {
          if (err) onToggleQrScanner(); // Handle error and toggle off
        });
    } else if (!isQrOn && scanner.current) {
      // Stop QR Scanner when isQrOn is false
      scanner.current.stop();
      scanner.current = null;
    }

    // 🧹 Clean up on unmount.
    return () => {
      if (scanner.current) {
        scanner.current.stop();
      }
    };
  }, [isQrOn, onToggleQrScanner, onScanSuccess, onScanFail]);

  return (
    <div className="qr-reader">
      <button className="buttonqrscanner text-center d-flex justify-content-center w-100" onClick={onToggleQrScanner}>
        {isQrOn ?
          <div className="mb-3 d-flex flex-column">

            <i className="fa-solid fa-video-slash fa-2x"></i>
            <span>
              Taramayı Kapat
            </span>
          </div> : <div className="mb-3 d-flex flex-column">
            <i className="fa-solid fa-video fa-2x"></i>
            <span>
              QR Kod Tara
            </span>
          </div>}
      </button>
      {isQrOn && (
        <div style={{ width: "200px" }}> {/* Adjust the dimensions here */}
          <video ref={videoEl} style={{ width: "100%", height: "100%" }}></video>
          <div ref={qrBoxEl} className="qr-box" style={{ width: "100%", height: "100%" }}></div>
        </div>
      )}
    </div>
  );
};

export default QRReader;
