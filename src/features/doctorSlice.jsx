import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

//if you want to test the application locally you need to change url to http://localhost:3000/api/v1/users
//test the app with apis locally change url to https://doctors-api-app.onrender.com/api/v1/users
const BASE_URL = 'http://localhost:3000/api/v1/users';

const initialState = {
  status: 'idle',
  error: null,
  references: null,
  doctors: [],
  authToken: sessionStorage.getItem('authToken') || null,
};

// Async Thunk for adding a doctor
export const addDoctor = createAsyncThunk('doctors/addDoctor', async (doctorData) => {
  try {
     const response = await axios.post(BASE_URL, {
      user: {
        name: doctorData.name,
        age: doctorData.age,
        email: doctorData.email,
        photo: doctorData.photo,
        role: 'doctor',
        password: doctorData.password,
        password_confirmation: doctorData.password_confirmation,
        qualification: doctorData.qualification,
        description: doctorData.description,
        experiences: doctorData.experiences,
        available_from: doctorData.available_from,
        available_to: doctorData.available_to,
        consultation_fee: doctorData.consultation_fee,
        rating: doctorData.rating,
        specialization: doctorData.specialization,
        address: {
          street: doctorData.address.street,
          city: doctorData.address.city,
          state: doctorData.address.state,
          zip_code: doctorData.address.zip_code,
        },
      },
    });
    return response.data;
  } catch (error) {
    throw new Error(error.message);
  }
});

// Async Thunk for fetching doctors
export const fetchDoctors = createAsyncThunk('doctors/fetchDoctors', async () => {
  try {
    // if you want to test the application locally just change url to http://localhost:3000/api/v1/users?role=doctor
    // test the app with apis locally change url to https://doctors-api-app.onrender.com/api/v1/users?role=doctor 
    const response = await axios.get('http://localhost:3000/api/v1/users?role=doctor', {
      headers: {
        Authorization: sessionStorage.getItem('authToken'),
      },
    });
    return response.data;
    
  } catch (error) {
    throw new Error(error.message);
  }
});

export const deleteDoctor = createAsyncThunk(
  'appointments/deleteDoctor',
  async (doctorId, { rejectWithValue }) => {
    try {
      // if you want to test the application locally just change url to http://localhost:3000/api/v1/users/${doctorId}
      // test the app with apis locally change url to https://doctors-api-app.onrender.com/api/v1/users/${doctorId}
      await axios.delete(`http://localhost:3000/api/v1/users/${doctorId}`, {
        headers: {
          Authorization: sessionStorage.getItem('authToken'),
        },
      });
      return doctorId;
    } catch (error) {
      const { message, references } = error.response.data;
      return rejectWithValue({ message, references });
    }
  },
);

const doctorsSlice = createSlice({
  name: 'doctors',
  initialState,
  reducers: {
    setAuthToken(state, action) {
      state.authToken = action.payload;
    },
    // Other synchronous reducers here if needed
  },
  extraReducers: (builder) => {
    builder
      .addCase(addDoctor.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(addDoctor.fulfilled, (state) => {
        state.status = 'succeeded';
      })
      .addCase(addDoctor.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      .addCase(fetchDoctors.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchDoctors.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.doctors = action.payload;
      })
      .addCase(fetchDoctors.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
          })
      .addCase(deleteDoctor.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(deleteDoctor.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.doctors = state.doctors.filter(
          (doctor) => doctor.id !== action.payload,
        );
      })
      .addCase(deleteDoctor.rejected, (state, action) => {
        const { message, references } = action.payload;
        state.status = 'failed';
        state.error = message;
        state.references = references;
      });
  },
});

export const { setAuthToken } = doctorsSlice.actions;

export default doctorsSlice.reducer;