
const useFormatDate = () => {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'غير متوفر';

    try {
      let date: Date;
      
      // Handle different date formats
      if (dateString.includes('-') && dateString.includes(':')) {
        // Standard ISO format or MySQL datetime format
        date = new Date(dateString);
      } else if (dateString.includes('/')) {
        // Date with slashes (e.g., MM/DD/YYYY)
        date = new Date(dateString);
      } else if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
        // Date only format (YYYY-MM-DD)
        date = new Date(dateString + 'T00:00:00');
      } else if (dateString.match(/^\d{10,13}$/)) {
        // Unix timestamp (seconds or milliseconds)
        const timestamp = parseInt(dateString);
        date = new Date(timestamp > 1000000000000 ? timestamp : timestamp * 1000);
      } else {
        // Try parsing as is
        const timestamp = Date.parse(dateString);
        if (isNaN(timestamp)) {
          console.warn('Invalid date received:', dateString);
          return 'تاريخ غير صالح';
        }
        date = new Date(timestamp);
      }
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        console.warn('Invalid date after parsing:', dateString);
        return 'تاريخ غير صالح';
      }
      
      return new Intl.DateTimeFormat('ar-SA', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    } catch (error) {
      console.error('Error formatting date:', error, 'Date string:', dateString);
      return 'خطأ في التنسيق';
    }
  };

  return { formatDate };
};

export default useFormatDate;
