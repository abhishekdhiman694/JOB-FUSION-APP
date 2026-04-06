import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import * as SecureStore from 'expo-secure-store';

export interface User {
  _id: string;
  name: string;
  email: string;
  avatarUrl?: string; // New field
  resumeUrls?: string[]; // Multiple resumes array
  skills?: string[];
  experienceLevel?: string;
  connectedAccounts?: string[]; // Tracking linked platforms
  preferences?: {
      locations?: string[];
      roles?: string[];
      jobType?: string[];
      salaryMin?: number;
      salaryMax?: number;
  };
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuth: (state, action: PayloadAction<{ user: User; token: string }>) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      SecureStore.deleteItemAsync('auth_token');
    },
    updateUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
    },
  },
});

export const { setAuth, logout, updateUser } = authSlice.actions;
export default authSlice.reducer;
