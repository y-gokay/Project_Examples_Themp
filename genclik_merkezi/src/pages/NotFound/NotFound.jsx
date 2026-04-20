import { Link } from 'react-router-dom';
import './NotFound.css';

const NotFound = () => {
  return (
    <div className="notfound-container">
      <div className="notfound-content">
        <div className="notfound-icon">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 8V12M12 16H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" 
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        
        <h1 className="notfound-code">404</h1>
        <h2 className="notfound-title">Sayfa Bulunamadı</h2>
        <p className="notfound-description">
          Aradığınız sayfa mevcut değil veya taşınmış olabilir.
        </p>
        
        <div className="notfound-actions">
          <Link to="/" className="notfound-btn notfound-btn-primary">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 12L5 10M5 10L12 3L19 10M5 10V20C5 20.5523 5.44772 21 6 21H9M19 10L21 12M19 10V20C19 20.5523 18.5523 21 18 21H15M9 21C9.55228 21 10 20.5523 10 20V16C10 15.4477 10.4477 15 11 15H13C13.5523 15 14 15.4477 14 16V20C14 20.5523 14.4477 21 15 21M9 21H15" 
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Ana Sayfaya Dön
          </Link>
          <button onClick={() => window.history.back()} className="notfound-btn notfound-btn-secondary">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M10 19L3 12M3 12L10 5M3 12H21" 
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Geri Git
          </button>
        </div>
      </div>
      
      <div className="notfound-decoration">
        <div className="notfound-circle notfound-circle-1"></div>
        <div className="notfound-circle notfound-circle-2"></div>
        <div className="notfound-circle notfound-circle-3"></div>
      </div>
    </div>
  );
};

export default NotFound;
