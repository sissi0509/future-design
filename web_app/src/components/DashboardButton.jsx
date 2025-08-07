import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

export default function DashboardButton({ curlevel, prelevel, unlockScore, path }) {

    const score = useSelector(state => state.score);
    const navigate = useNavigate();

    const isLocked = prelevel ? score?.[prelevel] < unlockScore : false;

    const buttonStyle = {
        color: isLocked ? 'grey' : 'black',
        cursor: isLocked ? 'not-allowed' : 'pointer',
    };

    const handleClick = (e) => {
        if (!isLocked) {
            navigate(path);
        }
    }


    return (
        <div style={{ textAlign: 'center', margin: '10px' }}>
            <h2>{curlevel}</h2>
            <div>
                <button
                    className="btn"
                    style={buttonStyle}
                    disabled={isLocked}
                    onClick={handleClick}
                >
                    {curlevel} {isLocked && ' (Locked)'}
                    <p>Score: {score?.[curlevel] ?? 0} / 7</p>
                </button>

            </div>
        </div>
    );
}