import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  phase: 0,
  vIdx: 0,
  hIdx: 0,
  navLock: false,
};

const navigationSlice = createSlice({
  name: "navigation",
  initialState,
  reducers: {
    setPhase: (state, action) => {
      state.phase = action.payload;
    },
    setVIdx: (state, action) => {
      state.vIdx = Math.max(0, Math.min(3, action.payload));
    },
    setHIdx: (state, action) => {
      state.hIdx = Math.max(0, Math.min(7, action.payload));
      if (state.hIdx >= 6) state.phase = 2;
      else if (state.hIdx >= 0) state.phase = Math.max(state.phase, 1);
    },
    lockNav: (state) => {
      state.navLock = true;
    },
    unlockNav: (state) => {
      state.navLock = false;
    },
    resetNav: () => initialState,
  },
});

export const { setPhase, setVIdx, setHIdx, lockNav, unlockNav, resetNav } =
  navigationSlice.actions;
export default navigationSlice.reducer;
