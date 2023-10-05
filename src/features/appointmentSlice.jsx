import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
const initialState = {
  status: 'idle',
  error: null,
  appointments: [],
  patients: [],
  doctors: [],
  authToken: sessionStorage.getItem('authToken') || null,
};

export const addAppointment = createAsyncThunk(
  'appointments/addAppointment',
  async (formData) => {
    try {
      // if you want to test the application locally just change url to http://localhost:3000/api/v1/appointments
      // test the app with apis locally change url to https://doctors-api-app.onrender.com/api/v1/appointments
      const response = await axios.post('https://doctors-api-app.onrender.com/api/v1/appointments', formData, {
        headers: {
          Authorization: sessionStorage.getItem('authToken'),
        },
      });
      return response.data;
    } catch (error) {
      throw new Error(error.message);
    }
  },
);

export const fetchAppointments = createAsyncThunk('appointments/fetchAppointments', async () => {
  try {
    // if you want to test the application locally just change url to http://localhost:3000/api/v1/appointments
    // test the app with apis locally change url to https://doctors-api-app.onrender.com/api/v1/appointments
    const [appointmentsResponse, patientsResponse, doctorsResponse] = await Promise.all([
      axios.get('https://doctors-api-app.onrender.com/api/v1/appointments', {
        headers: {
          Authorization: sessionStorage.getItem('authToken'),
        },
      }),
      // if you want to test the application locally just change url to http://localhost:3000/api/v1/users?role=patientordoctor
      // test the app with apis locally change url to https://doctors-api-app.onrender.com/api/v1/users?role=patientordoctor
      axios.get('https://doctors-api-app.onrender.com/api/v1/users?role=patient'),
      axios.get('https://doctors-api-app.onrender.com/api/v1/users?role=doctor'),
    ]);

    const appointments = appointmentsResponse.data;
    const patients = patientsResponse.data;
    const doctors = doctorsResponse.data;

    return { appointments, patients, doctors };
  } catch (error) {
    throw new Error(error.message);
  }
});

export const deleteAppointment = createAsyncThunk('appointments/deleteAppointment', async (appointmentId) => {
  try {
    // if you want to test the application locally just change url to http://localhost:3000/api/v1/appointments/${appointmentId}
    // test the app with apis locally change url to https://doctors-api-app.onrender.com/api/v1/appointments/${appointmentId}
    await axios.delete(`https://doctors-api-app.onrender.com/api/v1/appointments/${appointmentId}`, {
      headers: {
        Authorization: sessionStorage.getItem('authToken'),
      },
    });
    return appointmentId;
  } catch (error) {
    throw new Error(error.message);
  }
});

const appointmentSlice = createSlice({
  name: 'appointments',
  initialState,
  reducers: {
    setAuthToken(state, action) {
      state.authToken = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
    .addCase(addAppointment.pending, (state) => {
      state.status = 'loading';
      state.error = null;
      })
      .addCase(addAppointment.fulfilled, (state) => {
        state.status = 'succeeded';
      })
      .addCase(addAppointment.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      .addCase(fetchAppointments.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchAppointments.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.appointments = action.payload.appointments;
        state.patients = action.payload.patients;
        state.doctors = action.payload.doctors;
      })

      .addCase(fetchAppointments.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      .addCase(deleteAppointment.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(deleteAppointment.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.appointments = state.appointments.filter(
          (appointment) => appointment.id !== action.payload,
        );
      })
      .addCase(deleteAppointment.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      });
  },
});

export const { setAuthToken } = appointmentSlice.actions;

export default appointmentSlice.reducer;