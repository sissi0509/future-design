import { useState } from 'react';
import { useAuth } from '../components/User/AuthSetUp';
import Consent from './Consent';
import PreTest from './PreTest';
import Training from './Training';
import PostTest from './PostTest';
import Survey from './Survey';

export default function Home() {
    const { userProfile } = useAuth();
    const [localProgress, setLocalProgress] = useState({
        consent: userProfile?.consentCompleted,
        preTest: userProfile?.preTestCompleted,
        training: userProfile?.trainingCompleted,
        postTest: userProfile?.postTestCompleted,
        survey: userProfile?.surveyCompleted,
    });

    const markComplete = (stage) => {
        setLocalProgress((prev) => ({
            ...prev,
            [stage]: true,
        }));
    };

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
        return <div className="p-4">✅ You have completed the entire experience. Thank you!</div>;
    }
}