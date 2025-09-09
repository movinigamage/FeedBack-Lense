// CSV Validator Module for Survey Creation
// Validates uploaded CSV files according to survey requirements

export class CSVValidator {
    constructor() {
        this.validTypes = ['text', 'likert', 'multiple-choice'];
        this.requiredHeaders = ['questionId', 'questionText', 'type'];
        this.maxQuestions = 20;
    }

    /**
     * Main validation function
     * @param {File} file - The uploaded CSV file
     * @returns {Promise<{isValid: boolean, data?: any[], errors?: string[]}>}
     */
    async validateCSV(file) {
        try {
            // Step 1: Basic file validation
            const fileValidation = this.validateFile(file);
            if (!fileValidation.isValid) {
                return { isValid: false, errors: fileValidation.errors };
            }

            // Step 2: Parse CSV content
            const parseResult = await this.parseCSVFile(file);
            if (!parseResult.success) {
                return { isValid: false, errors: [parseResult.error] };
            }

            // Step 3: Validate CSV structure and content
            const contentValidation = this.validateCSVContent(parseResult.data);
            if (!contentValidation.isValid) {
                return { isValid: false, errors: contentValidation.errors };
            }

            return { 
                isValid: true, 
                data: contentValidation.processedData,
                rawData: parseResult.data
            };

        } catch (error) {
            console.error('CSV validation error:', error);
            return { 
                isValid: false, 
                errors: ['An unexpected error occurred while processing the file'] 
            };
        }
    }

    /**
     * Validate file basic properties
     * @param {File} file 
     * @returns {{isValid: boolean, errors: string[]}}
     */
    validateFile(file) {
        const errors = [];

        // Check file type
        if (!file.name.toLowerCase().endsWith('.csv')) {
            errors.push('File must be a CSV format (.csv)');
        }

        // Check file size (1MB limit)
        const maxSize = 1024 * 1024; // 1MB in bytes
        if (file.size > maxSize) {
            errors.push('File size must be less than 1MB');
        }

        // Check if file is empty
        if (file.size === 0) {
            errors.push('File cannot be empty');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    /**
     * Parse CSV file using Papa Parse
     * @param {File} file 
     * @returns {Promise<{success: boolean, data?: any[], error?: string}>}
     */
    parseCSVFile(file) {
        return new Promise((resolve) => {
            Papa.parse(file, {
                header: true,
                skipEmptyLines: true,
                complete: (results) => {
                    if (results.errors.length > 0) {
                        const errorMessages = results.errors.map(err => 
                            `Row ${err.row}: ${err.message}`
                        ).join('; ');
                        resolve({ 
                            success: false, 
                            error: `CSV parsing errors: ${errorMessages}` 
                        });
                        return;
                    }

                    resolve({ 
                        success: true, 
                        data: results.data 
                    });
                },
                error: (error) => {
                    resolve({ 
                        success: false, 
                        error: `Failed to parse CSV: ${error.message}` 
                    });
                }
            });
        });
    }

    /**
     * Validate CSV content structure and data
     * @param {any[]} data 
     * @returns {{isValid: boolean, errors: string[], processedData?: any[]}}
     */
    validateCSVContent(data) {
        const errors = [];
        const processedData = [];

        // Check if data exists
        if (!data || data.length === 0) {
            errors.push('CSV file is empty or contains no valid rows');
            return { isValid: false, errors };
        }

        // Check question count
        if (data.length > this.maxQuestions) {
            errors.push(`Too many questions. Maximum allowed: ${this.maxQuestions}, found: ${data.length}`);
        }

        // Check required headers
        const firstRow = data[0];
        const missingHeaders = this.requiredHeaders.filter(header => 
            !(header in firstRow)
        );
        
        if (missingHeaders.length > 0) {
            errors.push(`Missing required headers: ${missingHeaders.join(', ')}`);
        }

        // If basic structure is invalid, return early
        if (errors.length > 0) {
            return { isValid: false, errors };
        }

        // Validate each question row
        const questionIds = new Set();
        data.forEach((row, index) => {
            const rowNumber = index + 1;
            const rowErrors = this.validateQuestionRow(row, rowNumber, questionIds);
            errors.push(...rowErrors);

            // Process and clean the row data
            if (rowErrors.length === 0) {
                const processedRow = this.processQuestionRow(row);
                processedData.push(processedRow);
            }
        });

        return {
            isValid: errors.length === 0,
            errors,
            processedData: errors.length === 0 ? processedData : undefined
        };
    }

    /**
     * Validate individual question row
     * @param {any} row 
     * @param {number} rowNumber 
     * @param {Set} questionIds 
     * @returns {string[]}
     */
    validateQuestionRow(row, rowNumber, questionIds) {
        const errors = [];

        // Check questionId
        if (!row.questionId || row.questionId.trim() === '') {
            errors.push(`Row ${rowNumber}: questionId is required`);
        } else {
            const questionId = row.questionId.trim();
            if (questionIds.has(questionId)) {
                errors.push(`Row ${rowNumber}: Duplicate questionId '${questionId}'`);
            } else {
                questionIds.add(questionId);
            }
        }

        // Check questionText
        if (!row.questionText || row.questionText.trim() === '') {
            errors.push(`Row ${rowNumber}: questionText is required`);
        }

        // Check type
        if (!row.type || row.type.trim() === '') {
            errors.push(`Row ${rowNumber}: type is required`);
        } else {
            const type = row.type.trim().toLowerCase();
            if (!this.validTypes.includes(type)) {
                errors.push(`Row ${rowNumber}: Invalid type '${type}'. Valid types: ${this.validTypes.join(', ')}`);
            }
        }

        // Check options for multiple-choice questions
        if (row.type && row.type.trim().toLowerCase() === 'multiple-choice') {
            if (!row.options || row.options.trim() === '') {
                errors.push(`Row ${rowNumber}: options are required for multiple-choice questions`);
            } else {
                const options = row.options.split(';').map(opt => opt.trim()).filter(opt => opt);
                if (options.length < 2) {
                    errors.push(`Row ${rowNumber}: multiple-choice questions need at least 2 options separated by semicolons`);
                }
            }
        }

        return errors;
    }

    /**
     * Process and clean question row data
     * @param {any} row 
     * @returns {any}
     */
    processQuestionRow(row) {
        const processed = {
            questionId: row.questionId.trim(),
            questionText: row.questionText.trim(),
            type: row.type.trim().toLowerCase()
        };

        // Process options for multiple-choice questions
        if (processed.type === 'multiple-choice' && row.options) {
            processed.options = row.options
                .split(';')
                .map(opt => opt.trim())
                .filter(opt => opt);
        }

        return processed;
    }

    /**
     * Generate user-friendly error summary
     * @param {string[]} errors 
     * @returns {string}
     */
    generateErrorSummary(errors) {
        if (errors.length === 0) return '';

        const summary = `Found ${errors.length} error${errors.length > 1 ? 's' : ''}:\n`;
        return summary + errors.map(error => `• ${error}`).join('\n');
    }

    /**
     * Create sample CSV content for user reference
     * @returns {string}
     */
    getSampleCSV() {
        return `questionId,questionText,type,options
Q1,How would you rate the course overall?,likert,
Q2,What did you like most about the course?,text,
Q3,Which format do you prefer for future courses?,multiple-choice,"Online;In-person;Hybrid"
Q4,Any additional feedback?,text,`;
    }
}

// Create a singleton instance for easy import
export const csvValidator = new CSVValidator();
