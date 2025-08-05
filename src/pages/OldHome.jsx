import { useState, useEffect } from 'react';
import { useAuth } from '../components/User/AuthSetUp';
import Consent from './Consent';
import PreTest from './PreTest';
import Training from './Training';
import PostTest from './PostTest';
import Survey from './Survey';

export default function Home() {
    const { userProfile } = useAuth();
    const [localProgress, setLocalProgress] = useState(null);

    useEffect(() => {
        if (userProfile) {
            setLocalProgress({
                consent: userProfile.consentCompleted,
                preTest: userProfile.preTestCompleted,
                training: userProfile.trainingCompleted,
                postTest: userProfile.postTestCompleted,
                survey: userProfile.surveyCompleted,
            });
        }
    }, [userProfile]);

    const markComplete = (stage) => {
        setLocalProgress((prev) => ({
            ...prev,
            [stage]: true,
        }));
    };

    if (!localProgress) {
        return <div className="p-4">Loading...</div>;
    }

    if (!localProgress.consent) {
        return <Consent onComplete={() => markComplete('consent')} />;
    } else if (!localProgress.preTest) {
        return <PreTest onComplete={() => markComplete('preTest')} />;
    } else if (!localProgress.training) {
        return <Training onComplete={() => markComplete('training')} />;
    } else if (!localProgress.postTest) {
        return <PostTest onComplete={() => markComplete('postTest')} />;
    } else if (!localProgress.survey) {
        return <Survey onComplete={() => markComplete('survey')} />;
    } else {
        return <div className="p-4">You have completed all!</div>;
    }
}
