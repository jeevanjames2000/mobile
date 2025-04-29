import { createSlice } from "@reduxjs/toolkit";
const favouritesSlice = createSlice({
  name: "favourites",
  initialState: {
    favourites: [],
    scheduledVisitings: [],
    intrestedProperties: [],
    contactSellers: [],
  },
  reducers: {
    setFavourites: (state, action) => {
      state.favourites = action.payload;
    },
    addFavourite: (state, action) => {
      const item = action.payload;
      const exists = state.favourites.find((fav) => fav.id === item.id);
      if (!exists) {
        state.favourites.push(item);
      }
    },
    removeFavourite: (state, action) => {
      state.favourites = state.favourites.filter(
        (fav) => fav.id !== action.payload
      );
    },
  },
});
export const { setFavourites, addFavourite, removeFavourite } =
  favouritesSlice.actions;
export default favouritesSlice.reducer;
