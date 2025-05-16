import { createSlice } from "@reduxjs/toolkit";




const propertySlice = createSlice({
  name: "property",
  initialState: {
    propertyDetails: [],
    liked: [],
    enquireNow: [],
    location: "",
    googleAutoSuggestion: [],
    cities: [],
    deviceLocation: "",
    intrested: [],
    trendingProjects: [],
    intrestedProperties: [],
  },
  reducers: {
    setPropertyDetails: (state, action) => {
      state.propertyDetails = action.payload;
    },
    setCities: (state, action) => {
      state.cities = action.payload;
    },
    setDeviceLocation: (state, action) => {
      state.deviceLocation = action.payload;
    },
    removeProperty: (state) => {
      state.propertyDetails = null;
    },
    setLiked: (state, action) => {
      state.liked = action.payload;
    },
    setLocation: (state, action) => {
      state.location = action.payload;
    },
    setGoogleAutoSuggestion: (state, action) => {
      state.googleAutoSuggestion = action.payload;
    },
    setTrendingProjects: (state, action) => {
      state.trendingProjects = action.payload;
    },
    setIntrestedProperties: (state, action) => {
      state.intrestedProperties = action.payload;
    },
  },
});
export const {
  setPropertyDetails,
  removeProperty,
  setLiked,
  setLocation,
  setGoogleAutoSuggestion,
  setCities,
  setDeviceLocation,
  setTrendingProjects,
  setIntrestedProperties,
} = propertySlice.actions;
export default propertySlice.reducer;
