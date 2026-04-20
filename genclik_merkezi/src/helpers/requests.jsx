import { setLoggedStatus } from "../redux/features/authSlice"
import { getMockResponse } from "../mocks/index"

const ApiEndpoint = `${import.meta.env.VITE_APP_API_URL}`
const USE_MOCK = import.meta.env.VITE_USE_MOCK === "true"

const getToken = () => {
    return localStorage.getItem("token")
}

export const requestWithAuth = async (method, url, action, api, body) => {
    if (USE_MOCK) {
        if (!localStorage.getItem("token")) localStorage.setItem("token", "mock-token-demo")
        return getMockResponse(`${url}${action || ""}`)
    }
    try {
        const token = getToken()


        const response = await fetch(`${ApiEndpoint}${url}${action != null ? action : ""}`, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                "Authorization": "Bearer " + token,
            },
            body: JSON.stringify(body)
        });
        const json = await response.json();

        if(response.status == 401 && api){
            api.dispatch(setLoggedStatus(false))
            localStorage.removeItem("token")
            window.location.href = '/giris';
        }
        // if (json.err?.name === "TokenExpiredError" || json.err?.name === "JsonWebTokenError") {
    
        //     const req = await tryLoginOnPageLoaded()
        //     if (req == true) {
        //         api.dispatch(setLoggedStatus(true))
        //         api.dispatch(getFeaturedPlacesMainPageWithAuth())
        //         api.dispatch(getUserTickets())
        //         requestWithAuth(method , url, action , api, body)
        //     } else {
        //         api.dispatch(setLoggedStatus(false))
        //         api.dispatch(getFeaturedPlacesMainPage())
    
        //     }
    
        // }
        return json
        
    } 
    
    catch (error) {
        console.log(error);
        console.log("errore girdi");
        
    }
}

export const requestWithoutAuth = async (method, url, action, api, body) => {
    if (USE_MOCK) return getMockResponse(`${url}${action || ""}`)
    const response = await fetch(`${ApiEndpoint}${url}${action != null ? action : ""}`, {
        method: method,
        headers: {
            'Content-Type': 'application/json',
        },

        body: JSON.stringify(body)
    });
    const json = await response.json();
    return json

}


// export const tryLoginOnPageLoaded = async () => {
//     if (getToken()) {

//         const req = await fetch(ApiEndpoint + "/users/get-my-profile", {
//             method: "GET",
//             headers: {
//                 "Authorization": "Bearer " + localStorage.getItem("token")

//             }

//         })
//         const res = await req.json()
//         if (res.success == 1) {
//             return true
//         } else {
//             if (getRefreshToken()) {
//                 const req = await fetch(ApiEndpoint + "/users/set-new-token", {
//                     method: "PATCH",
//                     headers: {
//                         "Content-Type": "application/json",
//                     },
//                     body: JSON.stringify({
//                         refreshToken: getRefreshToken()
//                     })

//                 })
//                 const res = await req.json()

//                 if (res.success == 1) {
//                     localStorage.setItem("token", res?.data[0]?.accessToken)
//                     return true
//                 } else {
//                     return false
//                 }

//             }
//         }
//     }
// }