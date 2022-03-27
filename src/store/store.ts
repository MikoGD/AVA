import { createSlice, PayloadAction, configureStore } from '@reduxjs/toolkit';
import { Badge } from '../ava/ava-types';

export interface TagsState {
  badges: Badge[];
}

const tagsInitialState = {
  badges: [],
};

const tagsSlice = createSlice({
  name: 'tags',
  initialState: tagsInitialState,
  reducers: {
    setBadges(state: TagsState, action: PayloadAction<Badge[]>) {
      state.badges = action.payload;
    },
    clearBadges(state: TagsState) {
      state.badges = [];
    },
  },
});

export const { clearBadges, setBadges } = tagsSlice.actions;

export default configureStore(tagsSlice);
