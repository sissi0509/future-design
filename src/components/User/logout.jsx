import { signOut } from 'firebase/auth';
import { auth } from '../../config/Firebase';

export default function Logout() {
    const handleLogOut = async () => {
        try {
            await signOut(auth);
            alert("You have logged out successfully!");
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

    return (
        <div>
            <button className="btn" onClick={handleLogOut}>
                Logout
            </button>
        </div>
    );
}

