// Import necessary modules
const express = require("express");
const mysql = require("mysql");
const cors = require("cors");

// Initialize Express app
const app = express();
const port = 3001;

// Middleware
app.use(cors()); // Enable CORS for cross-origin requests
app.use(express.json()); // Enable parsing of JSON data

// Create MySQL connection
const db = mysql.createConnection({
    host: "localhost",
    user: "root",           // Replace with your MySQL username
    password: "Ssunny@7321", // Replace with your MySQL password
    database: "student_results", // Replace with your database name
});

// Connect to MySQL
db.connect((err) => {
    if (err) {
        console.error("Error connecting to MySQL:", err);
        return;
    }
    console.log("Connected to MySQL database");
});


app.get("/student/:studentId", (req, res) => {
    const { studentId } = req.params;
    const query = `SELECT * FROM students WHERE student_id = ?`;

    db.query(query, [studentId], (err, result) => {
        if (err) {
            console.error("Error fetching student data:", err);
            return res.status(500).send({ error: "Error fetching student data" });
        }
        if (result.length === 0) {
            return res.status(404).send({ message: "Student not found" });
        }
        res.status(200).json(result[0]);
    });
});


// Function to check if a column exists in the table and create it if it doesn't
const checkOrCreateColumn = (semester, callback) => {
    const columnName = `spi_semester${semester}`;  // e.g., spi_semester1, spi_semester2

    // Check if the column already exists in the table
    const checkColumnQuery = `SHOW COLUMNS FROM students LIKE ?`;
    db.query(checkColumnQuery, [columnName], (err, result) => {
        if (err) return callback(err);

        if (result.length === 0) {
            // If the column doesn't exist, create it
            console.log(columnName)
            const createColumnQuery = `ALTER TABLE students ADD COLUMN ${columnName} FLOAT DEFAULT NULL`;
            db.query(createColumnQuery, (err, result) => {
                if (err) return callback(err);
                console.log(`Created new column: ${columnName}`);
                callback(null, true);  // Column created
            });
        } else {
            console.log(`Column ${columnName} already exists`);
            callback(null, false);  // Column already exists
        }
    });
};
app.post("/api/check-or-insert-student", (req, res) => {
    
    const { student_id, name } = req.body;
    
    
    // Check if the student exists in the database
    const checkStudentQuery = "SELECT * FROM students WHERE student_id = ?";
    db.query(checkStudentQuery, [student_id], (err, result) => {
        if (err) {
            console.error("Error checking student:", err);
            return res.status(500).send({ error: "Database query failed" });
        }
       
        
        // If student doesn't exist, insert them with null values for SPI, CPI, and semesters
        if (result.length === 0) {
            const insertStudentQuery = `
            INSERT INTO students (student_id, name, spi_semester1, spi_semester2, spi_semester3, spi_semester4, 
            spi_semester5, spi_semester6, spi_semester7, spi_semester8, cpi) 
            VALUES (?, ?, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL)
            `;
           
            db.query(insertStudentQuery, [student_id, name], (err, insertResult) => {
                if (err) {
                    console.error("Error inserting student:", err);
                    return res.status(500).send({ error: "Failed to insert new student" });
                }
                
                res.status(200).send({ message: "New student inserted" });
            });
            
        } else {
            // Student already exists
            res.status(200).send({ message: "Student already exists" });
        }
    });
});

// Endpoint to update student's SPI for a particular semester
app.post("/update-student", (req, res) => {
    const { student_id, spi, semester } = req.body; // Extract student_id, SPI, and semester from request body

    // Validate that student_id, spi, and semester are provided
    if (!student_id || spi === undefined || !semester) {
        return res.status(400).send({ error: "student_id, spi, and semester are required" });
    }

    // Check or create the semester column in the database
    checkOrCreateColumn(semester, (err, columnCreated) => {
        if (err) {
            console.error("Error checking/creating column:", err);
            return res.status(500).send({ error: "Failed to check/create semester column" });
        }

        // Now update the SPI in the specific semester column
        const columnName = `spi_semester${semester}`; // e.g., spi_semester1, spi_semester2
        const query = `UPDATE students SET ?? = ? WHERE student_id = ?`;

        db.query(query, [columnName, spi, student_id], (err, result) => {
            if (err) {
                console.error("Error updating SPI:", err);
                return res.status(500).send({ error: "Database update failed" });
            }
            if (result.affectedRows === 0) {
                return res.status(404).send({ message: "Student not found" });
            }
            res.status(200).send({ message: `Student SPI updated successfully for semester ${semester}` });
        });
    });
});


// app.post("/update-student", (req, res) => {
//     const { student_id, name, spi, semester } = req.body;

//     if (!student_id || !name || spi === undefined || !semester) {
//         return res.status(400).send({ error: "student_id, name, spi, and semester are required" });
//     }

//     // First, check if the student exists in the database
//     const checkStudentQuery = `SELECT * FROM students WHERE student_id = ?`;
//     db.query(checkStudentQuery, [student_id], (err, result) => {
//         if (err) {
//             console.error("Error checking student:", err);
//             return res.status(500).send({ error: "Database query failed" });
//         }

//         // If the student does not exist, insert them into the database
//         if (result.length === 0) {
//             const insertStudentQuery = `INSERT INTO students (student_id, name, spi_semester1,spi_semester2,spi_semester3,spi_semester4,spi_semester5,spi_semester6,spi_semester7,spi_semester8,cpi) VALUES (?, ?, NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL)`;
//             db.query(insertStudentQuery, [student_id, name], (err, insertResult) => {
//                 if (err) {
//                     console.error("Error inserting student:", err);
//                     return res.status(500).send({ error: "Failed to insert new student" });
//                 }
//                 console.log("New student inserted");
//                 updateSPI();
//             });
//         } else {
//             updateSPI();
//         }

//         // Function to update SPI for the specified semester
//         function updateSPI() {
//             const columnName = `spi_semester${semester}`;
            
//             // Ensure that the semester column exists
//             checkOrCreateColumn(semester, (err, columnCreated) => {
//                 if (err) {
//                     console.error("Error checking/creating column:", err);
//                     return res.status(500).send({ error: "Failed to check/create semester column" });
//                 }

//                 // Update the SPI in the specific semester column
//                 const updateQuery = `UPDATE students SET ?? = ? WHERE student_id = ?`;
//                 db.query(updateQuery, [columnName, spi, student_id], (err, updateResult) => {
//                     if (err) {
//                         console.error("Error updating SPI:", err);
//                         return res.status(500).send({ error: "Database update failed" });
//                     }
//                     res.status(200).send({ message: `Student SPI updated successfully for semester ${semester}` });
//                 });
//             });
//         }
//     });
// });

// Start the Express server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
