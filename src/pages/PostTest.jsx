import { useNavigate } from 'react-router-dom';

export default function Consetn() {
    const navigate = useNavigate();
    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Post Test</h1>
            <button className="btn btn-primary" onClick={() => navigate('/survey')}>
                Next
            </button>
        </div>
    );
}