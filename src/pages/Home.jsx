import { useAuth } from '../components/User/AuthSetUp';
import Consent from './Consent';
import PreTest from './PreTest';
import Training from './Training';
import PostTest from './PostTest';
import Survey from './Survey';

export default function Home() {
    const { userProfile } = useAuth();

    if (!userProfile?.consentCompleted) {
        return <Consent />;
    } else if (!userProfile?.preTestCompleted) {
        return <PreTest />;
    } else if (!userProfile?.trainingCompleted) {
        return <Training />;
    } else if (!userProfile?.postTestCompleted) {
        return <PostTest />;
    } else if (!userProfile?.surveyCompleted) {
        return <Survey />;
    } else {
        return <div className="p-4">✅ You have completed the entire experience. Thank you!</div>;
    }
}