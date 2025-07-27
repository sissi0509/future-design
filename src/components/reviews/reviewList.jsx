import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchReviews, deleteReview, editReview } from "../../slices/reviewSlice";
import EditReview from './editReview';
import UserName from '../User/UserName'



export const ReviewList = () => {
    // first movie is the reducer name, second is the state name
    const reviews = useSelector((state) => state.review.reviews);
    const [editedReview, setEditedReview] = useState(null);
    const dispatch = useDispatch();

    // show reviews immediately
    useEffect(() => {
        dispatch(fetchReviews());
    }, []);

    const handleDeleteReview = async (id) => {
        try {
            await dispatch(deleteReview(id)).unwrap();
            await dispatch(fetchReviews());
        } catch (err) {
            console.error(err);
        }
    }

    const handleEditReview = (review) => {
        setEditedReview(review);
    };

    const handleCancelEdit = () => {
        setEditedReview(null);
    };


    return (
        <div>

            <h1>Review List</h1>
            {
                reviews.map((review) => (
                    <div key={review.id}>
                        {editedReview && editedReview.id === review.id ? (
                            <EditReview review={editedReview} onCancel={handleCancelEdit} />
                        ) : (
                            <div>
                                <ul>
                                    <li>Grade: {review.grade}</li>
                                    <li>Reason: {review.reason}</li>
                                    <li>Relevance: {String(review.relevant)}</li>
                                    <li>By: <UserName userId={review.userId} /></li>
                                </ul>
                                <button onClick={() => handleEditReview(review)}>Edit</button>
                                <button onClick={() => handleDeleteReview(review.id)}>Delete</button>
                            </div>
                        )}
                    </div>
                ))
            }
        </div>)
}