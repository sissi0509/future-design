
export default function showProfile({ username, setUsername, onSave, onClose }) {
    return (
        <div>
            <h4>Complete Your Profile</h4>
            <input
                type="text"
                placeholder="Choose a username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
            />
            <div>
                <button onClick={onSave}>Save</button>
                <button onClick={onClose}>Cancel</button>
            </div>
        </div>
    );

}