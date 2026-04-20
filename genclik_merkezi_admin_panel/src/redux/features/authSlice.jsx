import { createSlice } from '@reduxjs/toolkit'
import { login } from '../actions/authActions';

const initialState = {
  logged: false,
  userId: null,
  accessToken: null,
  openLoginDialog: false,
}

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setLoggedStatus: (state, action) => {
      state.logged = action.payload;
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
  },

});

export const { setLoggedStatus, setLoginDialogState } = authSlice.actions

export default authSlice.reducer;
