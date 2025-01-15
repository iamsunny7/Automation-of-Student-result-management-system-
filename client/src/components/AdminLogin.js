import React, { useState } from "react";
import "../css/AdminLogin.css"; // Import the CSS file

const AdminLogin = ({ onLogin }) => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const handleLogin = () => {
        if (username === "admin" && password === "admin123") {
            onLogin();
        } else {
            alert("Invalid credentials");
        }
    };

    return (
        <div className="admin-login-container">
            <div className="login-box">
                {/* Add the college logo at the top */}
                <img src="/iiitglogo.png" alt="College Logo" />
                <h2>Admin Login</h2>
                <input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <button onClick={handleLogin}>Login</button>
            </div>
        </div>
    );
};

export default AdminLogin;
