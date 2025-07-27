import { useNavigate } from 'react-router-dom';

export default function Consetn() {
    const navigate = useNavigate();
    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Training</h1>
            <button className="btn btn-neutral-content" onClick={() => navigate('/post-test')}>
                Next
            </button>
        </div>
    );
}