import { createSlice } from "@reduxjs/toolkit";
const searchSlice = createSlice({
  name: "search",
  initialState: {
    city: "Hyderabad",
    tab: "Buy",
    property_for: "Sell",
    property_in: "",
    bhk: null,
    budget: "",
    sub_type: "Apartment",
    plot_subType: "Sell",
    commercial_subType: "Buy",
    occupancy: "",
    possession_status: "",
    plotPossesion: "Immediate",
    location: "",
    price: "Relevance",
    userCity: null,
    loading: false,
    error: null,
  },
  reducers: {
    setCity: (state, action) => {
      state.city = action.payload;
    },
    setTab: (state, action) => {
      state.tab = action.payload;
    },
    setPropertyFor: (state, action) => {
      state.property_for = action.payload;
    },
    setPropertyIn: (state, action) => {
      state.property_in = action.payload;
    },
    setBHK: (state, action) => {
      state.bhk = action.payload;
    },
    setBudget: (state, action) => {
      state.budget = action.payload;
    },
    setSubType: (state, action) => {
      state.sub_type = action.payload;
    },
    setPlotSubType: (state, action) => {
      state.plot_subType = action.payload;
    },
    setOccupancy: (state, action) => {
      state.occupancy = action.payload;
    },
    setPossesionStatus: (state, action) => {
      state.possession_status = action.payload;
    },
    setPlotPossesion: (state, action) => {
      state.plotPossesion = action.payload;
    },
    setLocation: (state, action) => {
      state.location = action.payload;
    },
    setPrice: (state, action) => {
      state.price = action.payload;
    },
    setUserCity: (state, action) => {
      state.userCity = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    setSearchData: (state, action) => {
      return {
        ...state,
        ...action.payload,
      };
    },
    setPlotSubType: (state, action) => {
      state.plot_subType = action.payload;
    },
    setCommercialSubType: (state, action) => {
      state.commercial_subType = action.payload;
    },
  },
});
export const {
  setCity,
  setTab,
  setPropertyFor,
  setPropertyIn,
  setBHK,
  setBudget,
  setSubType,
  setOccupancy,
  setPossesionStatus,
  setPlotPossesion,
  setLocation,
  setPrice,
  setUserCity,
  setLoading,
  setError,
  setSearchData,
  setPlotSubType,
  setCommercialSubType,
} = searchSlice.actions;
export default searchSlice.reducer;
