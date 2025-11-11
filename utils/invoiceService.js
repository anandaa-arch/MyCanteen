// app/utils/invoiceService.js

/**
 * Downloads invoice for a user for specified date range
 * @param {Object} params - Invoice parameters
 * @param {string} params.userId - User ID
 * @param {string} params.userName - User name
 * @param {string} params.startDate - Start date (YYYY-MM-DD)
 * @param {string} params.endDate - End date (YYYY-MM-DD)
 * @param {string} params.month - Month name for filename
 * @param {string} params.year - Year for filename
 */
export async function downloadInvoice({ userId, userName, startDate, endDate, month, year }) {
  try {
    const response = await fetch('/api/invoice', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        userName,
        startDate,
        endDate,
      }),
    });

    if (!response.ok) {
      let errorMessage = 'Invoice generation failed';
      try {
        const errorData = await response.json();
        if (errorData.message) {
          errorMessage = errorData.message;
        } else if (errorData.error) {
          errorMessage = errorData.error;
        }
      } catch (e) {
        errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      }
      throw new Error(errorMessage);
    }

    // Get the blob from response
    const blob = await response.blob();
    
    if (blob.size === 0) {
      throw new Error('Received empty invoice');
    }
    
    // Verify it's actually a PDF
    if (!blob.type.includes('pdf')) {
      console.warn('Warning: Blob type is', blob.type, 'instead of PDF');
    }
    
    // Create download link
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Invoice_${userName}_${month}_${year}.pdf`;
    
    // Trigger download
    document.body.appendChild(link);
    link.click();
    
    // Cleanup
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    
    return { success: true };
    
  } catch (error) {
    console.error('Error downloading invoice:', error);
    throw error;
  }
}

/**
 * Validates date range for invoice generation
 * @param {string} startDate - Start date
 * @param {string} endDate - End date
 * @returns {boolean} - True if valid
 */
export function validateDateRange(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const now = new Date();

  // Check if dates are valid
  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return false;
  }

  // Check if start date is before end date
  if (start > end) {
    return false;
  }

  // Check if end date is not in the future
  if (end > now) {
    return false;
  }

  return true;
}

/**
 * Formats date for display
 * @param {string} dateString - Date string
 * @returns {string} - Formatted date
 */
export function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}