import axios from "axios";
import { useEffect, useState } from "react";
import { errorToast, successToast } from "../../../helpers/toast";
import { registerUser } from "../../../redux/actions/authActions";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

function RegisterUserAdmin() {

    const [formData, setFormData] = useState({
        name: '',
        surname: '',
        tc: null,
        birthDay: '',
        phoneNumber: ""
    });
    const [submitting, setSubmitting] = useState(false);
    const [errors, setErrors] = useState({
        tc: "",
        phoneNumber: "",
    });

    const ApiEndpoint = `${import.meta.env.VITE_APP_API_URL}`;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevFormData => ({
            ...prevFormData,
            [name]: value
        }));
    };

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const validatePhone = (value) => {
        const regex = /^5\d{9}$/;
        if (!regex.test(value)) {
            return "Telefon numarası 5 ile başlamalı ve 10 haneli olmalıdır (örn: 5xxxxxxxxx).";
        }
        return null;
    };

    const validateTc = (value) => {
        if (!value) return "TC Kimlik numarası zorunludur.";
        const tcStr = String(value);
        if (!/^[0-9]{11}$/.test(tcStr)) {
            return "TC Kimlik numarası 11 haneli ve sadece rakamlardan oluşmalıdır.";
        }
        if (tcStr[0] === "0") {
            return "TC Kimlik numarasının ilk hanesi 0 olamaz.";
        }
        const digits = tcStr.split("").map((d) => parseInt(d, 10));
        const oddSum = digits[0] + digits[2] + digits[4] + digits[6] + digits[8];
        const evenSum = digits[1] + digits[3] + digits[5] + digits[7];
        const digit10 = ((oddSum * 7) - evenSum) % 10;
        if (digit10 !== digits[9]) {
            return "TC Kimlik numarası geçersiz (10. hane kontrolü).";
        }
        const digit11 = (digits.slice(0, 10).reduce((a, b) => a + b, 0)) % 10;
        if (digit11 !== digits[10]) {
            return "TC Kimlik numarası geçersiz (11. hane kontrolü).";
        }
        return null;
    };

    const handleTcChange = (e) => {
        let value = e.target.value.replace(/\D/g, "");
        if (!value) {
            setFormData(prev => ({ ...prev, tc: "" }));
            setErrors(prev => ({ ...prev, tc: "" }));
            return;
        }
        if (value.length > 11) {
            value = value.slice(0, 11);
        }
        setFormData(prev => ({ ...prev, tc: value }));
        const tcError = validateTc(value);
        setErrors(prev => ({ ...prev, tc: tcError || "" }));
    };

    const handlePhoneChange = (e) => {
        let value = e.target.value.replace(/\D/g, "");
        if (!value) {
            setFormData(prev => ({ ...prev, phoneNumber: "" }));
            setErrors(prev => ({ ...prev, phoneNumber: "" }));
            return;
        }
        if (value[0] !== "5") {
            value = "5" + value.slice(1);
        }
        if (value.length > 10) {
            value = value.slice(0, 10);
        }
        setFormData(prev => ({ ...prev, phoneNumber: value }));
        const phoneError = validatePhone(value);
        setErrors(prev => ({ ...prev, phoneNumber: phoneError || "" }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const phoneError = validatePhone(formData.phoneNumber);
        if (phoneError) {
            setErrors(prev => ({ ...prev, phoneNumber: phoneError }));
            errorToast(phoneError);
            return;
        }

        const tcError = validateTc(formData.tc);
        if (tcError) {
            setErrors(prev => ({ ...prev, tc: tcError }));
            errorToast(tcError);
            return;
        }

        setSubmitting(true);
        dispatch(registerUser(formData)).then((res) => {
            setSubmitting(false);
            if (res.payload.success === 1) {
                successToast("Başarıyla Kaydedildi");
            } else {
                errorToast(res.payload.message);
            }
        }).catch(() => {
            setSubmitting(false);
        });
    };

    return (
        <div className="w-100">
            <h1 className="page-title">Kullanıcı Kaydet</h1>
            <p className="page-subtitle">Yeni kullanıcı bilgilerini girin.</p>

            <div className="form-container formrespon">
                <form autoComplete="off" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <input
                            className="inplogin"
                            placeholder="İsim *"
                            name="name"
                            type="text"
                            required
                            autoComplete="off"
                            value={formData.name}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="form-group">
                        <input
                            className="inplogin"
                            placeholder="Soyisim *"
                            name="surname"
                            type="text"
                            autoComplete="off"
                            required
                            value={formData.surname}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="form-group">
                        <input
                            className="inplogin"
                            placeholder="TC kimlik numarası *"
                            name="tc"
                            type="text"
                            autoComplete="off"
                            required
                            maxLength={11}
                            value={formData.tc ?? ""}
                            onChange={handleTcChange}
                        />
                        {errors.tc && (
                            <p style={{ color: "var(--danger)", fontSize: "12px", marginTop: "4px" }}>
                                {errors.tc}
                            </p>
                        )}
                    </div>
                    <div className="form-group">
                        <input
                            className="inplogin"
                            placeholder="Telefon * (5xxxxxxxxx)"
                            name="phoneNumber"
                            type="text"
                            required
                            autoComplete="off"
                            minLength={10}
                            maxLength={10}
                            value={formData.phoneNumber}
                            onChange={handlePhoneChange}
                        />
                        {errors.phoneNumber && (
                            <p style={{ color: "var(--danger)", fontSize: "12px", marginTop: "4px" }}>
                                {errors.phoneNumber}
                            </p>
                        )}
                    </div>
                    <div className="form-group">
                        <input
                            className="inplogin"
                            placeholder="Doğum tarihi *"
                            name="birthDay"
                            type="date"
                            autoComplete="off"
                            required
                            value={formData.birthDay}
                            onChange={handleChange}
                        />
                    </div>
                    <p style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "8px" }}>
                        * Zorunlu alanlar
                    </p>
                    <button className="buttonn" type="submit" disabled={submitting}>
                        {submitting ? "Kaydediliyor..." : "Kaydet"}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default RegisterUserAdmin;
