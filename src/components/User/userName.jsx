import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../config/Firebase';

const Username = ({ userId }) => {
    const [username, setUsername] = useState('Loading...');

    useEffect(() => {
        const loadUsername = async () => {
            if (!userId) {
                setUsername('Unknown');
                return;
            }

            const userInfo = await getDoc(doc(db, 'users', userId));
            if (userInfo.exists()) {
                setUsername(userInfo.data().userName);
            } else {
                setUsername('Unknown');
            }
        };

        loadUsername();
    }, [userId]);

    return <span>{username}</span>;
};

export default Username;
