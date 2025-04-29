import { configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import AsyncStorage from "@react-native-async-storage/async-storage";
import authSlice from "./slices/authSlice";
import tabReducer from "./slices/tabSlices";
import favourites from "./slices/favourites";
import propertyDetails from "./slices/propertyDetails";
import searchSlice from "./slices/searchSlice"
const authPersistConfig = {
  key: "auth",
  storage: AsyncStorage,
  whitelist: [
    "userDetails",
    "loggedIn",
    "userImage",
    "location",
    "subscriptionDetails",
    "userCity",
    "search"
  ],
};
const persistedAuthReducer = persistReducer(authPersistConfig, authSlice);
const store = configureStore({
  reducer: {
    auth: persistedAuthReducer,
    tab: tabReducer,
    favourites: favourites,
    property: propertyDetails,
    search:searchSlice
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["persist/PERSIST", "persist/REHYDRATE"],
      },
    }),
});
export const persistor = persistStore(store);
export default store;
