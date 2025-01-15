// import React, { useState } from "react";
// import axios from "axios";
// import '../css/SPIComponent.css'; // Import the CSS file

// const SPIComponent = ({ studentData }) => {
//     const [spiResults, setSpiResults] = useState([]);
//     const [semester, setSemester] = useState(1); // Default to semester 1
//     const [fileUploaded, setFileUploaded] = useState(false);

//     const convertGradeToValue = (grade) => {
//         const gradeMap = {
//             "AA": 10, "AB": 9, "BB": 8, "BC": 7,
//             "CC": 6, "CD": 5, "DD": 4, "FF": 0
//         };
//         return gradeMap[grade] || 0;
//     };

//     const calculateSPI = (grades) => {
//         if (!grades || grades.length === 0) return 0;
//         let totalPoints = 0;
//         let totalCredits = 0;

//         grades.forEach(({ courseCredits, gradeValue }) => {
//             totalCredits += courseCredits;
//             totalPoints += gradeValue * courseCredits;
//         });

//         const spi = totalCredits === 0 ? 0 : totalPoints / totalCredits;

//         // Return the SPI rounded to two decimal places
//         return parseFloat(spi.toFixed(2));    
//     };

//     const handleCalculateSPI = () => {
//         const results = studentData.map((student) => {
//             const spi = calculateSPI(student.grades);
//             return { student_id: student.id, spi };
//         });

//         setSpiResults(results);

//         results.forEach((student) => {
//             axios.post("http://localhost:3001/update-student", {
//                 student_id: student.student_id,
//                 spi: student.spi,
//                 semester: semester // Send semester along with SPI
//             })
//                 .then(() => console.log("Database updated successfully"))
//                 .catch((error) => console.error("Error updating database:", error));
//         });
//     };

//     const handleFileUpload = (event) => {
//         // Implement file upload logic here
//         // Set fileUploaded to true after a file is successfully uploaded
//         setFileUploaded(true);
//     };

//     return (
//         <div className={`spi-container ${fileUploaded ? 'file-uploaded' : ''}`}>
//             <label>
//                 Select Semester:
//                 <select value={semester} onChange={(e) => setSemester(e.target.value)}>
//                     {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
//                         <option key={sem} value={sem}>
//                             Semester {sem}
//                         </option>
//                     ))}
//                 </select>
//             </label>

//             {/* Replace this with your actual file upload component */}
//             <input type="file" onChange={handleFileUpload} />

//             <button 
//                 className={`calculate-spi-button ${fileUploaded ? '' : 'hidden'}`} 
//                 onClick={handleCalculateSPI}
//             >
//                 Calculate SPI and Update Database
//             </button>

//             {spiResults.length > 0 && (
//                 <div>
//                     <h3>SPI Results</h3>
//                     <ul>
//                         {spiResults.map((result, index) => (
//                             <li key={index}>
//                                 Student ID: {result.student_id}, SPI: {result.spi.toFixed(2)}
//                             </li>
//                         ))}
//                     </ul>
//                 </div>
//             )}
//         </div>
//     );
// };

// export default SPIComponent;
