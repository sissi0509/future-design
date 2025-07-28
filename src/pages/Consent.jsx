
import { useState } from 'react';
import { useAuth } from '../components/User/AuthSetUp';
import { logClientError } from '../services/errorHandle/logClientError';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../config/Firebase';

export default function Consent({ onComplete }) {

    const { currentUser, userProfile } = useAuth();
    const [hasAgreed, setHasAgreed] = useState(false);
    const [typedId, setTypedId] = useState('');
    const [error, setError] = useState('');

    const prolificIdFromDB = userProfile?.prolificId?.trim().toLowerCase();
    const typedIdTrim = typedId.trim().toLowerCase();

    const isFormValid = hasAgreed && typedIdTrim && typedIdTrim === prolificIdFromDB;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!isFormValid) {
            setError('Please agree and sign with correct ID.');
            return;
        }
        try {
            const userRef = doc(db, 'users', currentUser.uid);
            await updateDoc(userRef, {
                consentCompleted: true,
            });
            if (onComplete) onComplete();

        } catch (err) {
            console.error('Consent error:', err);
            await logClientError({
                error,
                source: 'Consent Page',
                reason: 'Failed to update consentCompleted'
            })
            setError('Something went wrong. Please try again.');
        }



    };

    return (
        <div className="max-w-3xl mx-auto p-6">
            <h1 className="text-2xl font-bold mb-4">Consent Form</h1>

            <div className="mb-6 border rounded p-4 bg-gray-50">
                <p className="text-sm">
                    Lorem ipsum dolor sit amet consectetur adipisicing elit. Repellat eius, molestias odit quas numquam hic magnam ipsam ratione iste non ex! Excepturi reprehenderit totam harum? Accusantium neque officiis officia odio?
                    Odit optio reprehenderit et aspernatur pariatur dolores assumenda sunt, beatae accusantium eum quo nam. Vero atque nihil rerum hic quod. Consequuntur quibusdam molestiae nostrum aut libero a quia commodi. Est.
                    Laboriosam in quisquam mollitia quaerat recusandae, nesciunt consequuntur doloribus fugit similique quos, ea, reprehenderit ab officiis eligendi! Perspiciatis quaerat assumenda, eveniet itaque quod sapiente culpa aliquid consectetur asperiores placeat? Distinctio?
                    Nihil quasi aut enim veritatis voluptatibus similique? Sit, exercitationem qui beatae fugiat architecto quidem voluptates dignissimos. Culpa accusantium, nostrum inventore magnam, necessitatibus ut molestiae, ipsa hic ipsam dolorum quo harum.
                    Consequuntur suscipit modi perferendis eos obcaecati nihil ex blanditiis sed numquam ad at incidunt nemo accusantium repellendus atque soluta deserunt, distinctio corrupti libero dolorem repellat placeat possimus quam hic! Dolor?
                    Dolor dolorum provident quas incidunt officiis voluptas ipsa inventore omnis quasi, assumenda sapiente soluta! Corporis numquam, fuga explicabo molestiae nihil perspiciatis at distinctio illo assumenda velit dolore. Magni, aliquid animi?
                    Ratione sapiente dolor earum excepturi recusandae id? Maxime distinctio et praesentium! Nulla vel nemo, aperiam delectus deserunt voluptates facere necessitatibus voluptas aliquid iure mollitia sed itaque repudiandae non dolores blanditiis.
                    Amet nemo voluptas nam obcaecati enim sapiente aperiam impedit excepturi? Maxime fuga blanditiis illo id cum inventore et veniam aliquam delectus iure maiores magnam consequuntur voluptatem, quaerat fugiat reiciendis porro.
                    Laudantium fugit, consequatur, earum a recusandae error magni consequuntur culpa illum assumenda minima veritatis cupiditate, deleniti voluptatem. Est aspernatur sed et iste libero, error reprehenderit quo consequatur, laborum nihil voluptatibus!
                    Eum, in reprehenderit nostrum similique, libero cum vitae eligendi officia laboriosam quibusdam quo aut eos, officiis error accusantium debitis? Ducimus velit magnam officiis nisi labore. Asperiores architecto magni beatae excepturi?
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="inline-flex items-center">
                        <input
                            type="checkbox"
                            className="mr-2"
                            checked={hasAgreed}
                            onChange={(e) => setHasAgreed(e.target.checked)}
                        />
                        Agree
                    </label>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">
                        Type ID to sign:
                    </label>
                    <input
                        type="text"
                        className="input input-bordered w-full"
                        value={typedId}
                        onChange={(e) => setTypedId(e.target.value)}
                        placeholder="Type your Prolific ID"
                    />
                </div>

                {error && <p className="text-red-500 text-sm">{error}</p>}

                <button
                    type="submit"
                    className="btn btn-neutral-content"
                >
                    Submit and Continue
                </button>
            </form>
        </div>
    );
}
