import { Menu } from '@mui/material';
import { useEffect } from 'react';
import { requestWithAuth } from '../../../helpers/requests';
import { useDispatch, useSelector } from 'react-redux';
import { setNotificationCount } from '../../../redux/features/authSlice';
import "../../../components/Header/header.css"; // Ensure styles are applied

export default function Notifications({ notifications, anchorEl, open, handleClose }) {
  const dispatch = useDispatch();

  const setSeen = async () => {
    try {
      const notifIDS = notifications?.map(n => n.id) || [];
      if (notifIDS.length > 0) {
        dispatch(setNotificationCount(0));
        await requestWithAuth("post", "/user/saw-all-notifs", "", "", { notifIDS });
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (open && notifications?.length > 0) {
      setSeen();
    }
  }, [open]);

  return (
    <Menu
      id="notifications-menu"
      anchorEl={anchorEl}
      open={open}
      onClose={handleClose}
      className="notifications-menu"
      transformOrigin={{ horizontal: 'right', vertical: 'top' }}
      anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      disableScrollLock={true}
    >
      <div className="notifications-header">
        <h4 className="notifications-title">Bildirimler</h4>
        {/* <span className="mark-all-read">Tümünü Okundu İşaretle</span> */}
      </div>

      {notifications?.length > 0 ? (
        notifications.slice().reverse().map((element) => ( // Show newest first
          <div
            className={`notification-item ${!element.seen ? 'unread' : ''}`}
            key={element.id}
            onClick={handleClose} // Close menu on click
          >
            <div className="notification-icon">
              <i className="fa-solid fa-bell"></i>
            </div>
            <div className="notification-content">
              <span className="notification-text fw-bold">
                {element.title}
              </span>
              <span className="notification-text">
                {element.content}
              </span>
              {/* If you have a date, add it here */}
              {/* <span className="notification-time">2 saat önce</span> */}
            </div>
          </div>
        ))
      ) : (
        <div className="empty-notifications">
          <i className="fa-regular fa-bell-slash fa-2x"></i>
          <span>Henüz bildiriminiz yok.</span>
        </div>
      )}
    </Menu>
  );
}
