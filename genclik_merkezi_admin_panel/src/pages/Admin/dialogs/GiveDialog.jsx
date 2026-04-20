import * as React from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import axios from 'axios';
import { errorToast, successToast } from '../../../helpers/toast';

export default function GiveDialog({ open, handleClose, fetchBooks, page }) {
  const [formData, setFormData] = React.useState({
    bookID: open?.id,
    userName: "",
    userSurname: "",
    userPhoneNumber: "",
    userEmail: "",
    startDate: new Date().toISOString().slice(0, 10),
    endDate: ""
  });
  const [submitting, setSubmitting] = React.useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value
    }));
  };

  const handlePhoneChange = (e) => {
    let value = e.target.value.replace(/\D/g, "");
    if (!value) {
      setFormData(prev => ({ ...prev, userPhoneNumber: "" }));
      return;
    }
    if (value[0] !== "5") {
      value = "5" + value.slice(1);
    }
    if (value.length > 10) {
      value = value.slice(0, 10);
    }
    setFormData(prev => ({ ...prev, userPhoneNumber: value }));
  };

  React.useEffect(() => {
    setFormData({
      ...formData,
      bookID: open?.id,
    })
  }, [open]);

  const ApiEndpoint = `${import.meta.env.VITE_APP_API_URL}`;


  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    try {
      const response = await axios.post(ApiEndpoint + "/admin/give-book", formData, {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token")
        }
      });

      if (response.data.success == 1) {
        successToast("Başarıyla ödünç verildi")
      } else {
        errorToast(response.data?.data || "Ödünç verilemedi");
      }
      handleClose();
      fetchBooks(page);
    } catch (err) {
      errorToast("Bir hata oluştu");
    } finally {
      setSubmitting(false);
    }
  };
  return (
    <React.Fragment>
      <Dialog
        open={open}
        onClose={handleClose}
      >
        <DialogTitle>{open?.name}</DialogTitle>
        <DialogContent>
          <div className='d-flex flex-column'>

            <input
              className="inpodunc border border-2 "
              type="text"
              name="userName"
              value={formData.userName}
              onChange={handleChange}
              placeholder="Ödünç Alan İsmi"
            />
            <input
              className="inpodunc border border-2 "
              type="text"
              name="userSurname"
              value={formData.userSurname}
              onChange={handleChange}
              placeholder="Ödünç Alan Soyadı"
            />
            <input
              className="inpodunc border border-2 "
              type="text"
              name="userPhoneNumber"
              value={formData.userPhoneNumber}
              onChange={handlePhoneChange}
              maxLength={10}
              placeholder="Ödünç Alan Telefon"
            />
            <input
              className="inpodunc border border-2 "
              type="text"
              name="userEmail"
              value={formData.userEmail}
              onChange={handleChange}
              placeholder="Ödünç Alan Email"
            />

            <div className="d-flex mb-2">
              <div className="d-flex flex-column">
                <span>Başlangıç</span>
                <input
                  disabled
                  value={formData.startDate}
                  type="date"
                />
              </div>
              <div className="d-flex flex-column">
                <span>Bitiş</span>
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                />
              </div>
            </div>

            <button
              onClick={handleSubmit}
              type="submit"
              className="buttonlogin"
              disabled={submitting}
            >
              {submitting ? "Ödünç veriliyor..." : "Ödünç Ver"}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </React.Fragment>
  );
}
