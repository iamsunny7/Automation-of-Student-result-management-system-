export const convertGradeToValue = (grade) => {
    switch (grade) {
        case "AA": return 10;
        case "AB": return 9;
        case "BB": return 8;
        case "BC": return 7;
        case "CC": return 6;
        case "CD": return 5;
        case "DD": return 4;
        case "FF": return 0;
        default: return 0;
    }
};