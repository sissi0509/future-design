import { Link } from 'react-router-dom';
import Auth from './User/Auth';

export default function Header() {
    return (
        <div className="navbar bg-base-100 shadow-sm">
            <div className="navbar-start">
                <Link to="/">
                    <button className="btn btn-ghost text-lg">Home</button>
                </Link>


            </div>

            <div className="navbar-end">
                <Auth />
            </div>
        </div>
    )
}