import { createContext, useCallback, useContext, useRef } from "react";
import { setDoc, doc } from "firebase/firestore";
import { db } from "../config/Firebase";
import { useAuth } from "../components/User/AuthSetUp";

const Ctx = createContext(null);

export function AnswersRegistryProvider({ children }) {
    const { currentUser } = useAuth();
    const cacheRef = useRef(new Map());

    const set = useCallback((key, payload) => {
        // payload: { type, answers}
        cacheRef.current.set(key, payload || {});
    }, []);

    const remove = useCallback((key) => {
        cacheRef.current.delete(key);
    }, []);

    const flushToResponses = useCallback(async () => {
        const uid = currentUser?.uid;
        if (!uid) return;

        const entries = Array.from(cacheRef.current.entries())
            .map(([savedFrom, p]) => ({ savedFrom, ...p }))
            .filter(({ answers }) => answers && Object.keys(answers).length > 0);

        if (entries.length === 0) return;

        await Promise.all(
            entries.map(({ type, answers, savedFrom }) =>
                setDoc(doc(db, "sessionInfo", uid, "responses", savedFrom), {
                    type,
                    ...answers,
                    submitted: false,
                    status: "logout-save",
                    savedFrom,
                },
                    { merge: true }
                )
            )
        );

        cacheRef.current.clear(); // don’t flush twice
    }, [currentUser?.uid]);

    return (
        <Ctx.Provider value={{ set, remove, flushToResponses }}>
            {children}
        </Ctx.Provider>
    );
}

export function useAnswersRegistry() {
    const ctx = useContext(Ctx);
    if (!ctx) throw new Error("useAnswersRegistry must be used within AnswersRegistryProvider");
    return ctx;
}
