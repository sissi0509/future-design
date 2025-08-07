
import Auth from './User/Auth';

export default function Header({ progress }) {
    if (!progress) return null;

    const baseStyle = 'px-3 py-1 rounded-md text-xl font-medium';

    return (
        <div className="navbar bg-base-100 shadow-sm">
            <div className="navbar-start"></div>

            <div className="navbar-center space-x-2">
                <span className={`${baseStyle} ${progress.welcomeCompleted ? 'text-green-600' : 'text-gray-400'}`}>Welcome</span>
                {/* <span className={`${baseStyle} ${progress.consentCompleted ? 'text-green-600' : 'text-gray-400'}`}>Consent</span> */}
                <span className={`${baseStyle} ${progress.preTestCompleted ? 'text-green-600' : 'text-gray-400'}`}>PreTest</span>
                <span className={`${baseStyle} ${progress.trainingCompleted ? 'text-green-600' : 'text-gray-400'}`}> Training</span >
                <span className={`${baseStyle} ${progress.postTestCompleted ? 'text-green-600' : 'text-gray-400'}`}>PostTest</span>
                <span className={`${baseStyle} ${progress.surveyCompleted ? 'text-green-600' : 'text-gray-400'}`}> Survey</span >
            </div >

            <div className="navbar-end">
                <Auth />
            </div>
        </div >
    );
}

