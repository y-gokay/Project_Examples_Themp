import { createSlice } from '@reduxjs/toolkit'
import { login, loginUser } from '../actions/authActions';

// Sayfa yenilendiğinde localStorage'daki token'a göre login bilgisini koru
const tokenFromStorage = typeof window !== 'undefined'
  ? localStorage.getItem('token')
  : null;

const initialState = {
  logged: !!tokenFromStorage,
  userId: null,
  accessToken: tokenFromStorage,

  notifications: [],
  notificationCount: 0,

  // Kullanıcı tarafı login durumu
  loggedUser: !!tokenFromStorage,
  openLoginDialog: false,
}

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setLoggedStatus: (state, action) => {
      state.logged = action.payload;
    },
    setNotifications: (state, action) => {
      state.notifications = action.payload;

      for (const iterator of action.payload) {
        if(iterator.seen != true) {
          state.notificationCount += 1
        }
      }
    },
    setNotificationCount: (state, action) => {
      state.notificationCount = action.payload
    },
    setLoginDialogState: (state, action) => {
      state.openLoginDialog = action.payload;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(login.fulfilled, (state, action) => {
        if (action.payload.success == 1) {
          console.log(action.payload);
          localStorage.setItem("token", action.payload.data.token)
          state.logged = true

        }
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        if (action.payload.success == 1) {
          console.log(action.payload);
          localStorage.setItem("token", action.payload.data.token)
          state.loggedUser = true

        }
      })
  },

});

export const {setLoggedStatus , setLoginDialogState , setNotifications,setNotificationCount } = authSlice.actions

export default authSlice.reducer;
