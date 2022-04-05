import { createSlice, PayloadAction, configureStore } from '@reduxjs/toolkit';
import { Tag } from '../ava/types';

export interface TagsState {
  tags: Tag[];
  showTags: boolean;
}

const tagsInitialState = {
  tags: [],
  showTags: false,
};

const tagsSlice = createSlice({
  name: 'tags',
  initialState: tagsInitialState,
  reducers: {
    setTags(state: TagsState, action: PayloadAction<Tag[]>) {
      state.tags = action.payload;
      state.showTags = true;
    },
    clearTags(state: TagsState, action: PayloadAction<boolean>) {
      if (action.payload) {
        state.showTags = false;
      }

      state.tags = [];
    },
  },
});

export const { clearTags, setTags } = tagsSlice.actions;

export default configureStore(tagsSlice);
