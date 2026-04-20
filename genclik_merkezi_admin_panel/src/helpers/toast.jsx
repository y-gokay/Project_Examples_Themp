import { Bounce, toast } from "react-toastify";

export const errorToast = (errormsg) => {
    
    return toast.error(errormsg, {
        position: "bottom-right",
        autoClose: 3000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
        progress: undefined,
        theme: "light",
        transition: Bounce,
    });
}
export const successToast = (errormsg) => {
    
    return toast.success(errormsg, {
        position: "bottom-right",
        autoClose: 3000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
        progress: undefined,
        theme: "light",
        transition: Bounce,
    });
}