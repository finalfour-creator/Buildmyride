import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  flashText: null,
  flashTimestamp: 0,
  hovering: false,
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    triggerFlash: (state, action) => {
      state.flashText = action.payload;
      state.flashTimestamp = Date.now();
    },
    clearFlash: (state) => {
      state.flashText = null;
    },
    setHovering: (state, action) => {
      state.hovering = action.payload;
    },
  },
});

export const { triggerFlash, clearFlash, setHovering } = uiSlice.actions;
export default uiSlice.reducer;
