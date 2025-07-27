import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db, auth } from "../config/firebase";

export const fetchUserScore = createAsyncThunk("score/fetchUserScore", async () => {
    const initialState = {
        level1: 0,
        level2: 0,
        level3: 0,
        level4: 0,
        level5: 0,
        level6: 0,
    };
    try {
        const user = auth.currentUser;
        const docInfo = await getDoc(doc(db, "users", user.uid));

        if (docInfo.exists()) {
            return docInfo.data().score;
        } else {
            return initialState
        }
    } catch (error) {
        console.error("Failed to fetch user score:", error);
        return rejectWithValue("Failed to fetch user score.");
    }
});

export const updateUserScore = createAsyncThunk("score/updateUserScore", async ({ level, value }) => {
    try {
        const user = auth.currentUser;
        const userRef = doc(db, "users", user.uid);

        await updateDoc(userRef, {
            [`score.${level}`]: value
        });

        return { level, value };
    } catch (error) {
        console.error("Failed to update user score:", error);
        return rejectWithValue("Failed to update user score:");
    }
});

const initialState = {
    level1: 0,
    level2: 0,
    level3: 0,
    level4: 0,
    level5: 0,
    level6: 0,
};

const scoreSlice = createSlice({
    name: 'score',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchUserScore.fulfilled, (state, action) => {
                return { ...state, ...action.payload };
            })
            .addCase(updateUserScore.fulfilled, (state, action) => {
                const { level, value } = action.payload;
                state[level] = value;
            });
    },
});

export default scoreSlice.reducer;
