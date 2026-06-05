import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  chassis: null,
  parts: {
    engine: null,
    body: null,
    wheels: null,
    exhaust: null,
  },
  lastAdded: null,
};

const buildSlice = createSlice({
  name: "build",
  initialState,
  reducers: {
    setChassis: (state, action) => {
      state.chassis = action.payload;
    },
    setPart: (state, action) => {
      const { category, id } = action.payload;
      state.parts[category] = id;
      state.lastAdded = { category, id, timestamp: Date.now() };
    },
    resetBuild: () => initialState,
  },
});

export const { setChassis, setPart, resetBuild } = buildSlice.actions;
export default buildSlice.reducer;
