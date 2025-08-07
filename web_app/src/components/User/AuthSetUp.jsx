import { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from '../../config/Firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [userProfile, setUserProfile] = useState(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            setCurrentUser(user);
            if (user) {
                const userInfo = await getDoc(doc(db, 'sessionInfo', user.uid));

                if (userInfo.exists()) {
                    setUserProfile(userInfo.data());
                } else {
                    setUserProfile(null);
                }
            } else {
                setUserProfile(null);
            }

        });

        return () => unsubscribe();
    }, []);

    return (
        <AuthContext.Provider value={{ currentUser, userProfile }}>
            {children}
        </AuthContext.Provider>
    );
};
