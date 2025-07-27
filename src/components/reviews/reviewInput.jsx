import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { addReview, fetchReviews } from '../../slices/reviewSlice';
import { auth } from '../../config/Firebase'
import { AiCheck } from '../../services/aiApi/Gemini';


export default function ReviewInput() {
    const [newReview, setNewReview] = useState({
        grade: '',
        reason: '',
        relevant: false,
    });

    const dispatch = useDispatch();
    const handleAddReview = async (e) => {
        e.preventDefault();

        const currentUser = auth.currentUser;
        if (!currentUser) {
            alert('Please log in to submit a review.');
            return;
        }

        try {
            const prompt = `Please classify this ${newReview.reason}$ strictly as one of the following labels: "very positive", "neutral", or "negative". Only return the label, no explanation.`

            const analysis = await AiCheck(prompt);

            const reviewData = {
                grade: Number(newReview.grade),
                reason: newReview.reason,
                relevant: newReview.relevant,
                userId: currentUser.uid,
                analysis: analysis,
            };

            await dispatch(addReview(reviewData)).unwrap();
            await dispatch(fetchReviews());

            setNewReview({
                grade: '',
                reason: '',
                relevant: false,
            });
        } catch (error) {
            console.error("Failed to add review:", error);
        }


    };

    const handleChange = (field, value) => {
        setNewReview(oldReview => ({
            ...oldReview,
            [field]: value,
        }));
    };



    return (
        <form onSubmit={handleAddReview}>
            <div>
                <h1>Review Form</h1>
                <label htmlFor="grade">Grade</label>
                <input
                    type="number"
                    id="grade"
                    value={newReview.grade}
                    onChange={(e) => handleChange('grade', e.target.value)} />

            </div>

            <div>
                <label htmlFor="reason">Reason</label>
                <textarea
                    type="text"
                    id="reason"
                    value={newReview.reason}
                    rows="5"
                    cols='30'
                    onChange={(e) => handleChange('reason', e.target.value)} />

            </div>

            <div>
                <label htmlFor="relevant">Relevant</label>
                <input
                    type="checkbox"
                    id="relevant"
                    checked={newReview.relevant}
                    onChange={(e) => handleChange('relevant', e.target.checked)} />
            </div>




            <button>Submit Review</button>
        </form>
    )

}