// Error Handling Utility
export class ErrorHandler {
    static async handleAsyncOperation(operation, fallback = null, errorMessage = 'An error occurred') {
        try {
            return await operation();
        } catch (error) {
            console.error(`${errorMessage}:`, error);
            
            // Show user-friendly error message
            if (typeof error === 'object' && error.message) {
                ErrorHandler.showUserError(`${errorMessage}: ${error.message}`);
            } else {
                ErrorHandler.showUserError(errorMessage);
            }
            
            return fallback;
        }
    }

    static showUserError(message) {
        const errorDiv = document.getElementById('loadError');
        if (errorDiv) {
            errorDiv.style.display = 'block';
            errorDiv.textContent = message;
            
            // Auto-hide after 5 seconds
            setTimeout(() => {
                errorDiv.style.display = 'none';
            }, 5000);
        } else {
            // Fallback to alert if no error div available
            alert(message);
        }
    }

    static hideError() {
        const errorDiv = document.getElementById('loadError');
        if (errorDiv) {
            errorDiv.style.display = 'none';
        }
    }

    static createRetryableOperation(operation, maxRetries = 3, delay = 1000) {
        return async function(...args) {
            let lastError;
            
            for (let attempt = 1; attempt <= maxRetries; attempt++) {
                try {
                    return await operation.apply(this, args);
                } catch (error) {
                    lastError = error;
                    console.warn(`Attempt ${attempt}/${maxRetries} failed:`, error);
                    
                    if (attempt < maxRetries) {
                        await new Promise(resolve => setTimeout(resolve, delay));
                    }
                }
            }
            
            throw lastError;
        };
    }
}