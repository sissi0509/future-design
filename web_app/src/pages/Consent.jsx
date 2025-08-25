
import { useState, useRef } from 'react';
import { useAuth } from '../components/User/AuthSetUp';
import { logClientError } from '../services/errorHandle/logClientError';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../config/Firebase';
import ReadAloudButtonById from '../components/ReadAloudButton'
import { makeKeydownLogger } from '../services/xapi/TypingStatement'

export default function Consent({ onComplete }) {

    const { currentUser } = useAuth();
    const [hasAgreed, setHasAgreed] = useState(false);
    const [typedId, setTypedId] = useState('');
    const [error, setError] = useState('');
    const textareaRef = useRef(null);

    const isFormValid = hasAgreed && typedId.trim().length > 0

    const handleKeyDown = makeKeydownLogger({
        user: currentUser,
        objectId: 'consent:text',
        element: textareaRef.current,
    });



    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!isFormValid) {
            setError('Please agree and sign with correct ID.');
            return;
        }
        try {
            await setDoc(doc(db, 'sessionInfo', currentUser.uid), {
                consentCompleted: true,
            }, { merge: true });
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

    const consentText = `Lorem ipsum dolor sit, amet consectetur adipisicing elit. Dolores suscipit sapiente dolor sunt qui voluptate magni, ad blanditiis, repudiandae ducimus dolore odio reiciendis itaque beatae quaerat, 
    laudantium necessitatibus tempore eos? Eaque non repudiandae illo tenetur quisquam ipsa culpa iure quaerat aspernatur consectetur dolores ab explicabo fuga, excepturi aliquam quas, omnis expedita a saepe.Porro repellat corporis nihil voluptatibus libero praesentium,
Dolorum eaque ducimus eligendi aperiam illo delectus minus dolor quidem amet deleniti, culpa error sapiente quibusdam velit molestiae saepe rem possimus sed eum accusamus.Commodi porro minima ipsam optio inventore ?,
        Repellendus illo esse odit dicta, laboriosam veritatis.Eius, hic ipsa omnis deleniti eum libero reprehenderit dicta, ex ut ducimus veniam dolor ullam earum distinctio quis possimus recusandae inventore repellendus voluptatibus!,
            Ipsa ut neque magni saepe animi tempora quidem.Ea, eaque eligendi quae odio voluptas, natus iure incidunt molestias autem, perferendis voluptatem facere neque! Quas nulla obcaecati molestiae mollitia earum sapiente.,
            Porro eligendi suscipit perspiciatis eaque illo praesentium ducimus iste fugiat quod nobis facilis, officia culpa dolorum quasi sint ipsam perferendis nam veritatis possimus mollitia, nisi non quidem nemo illum ? Deleniti.,
            Ipsa cupiditate distinctio dicta, aperiam odit sapiente quaerat sed ex numquam! Ut reiciendis voluptas eius fuga, tempore, alias adipisci temporibus doloribus est veniam eligendi dolor error illo et maxime.Earum.,
            Molestias dolor est vitae eos.At molestias magni est a, eos aperiam eius temporibus aliquam.Explicabo quidem corrupti quasi nisi at.Quas debitis mollitia aspernatur fugiat ad eveniet consectetur quos ?,
        Magni molestias quidem nostrum maxime odit similique quo placeat, dolorum totam vero iure at, quasi quae.Dolor magni quis voluptates iusto natus odit! Quisquam numquam nam natus fugit dolorum ea ?,
            Corporis, debitis.Accusantium adipisci provident ullam, molestiae incidunt magnam iure cumque debitis ab similique sunt quasi consequatur voluptas delectus optio quos earum assumenda consectetur alias fugiat ipsam possimus aliquam libero.`;

    return (
        <div className="max-w-3xl mx-auto p-6">
            <h1 className="text-2xl font-bold mb-4">Consent Form</h1>

            <div className="mb-6 border rounded p-4 bg-gray-50 max-h-[500px] overflow-y-auto">
                <ReadAloudButtonById text={consentText} />

                <p className="text-sm">{consentText}</p>
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
                        ref={textareaRef}
                        type="text"
                        className="input input-bordered w-full"
                        value={typedId}
                        onChange={(e) => setTypedId(e.target.value)}
                        placeholder="Type your Prolific ID"
                        onKeyDown={handleKeyDown}
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
