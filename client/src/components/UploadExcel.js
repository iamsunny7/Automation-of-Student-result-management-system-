import React, { useState , useEffect} from "react";
import * as XLSX from "xlsx";
import axios from "axios"; // Import axios for API calls
import jsPDF from "jspdf";
import "../css/UploadExcel.css"; // Import CSS
// import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const generateReportCardPDF = async (studentData, gradesData) => {
  const doc = new jsPDF();

  // Header Section
  doc.addImage('/path/to/logo.png', 'PNG', 10, 10, 20, 20); // Adjust path to logo
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("भारतीय सूचना प्रौद्योगिकी संस्थान गुवाहाटी", 105, 20, { align: "center" });
  doc.text("INDIAN INSTITUTE OF INFORMATION TECHNOLOGY GUWAHATI", 105, 27, { align: "center" });

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Program Duration: ${studentData.programDuration} Years`, 10, 40);
  doc.text(`Name: ${studentData.name}`, 10, 46);
  doc.text(`Discipline: ${studentData.discipline}`, 10, 52);
  doc.text(`Roll No.: ${studentData.rollNo}`, 140, 40);
  doc.text(`Year of Enrollment: ${studentData.enrollmentYear}`, 140, 46);

  // Semester Tables
  let startY = 60;
  gradesData.forEach((semester, index) => {
    const semesterTitle = `Semester ${semester.semester}`;
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text(semesterTitle, 10, startY);

    // Table Headers
    const tableStartY = startY + 5;
    doc.setFontSize(8);
    doc.text("Course", 10, tableStartY);
    doc.text("Course Name", 50, tableStartY);
    doc.text("Cr.", 120, tableStartY);
    doc.text("Gr.", 140, tableStartY);

    let rowY = tableStartY + 5;
    doc.setFont("helvetica", "normal");
    semester.courses.forEach((course) => {
      doc.text(course.courseCode, 10, rowY);
      doc.text(course.courseName, 50, rowY);
      doc.text(course.credits.toString(), 120, rowY);
      doc.text(course.grade, 140, rowY);
      rowY += 5;
    });

    // GPA Row
    doc.setFont("helvetica", "bold");
    doc.text(`GPA: ${semester.gpa.toFixed(2)}`, 10, rowY);

    // Move startY down for the next semester
    startY = rowY + 10;

    // Check if we need a new page
    if (startY > 270) {
      doc.addPage();
      startY = 10; // Reset startY for new page
    }
  });

  // Footer Section for CPI
  let footerY = startY + 10;
  doc.setFont("helvetica", "bold");
  doc.text("Semester and Cumulative Performance Index (S.P.I and C.P.I)", 10, footerY);
  doc.setFont("helvetica", "normal");

  let cpiRowY = footerY + 5;
  gradesData.forEach((semester) => {
    doc.text(`Sem ${semester.semester}`, 10 + (semester.semester - 1) * 15, cpiRowY);
    doc.text(semester.gpa.toFixed(2), 10 + (semester.semester - 1) * 15, cpiRowY + 5);
  });

  const cpi = (gradesData.reduce((sum, sem) => sum + sem.gpa, 0) / gradesData.length).toFixed(2);
  doc.text(`CPI: ${cpi}`, 10, cpiRowY + 15);

  // Date and Signature
  doc.text(`Date: ${new Date().toLocaleDateString()}`, 10, cpiRowY + 25);
  doc.text("Associate Dean (Academic Affairs - UG)", 140, cpiRowY + 25);

  // Save PDF
  doc.save(`${studentData.name}_ReportCard.pdf`);
};

// Example Data for All Semesters
const studentData = {
  name: "SUNNY KUMAR",
  rollNo: "2101206",
  programDuration: 4,
  discipline: "Computer Science and Engineering",
  enrollmentYear: 2021
};

const gradesData = [
  { semester: 1, courses: [{ courseCode: "CS101", courseName: "Computer Programming", credits: 6, grade: "BC" }, { courseCode: "CS110", courseName: "Computer Programming Lab", credits: 5, grade: "CD" }], gpa: 7.38 },
  { semester: 2, courses: [{ courseCode: "MA102", courseName: "Mathematics II", credits: 8, grade: "DD" }, { courseCode: "CS103", courseName: "Data Structures", credits: 8, grade: "F" }], gpa: 6.52 },
  { semester: 3, courses: [{ courseCode: "MA203", courseName: "Mathematics III", credits: 6, grade: "DD" }, { courseCode: "CS201", courseName: "Algorithms", credits: 6, grade: "F" }], gpa: 5.70 },
  { semester: 4, courses: [{ courseCode: "CS231", courseName: "Operating Systems", credits: 6, grade: "DD" }, { courseCode: "CS235", courseName: "Artificial Intelligence", credits: 6, grade: "DD" }], gpa: 4.88 },
  { semester: 5, courses: [{ courseCode: "CS301", courseName: "Theory of Computation", credits: 8, grade: "F" }, { courseCode: "CS352", courseName: "Computer Networks", credits: 6, grade: "BB" }], gpa: 4.92 },
  { semester: 6, courses: [{ courseCode: "CS361", courseName: "Computer Security", credits: 6, grade: "CC" }, { courseCode: "CS302", courseName: "Physics II", credits: 6, grade: "BB" }], gpa: 6.04 },
  { semester: 7, courses: [{ courseCode: "CS401", courseName: "Biology", credits: 6, grade: "AB" }, { courseCode: "CS301", courseName: "Theory of Computation*", credits: 8, grade: "CD" }], gpa: 6.00 },
  { semester: 8, courses: [{ courseCode: "HS307", courseName: "Advanced Communication Skills", credits: 6, grade: "CC" }, { courseCode: "CS321", courseName: "Compilers Lab", credits: 6, grade: "BC" }], gpa: 5.84 }
];

// Generate PDF
generateReportCardPDF(studentData, gradesData);

const UploadExcel = () => {
    const [semester, setSemester] = useState(""); // For selecting the semester
    const [studentId, setStudentId] = useState(""); // For student search
    const [studentData, setStudentData] = useState(null); // State to store student data across multiple sheets
    const [spiResults, setSpiResults] = useState([]); // To store SPI results
    const [combinedData, setCombinedData] = useState({});
    const [fileUploaded, setFileUploaded] = useState(false); // Track file upload status
    const [error, setError] = useState(null); // To handle errors
    const [updateSuccess, setUpdateSuccess] = useState(false);
    // useEffect(() => {
    //     if (Notification.permission !== 'granted') {
    //         Notification.requestPermission();
    //     }
    // }, []);

    // Grade mapping utility
    const convertGradeToValue = (grade) => {
        const gradeMap = {
            "AA": 10, "AB": 9, "BB": 8, "BC": 7,
            "CC": 6, "CD": 5, "DD": 4, "FF": 0
        };
        return gradeMap[grade] || 0;
    };

    // Calculate SPI
    const calculateSPI = (grades) => {
        if (!grades || grades.length === 0) return 0;
        let totalPoints = 0;
        let totalCredits = 0;

        grades.forEach(({ courseCredits, gradeValue }) => {
            totalCredits += courseCredits;
            totalPoints += gradeValue * courseCredits;
        });

        const spi = totalCredits === 0 ? 0 : totalPoints / totalCredits;
        return parseFloat(spi.toFixed(2));
    };

  
    

    const handleFileUpload = async (e) => {
        const files = e.target.files;
        let tempCombinedData = {}; // To hold combined student data from all files
    
        // Process each file
        await Promise.all(Array.from(files).map((file) => {
            return new Promise((resolve) => {
                const reader = new FileReader();
                reader.onload = async (event) => {
                    const data = event.target.result;
                    const workbook = XLSX.read(data, { type: "binary" });
                    const sheetName = workbook.SheetNames[0];
    
                    // Read the sheet as an array of arrays, starting from the 13th row (range: 12)
                    const sheetData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], {
                        range: 12,   // Start from the 13th row (0-indexed)
                        header: 1    // Row 13 will be treated as headers
                    });
    
                    // Extract course LTPC data (assuming it's in the 5th row, 3rd column)
                    const sheetData2 = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], {
                        header: 1 
                    });
                    const courseName = sheetData2[3]?.[2] || "Unknown Course"; // Handle missing course name
                    const courseLTPC = sheetData2[4]?.[2] || "0-0-0-0";  // Handle missing course LTPC data
                    const credits = parseFloat(courseLTPC.split("-").pop()) || 0;
                    let flag = false;
    
                    // Process student data (access by index since header: 1 is used)
                    for (const row of sheetData) {
                        if (flag) break;
    
                        const studentId = row[1];  // Assuming "ROLL NUMBER" is the first column
                        const studentName = row[2]; // Assuming "NAME" is the second column
                        const grade = row[4];       // Assuming "GRADE" is the fifth column
    
                        // Check for an empty student ID and break if found
                        if (!studentId) {
                            flag = true; // Exit loop if student ID is missing
                            break;
                        }
    
                        try {
                            // Ensure studentId and studentName are defined before making API call
                            if (studentId && studentName) {
                                await axios.post("http://localhost:3001/api/check-or-insert-student", {
                                    student_id: studentId,
                                    name: studentName
                                });
                            }
                        } catch (error) {
                            console.error("Error checking/inserting student:", error);
                        }
    
                        // Create or update the student's record in tempCombinedData
                        if (!tempCombinedData[studentId]) {
                            tempCombinedData[studentId] = {
                                id: studentId,
                                name: studentName,
                                grades: [],
                            };
                        }
    
                        // Add course details to student's record
                        tempCombinedData[studentId].grades.push({
                            courseName: courseName,
                            courseCredits: credits,
                            grades: grade,
                            gradeValue: convertGradeToValue(grade),
                        });
                    }
    
                    resolve(); // Resolve the Promise for this file
                };
                reader.readAsBinaryString(file);
            });
        }));
    
        setCombinedData(tempCombinedData);
        setFileUploaded(true); // Mark file as uploaded
        setStudentData(Object.values(tempCombinedData)); // Set combined student data
    };
    
    

    // Calculate SPI and update the database
    const handleCalculateSPI = () => {
        const results = studentData.map((student) => {
            const spi = calculateSPI(student.grades);
            return { student_id: student.id, spi };
        });

        setSpiResults(results); // Store SPI results

        // Send results to the database
        results.forEach((student) => {
            axios.post("http://localhost:3001/update-student", {
                student_id: student.student_id,
                spi: student.spi,
                semester: semester // Send semester along with SPI
            })
                .then(() => console.log("Database updated successfully"))
                .catch((error) => console.error("Error updating database:", error));
        });
        // After the update is successful, show the success message
        setUpdateSuccess(true);

        // // Optionally, hide the message after a few seconds
        setTimeout(() => setUpdateSuccess(false), 3000);
        // if (Notification.permission === 'granted') {
        //     new Notification('Update Successful', {
        //         body: 'SPI and database have been successfully updated.',
        //         // icon: 'path/to/icon.png' // Optional: add an icon path here if desired
        //     });
        // }
    };

    // Handle semester selection
    const handleSemesterChange = (e) => {
        setSemester(e.target.value);
    };

    // Handle student search by ID
    const handleStudentIdChange = (e) => {
        setStudentId(e.target.value);
    };

    const handleSearchStudent = () => {
        if (!studentId) {
            alert("Please enter a Student ID");
            return;
        }

        axios.get(`http://localhost:3001/student/${studentId}`) // Pass student ID to the backend
            .then((response) => {
                setStudentData([response.data]); // Store response in state
                setError(null); // Clear error if any
            })
            .catch((error) => {
                console.error("Error fetching student data:", error);
                setError("Student not found or error occurred");
                setStudentData(null); // Clear previous data if error occurs
            });
    };

    const handleDownloadPDF = () => {
        if (!studentData || studentData.length === 0) return;
    
        const doc = new jsPDF();
        const student = combinedData[studentData[0].student_id];
        const student2 = studentData[0];
    
        // Add Institution Logo
        const logoPath = '/iiitglogo.png';
        doc.addImage(logoPath, 'PNG', 10, 10, 20, 20);

        // Add Hindi text image above the English text
        const hindiTextImagePath = '/hindiText.png';  // Path to the Hindi text image
        doc.addImage(hindiTextImagePath, 'PNG', doc.internal.pageSize.width / 2 - 70, 12, 120, 9);
    
        // Institution Header
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text('INDIAN INSTITUTE OF INFORMATION TECHNOLOGY GUWAHATI', doc.internal.pageSize.width / 2 + 9, 28, { align: 'center' });
    
        // Program Details
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.text('Bachelor of Technology Grade Card', doc.internal.pageSize.width / 2, 40, { align: 'center' });
    
        // Student Information
        doc.setFontSize(9);
        doc.setFont("helvetica", "bold");
        doc.text(`Program Duration: 4 Years`, 10, 50);
        doc.text(`Semester: ${semester}`, 140, 50);
        doc.text(`Name: ${student.name.toUpperCase()}`, 10, 60);
        doc.text(`Roll No.: ${student.id}`, 140, 60);
        doc.text(`Discipline: Computer Science and Engineering`, 10, 70);
        doc.text(`Year of Enrolment: 2021`, 140, 70);
    
        // Course-wise Grades Header
        doc.setFontSize(10);
        // doc.text("Semester V (July - Nov) 2023", 10, 85);
    
        // Table for Course Names, Credits, and Grades
        const courseStartY = 95;
        const columnWidths = [30, 80, 10, 20]; // Adjust column widths as needed
        let offsetY = 0;
    
        doc.setFont("helvetica", "normal");
        // doc.setFontSize(9);
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.text("Course Code", 10, courseStartY);
        doc.text("Course Name", 40, courseStartY);
        doc.text("Credits", 120, courseStartY);
        doc.text("Grade", 140, courseStartY);
        offsetY = 10;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        student.grades.forEach((course, index) => {

            const courseCodeMatch = course.courseName.match(/^[A-Z]+\d+/);
            const courseCode = courseCodeMatch ? courseCodeMatch[0] : "N/A";

            const courseNameMatch = course.courseName.match(/\(([^)]+)\)/);
            const text = courseNameMatch ? courseNameMatch[1] : "Unknown Course";
            const credits = `${course.courseCredits}`;
            const grade = `${course.grades}`;
    
            doc.text(courseCode, 10, courseStartY + offsetY);
            doc.text(text, 40, courseStartY + offsetY);
            doc.text(credits, 120, courseStartY + offsetY);
            doc.text(grade, 140, courseStartY + offsetY);
            offsetY += 10;
        });
    
        // SPI and CPI Table Header
        const spiTableStartY = courseStartY + offsetY + 10;
        doc.setFont("helvetica", "bold");
        doc.text("Semester and Cumulative Performance Index (S.P.I and C.P.I)", 10, spiTableStartY);
    
        // Table for SPI and CPI Values
        const tableData = [
            ["Semesters" ,"Sem I", "Sem II", "Sem III", "Sem IV", "Sem V", "Sem VI", "Sem VII", "Sem VIII"],
            ["S.P.I", student2.spi_semester1 || "N/A", student2.spi_semester2 || "N/A", student2.spi_semester3 || "N/A", student2.spi_semester4 || "N/A", student2.spi_semester5 || "N/A", student2.spi_semester6 || "N/A", student2.spi_semester7 || "N/A", student2.spi_semester8 || "N/A"],
            ["C.P.I",student2.cpi.toFixed(2)|| "NA"]
        ];
    
        let yOffset = spiTableStartY + 10;
        tableData.forEach((row, rowIndex) => {
            row.forEach((cell, cellIndex) => {
                doc.text(cell.toString(), 10 + cellIndex * 22, yOffset); // Adjust the x-offset for alignment
            });
            yOffset += 10; // Move down for the next row
        });
    
        // Save the PDF
        doc.save(`${student.id}_GradeCard.pdf`);
    };




    return (
        <div className="upload-excel-container">
            <div className="form-box">
                <h3>Select Semester</h3>
                <select value={semester} onChange={handleSemesterChange}>
                    <option value="">Select Semester</option>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                        <option key={sem} value={sem}>
                            Semester {sem}
                        </option>
                    ))}
                </select>

                <h3>Upload Excel Sheets for Courses</h3>
                <input type="file" multiple onChange={handleFileUpload} /> {/* Allow multiple file upload */}

                <h3>Search Student by ID</h3>
                <input
                    type="text"
                    placeholder="Enter Student ID"
                    value={studentId}
                    onChange={handleStudentIdChange}
                />
                <button onClick={handleSearchStudent}>Search</button>

                {fileUploaded && (
                    <button className="spi-button" onClick={handleCalculateSPI}>
                        Calculate SPI and Update Database
                    </button>
                )}
                {updateSuccess && <div className="notification">Update Successful!</div>}
            </div>

            {studentData && (
                <div className="student-info-box">
                    <h3>Student Information</h3>
                    <table border="1">
                        <thead>
                            <tr>
                                <th>Student ID</th>
                                <th>Name</th>
                                <th>Sem I</th>
                                <th>Sem II</th>
                                <th>Sem III</th>
                                <th>Sem IV</th>
                                <th>Sem V</th>
                                <th>Sem VI</th>
                                <th>Sem VII</th>
                                <th>Sem VIII</th>
                                <th>CPI</th>
                            </tr>
                        </thead>
                        <tbody>
                        <tr>
                                <td>{studentData[0].student_id}</td>
                                <td>{studentData[0].name}</td>
                                <td>{studentData[0].spi_semester1 || "N/A"}</td>
                                <td>{studentData[0].spi_semester2 || "N/A"}</td>
                                <td>{studentData[0].spi_semester3 || "N/A"}</td>
                                <td>{studentData[0].spi_semester4 || "N/A"}</td>
                                <td>{studentData[0].spi_semester5 || "N/A"}</td>
                                <td>{studentData[0].spi_semester6 || "N/A"}</td>
                                <td>{studentData[0].spi_semester7 || "N/A"}</td>
                                <td>{studentData[0].spi_semester8 || "N/A"}</td>
                                <td>
                                    {(
                                        [
                                            studentData[0].spi_semester1,
                                            studentData[0].spi_semester2,
                                            studentData[0].spi_semester3,
                                            studentData[0].spi_semester4,
                                            studentData[0].spi_semester5,
                                            studentData[0].spi_semester6,
                                            studentData[0].spi_semester7,
                                            studentData[0].spi_semester8
                                        ].filter(spi => spi !== null && spi !== undefined).reduce((sum, spi) => sum + spi, 0) /
                                        [
                                            studentData[0].spi_semester1,
                                            studentData[0].spi_semester2,
                                            studentData[0].spi_semester3,
                                            studentData[0].spi_semester4,
                                            studentData[0].spi_semester5,
                                            studentData[0].spi_semester6,
                                            studentData[0].spi_semester7,
                                            studentData[0].spi_semester8
                                        ].filter(spi => spi !== null && spi !== undefined).length
                                    ).toFixed(2) || "N/A"}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                    <button  onClick={handleDownloadPDF}>Download PDF</button>
                </div>
            )}

            {error && <p style={{ color: "red" }}>{error}</p>}
        </div>
    );
};

export default UploadExcel;
