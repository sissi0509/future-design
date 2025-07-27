import { Link } from 'react-router-dom';
import Auth from './User/Auth';

export default function Header() {
    return (
        <div className="navbar bg-base-100 shadow-sm">
            <div className="navbar-start">
                <Link to="/">
                    <button className="btn btn-ghost text-lg">Home</button>
                </Link>
                <Link to="/consent">
                    <button className="btn btn-ghost text-lg">Start</button>
                </Link>

            </div>

            <div className="navbar-end">
                <Auth />
            </div>
        </div>
    )
}