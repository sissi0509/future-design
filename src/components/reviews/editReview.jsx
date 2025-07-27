import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { editReview, fetchReviews } from '../../slices/reviewSlice';

export default function EditReview({ review, onCancel }) {
    const dispatch = useDispatch();

    const [editData, setEditData] = useState({
        grade: review.grade,
        reason: review.reason,
        relevant: review.relevant,
    });

    const handleChange = (field, value) => {
        setEditData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await dispatch(editReview({ id: review.id, updatedReview: editData })).unwrap();
            await dispatch(fetchReviews());
            onCancel();
        } catch (error) {
            console.error("Edit failed:", error);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <div>
                <label htmlFor="grade">Grade</label>
                <input
                    type="number"
                    id="grade"
                    value={editData.grade}
                    onChange={(e) => handleChange('grade', Number(e.target.value))} />

            </div>

            <div>
                <label htmlFor="reason">Reason</label>
                <textarea
                    type="text"
                    id="reason"
                    value={editData.reason}
                    rows="5"
                    cols='30'
                    onChange={(e) => handleChange('reason', e.target.value)} />

            </div>
            <div>
                <label htmlFor="relevant">Relevant</label>
                <input
                    type="checkbox"
                    id="relevant"
                    checked={editData.relevant}
                    onChange={(e) => handleChange('relevant', e.target.checked)} />
            </div>


            <button type="submit">Save</button>
            <button type="button" onClick={onCancel}>Cancel</button>
        </form>
    );
}