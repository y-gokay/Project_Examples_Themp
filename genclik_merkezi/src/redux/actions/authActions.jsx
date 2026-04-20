import { createAsyncThunk } from "@reduxjs/toolkit";
import { getMockResponse } from "../../mocks/index";

const ApiEndpoint = `${import.meta.env.VITE_APP_API_URL}`
const USE_MOCK = import.meta.env.VITE_USE_MOCK === "true"

export const login = createAsyncThunk('login', async (body ) => {
  if (USE_MOCK) return getMockResponse("/admin/login")
  try {
    const response = await fetch(`${ApiEndpoint}/admin/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body)
    });
    const json = await response.json();
    if(json.success == 1){
      console.log(json);
      localStorage.setItem("token", json.data.token)
    }
    return json;
  } catch (error) {
    console.log(error);
    throw error;
  }
});



export const register = createAsyncThunk('register', async (body) => {
  if (USE_MOCK) return getMockResponse("/admin/register")
  try {
    const response = await fetch(`${ApiEndpoint}/admin/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body)
    });
    const json = await response.json();
    return json;
  } catch (error) {
    console.log(error);
    throw error;
  }
});





export const loginUser = createAsyncThunk('loginUser', async (body ) => {
  if (USE_MOCK) return getMockResponse("/user/login")
  try {
    const response = await fetch(`${ApiEndpoint}/user/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body)
    });
    const json = await response.json();
    if(json.success == 1){
      console.log(json);
      localStorage.setItem("token", json.data.token)
    }
    return json;
  } catch (error) {
    console.log(error);
    throw error;
  }
});



export const registerUser = createAsyncThunk('register', async (body) => {
  if (USE_MOCK) return getMockResponse("/user/register")
  try {
    const response = await fetch(`${ApiEndpoint}/user/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body)
    });
    const json = await response.json();
    return json;
  } catch (error) {
    console.log(error);
    throw error;
  }
});
