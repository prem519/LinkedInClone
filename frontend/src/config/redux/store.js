/**
 *
 * STEPS for state management
 * submit Action
 * HAndle action in it's reducer
 * Register Here -> Reducer
 *
 */

import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./reducer/authReducer";
import postReducer from "./reducer/postReducer";

const store = configureStore({
  reducer: {
    auth: authReducer,
    postReducer: postReducer,
  },
});

export default store;
