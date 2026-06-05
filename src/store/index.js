import { configureStore } from "@reduxjs/toolkit";
import buildReducer from "./slices/buildSlice";
import navigationReducer from "./slices/navigationSlice";
import uiReducer from "./slices/uiSlice";

export const store = configureStore({
  reducer: {
    build: buildReducer,
    navigation: navigationReducer,
    ui: uiReducer,
  },
});
