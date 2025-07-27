import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { collection, getDocs, addDoc, doc, deleteDoc, updateDoc } from "firebase/firestore";
import { db } from "../config/Firebase";

// Async Thunks
export const fetchReviews = createAsyncThunk("reviews/fetchReviews", async () => {
    const data = await getDocs(collection(db, "reviews"));
    let reviews = [];
    data.forEach(doc => {
        reviews.push({ id: doc.id, ...doc.data() });
    });
    return reviews;
});

export const addReview = createAsyncThunk("reviews/addReview", async (review) => {
    const docRef = await addDoc(collection(db, "reviews"), review);
    return { id: docRef.id, ...review };
});

export const deleteReview = createAsyncThunk("reviews/deleteReview", async (id) => {
    await deleteDoc(doc(db, "reviews", id));
    return id;
});

export const editReview = createAsyncThunk("reviews/editReview", async ({ id, updatedReview }) => {
    await updateDoc(doc(db, "reviews", id), updatedReview);
    return { id, ...updatedReview };
});


// Slice
const reviewSlice = createSlice({
    name: "reviews",
    initialState: { reviews: [] },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchReviews.fulfilled, (state, action) => {
                state.reviews = action.payload;
            })
            .addCase(addReview.fulfilled, (state, action) => {
                state.reviews.push(action.payload);
            })
            .addCase(deleteReview.fulfilled, (state, action) => {
                state.items = state.reviews.filter(r => r.id !== action.payload);
            })
            .addCase(editReview.fulfilled, (state, action) => {
                const index = state.reviews.findIndex(r => r.id === action.payload.id);
                if (index !== -1) {
                    state.reviews[index] = action.payload;
                }
            });

    }
});

export default reviewSlice.reducer;