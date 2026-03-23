import { create } from 'zustand'
import { jwtDecode } from 'jwt-decode'
import axios from 'axios'
import toast from 'react-hot-toast'

// Set default axios base url
axios.defaults.baseURL = 'http://localhost:5000/api'

export const useStore = create((set, get) => ({
  user: null,
  token: localStorage.getItem('token') || null,
  profile: null,
  files: [],
  isProfileIncomplete: false,

  initAuth: () => {
    const token = get().token;
    if (token) {
      try {
        const decoded = jwtDecode(token);
        if (decoded.exp * 1000 < Date.now()) {
          get().logout();
        } else {
          set({ user: decoded });
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        }
      } catch (e) {
        get().logout();
      }
    }
  },

  login: async (email, password) => {
    try {
      const res = await axios.post('/auth/login', { email, password });
      const { token } = res.data;
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      set({ token, user: jwtDecode(token) });
      return true;
    } catch (error) {
      toast.error(error.response?.data?.error || 'Login failed');
      return false;
    }
  },

  signup: async (email, password) => {
    try {
      const res = await axios.post('/auth/signup', { email, password });
      const { token } = res.data;
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      set({ token, user: jwtDecode(token) });
      return true;
    } catch (error) {
      toast.error(error.response?.data?.error || 'Signup failed');
      return false;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    set({ user: null, token: null, profile: null, files: [] });
  },

  fetchProfile: async () => {
    try {
      const res = await axios.get('/profile');
      const profile = res.data.profile;
      set({ profile });

      const incomplete = !profile.regulation || !profile.year || !profile.semester;
      set({ isProfileIncomplete: incomplete });
      return profile;
    } catch (error) {
      console.error(error);
      return null;
    }
  },

  updateProfile: async (data) => {
    try {
      const res = await axios.put('/profile', data);
      set({ profile: res.data.profile, isProfileIncomplete: false });
      toast.success('Profile updated');
      return true;
    } catch (error) {
      toast.error('Failed to update profile');
      return false;
    }
  },

  fetchFiles: async () => {
    try {
      const res = await axios.get('/files');
      set({ files: res.data.files, isProfileIncomplete: res.data.isProfileIncomplete || false });
    } catch (error) {
      console.error(error);
    }
  },

  uploadFile: async (formData) => {
    try {
      await axios.post('/files', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('File uploaded');
      get().fetchFiles();
      return true;
    } catch (error) {
      toast.error(error.response?.data?.error || 'Upload failed');
      return false;
    }
  },

  deleteFile: async (id) => {
    try {
      await axios.delete(`/files/${id}`);
      toast.success('File deleted');
      get().fetchFiles();
    } catch (e) {
      toast.error('Failed to delete file');
    }
  }
}))