import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { login, getCurrentUser } from "../api/axios";
import { translateError } from "../utils/errorTranslations";

export const loginAsync = createAsyncThunk(
  "auth/login",
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const response = await login(email, password);
      const data = response.data;

      const accessToken = data?.accessToken;
      const refreshToken = data?.refreshToken;
      const user = data?.user || null;

      if (!accessToken) {
        return rejectWithValue(
          "Token alınamadı. Endpoint dönüşünü kontrol edin."
        );
      }

      return {
        token: accessToken,
        refreshToken: refreshToken ?? null,
        user: user ?? null,
      };
    } catch (err) {
      // Network hatası
      if (err?.code === "ERR_NETWORK") {
        return rejectWithValue("Sunucuya ulaşılamıyor.");
      }
      
      // 401 hatası (yanlış e-posta/şifre) için özel mesaj
      if (err?.response?.status === 401) {
        const backendMessage = err?.response?.data?.message || 
                               err?.response?.data?.error || 
                               err?.message;
        
        // Eğer backend'den açık bir mesaj geldiyse onu çevir, yoksa varsayılan mesajı göster
        if (backendMessage) {
          const translated = translateError(backendMessage);
          // Eğer çevrilmiş mesaj hala İngilizce görünüyorsa (çeviri bulunamadıysa)
          // veya belirsiz bir mesajsa, varsayılan login hatası mesajını göster
          if (translated === backendMessage && 
              !backendMessage.toLowerCase().includes("email") && 
              !backendMessage.toLowerCase().includes("password") &&
              !backendMessage.toLowerCase().includes("invalid") &&
              !backendMessage.toLowerCase().includes("geçersiz")) {
            return rejectWithValue("Geçersiz e-posta adresi veya şifre");
          }
          return rejectWithValue(translated);
        }
        
        // Mesaj yoksa varsayılan login hatası
        return rejectWithValue("Geçersiz e-posta adresi veya şifre");
      }
      
      // Diğer hatalar için çeviri kullan
      const msg = translateError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          err?.message ||
          "Giriş başarısız."
      );
      return rejectWithValue(msg);
    }
  }
);

export const fetchCurrentUserAsync = createAsyncThunk(
  "auth/fetchCurrentUser",
  async (_, { rejectWithValue }) => {
    try {
      const response = await getCurrentUser();
      const user = response.data?.user || response.data || null;

      if (!user) {
        return rejectWithValue("Kullanıcı bilgileri alınamadı.");
      }

      return { user };
    } catch (err) {
      const msg =
        err?.code === "ERR_NETWORK"
          ? "Sunucuya ulaşılamıyor."
          : translateError(
              err?.response?.data?.message ||
                err?.response?.data?.error ||
                err?.message ||
                "Kullanıcı bilgileri güncellenemedi."
            );
      return rejectWithValue(msg);
    }
  }
);

const saved = JSON.parse(localStorage.getItem("auth") || "null") || {
  token: null,
  refreshToken: null,
  user: null,
};

const slice = createSlice({
  name: "auth",
  initialState: {
    token: saved.token,
    refreshToken: saved.refreshToken,
    user: saved.user,
    loading: false,
    error: null,
  },
  reducers: {
    logout(state) {
      state.token = null;
      state.refreshToken = null;
      state.user = null;
      localStorage.removeItem("auth");
    },
    setUser(state, action) {
      state.user = action.payload;
      localStorage.setItem(
        "auth",
        JSON.stringify({
          token: state.token,
          refreshToken: state.refreshToken,
          user: state.user,
        })
      );
    },
  },
  extraReducers: (b) => {
    b.addCase(loginAsync.pending, (s) => {
      s.loading = true;
      s.error = null;
    });
    b.addCase(loginAsync.fulfilled, (s, a) => {
      s.loading = false;
      s.token = a.payload.token;
      s.refreshToken = a.payload.refreshToken ?? null;
      s.user = a.payload.user;
      localStorage.setItem("auth", JSON.stringify(a.payload));
    });
    b.addCase(loginAsync.rejected, (s, a) => {
      s.loading = false;
      s.error = a.payload || "Giriş başarısız.";
    });
    b.addCase(fetchCurrentUserAsync.pending, (s) => {
      s.loading = true;
      s.error = null;
    });
    b.addCase(fetchCurrentUserAsync.fulfilled, (s, a) => {
      s.loading = false;
      s.user = a.payload.user;
      // LocalStorage'daki auth bilgisini güncelle
      const authData = {
        token: s.token,
        refreshToken: s.refreshToken,
        user: a.payload.user,
      };
      localStorage.setItem("auth", JSON.stringify(authData));
    });
    b.addCase(fetchCurrentUserAsync.rejected, (s, a) => {
      s.loading = false;
      s.error = a.payload || "Kullanıcı bilgileri güncellenemedi.";
    });
  },
});

export const { logout, setUser } = slice.actions;
export default slice.reducer;
