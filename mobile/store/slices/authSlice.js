import { createSlice } from "@reduxjs/toolkit";

const authSlice = createSlice({
  name: "auth",
  initialState: {
    userDetails: null,
    loggedIn: null,
    userImage: null,
    location: "",
    subscriptionDetails: null,
    userCity: null,
    city_Id: null,
    loading: false,
    error: null,
  },
  reducers: {
    setLoggedIn: (state, action) => {
      state.loggedIn = action.payload;
    },
    removeUserDetails: (state) => {
      state.userDetails = null;
    },
    setLocation: (state, action) => {
      state.location = action.payload;
    },
    setUserImage: (state, action) => {
      state.userImage = action.payload;
    },
    setSubscriptionDetails: (state, action) => {
      state.subscriptionDetails = action.payload;
    },
    setCityId: (state, action) => {
      state.city_Id = action.payload;
    },
  },
});
export const {
  setLoggedIn,
  removeUserDetails,
  setLocation,
  setUserImage,
  setSubscriptionDetails,
  setCityId,
} = authSlice.actions;
export default authSlice.reducer;
