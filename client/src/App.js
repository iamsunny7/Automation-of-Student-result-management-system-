import React, { useState } from "react";
import AdminLogin from "./components/AdminLogin";
import UploadExcel from "./components/UploadExcel";
import SPIComponent from "./components/SPIComponent";

function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [studentData, setStudentData] = useState([]);

    const handleLogin = () => {
        setIsLoggedIn(true);
    };

    const handleFileUpload = (data) => {
        setStudentData(data);
    };

    return (
        <div>
            {!isLoggedIn ? (
                <AdminLogin onLogin={handleLogin} />
            ) : (
                <div>
                    <UploadExcel onUpload={handleFileUpload} />
                    {studentData.length > 0 && <SPIComponent studentData={studentData} />}
                </div>
            )}
        </div>
    );
}

export default App;
