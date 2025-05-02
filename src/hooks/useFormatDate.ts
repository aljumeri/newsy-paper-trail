
const useFormatDate = () => {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'غير متوفر';

    try {
      // Make sure we're working with a valid date string
      const timestamp = Date.parse(dateString);
      
      // Check if date is valid
      if (isNaN(timestamp)) {
        console.warn('Invalid date received:', dateString);
        return 'تاريخ غير صالح';
      }
      
      const date = new Date(timestamp);
      
      return new Intl.DateTimeFormat('ar-SA', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'خطأ في التنسيق';
    }
  };

  return { formatDate };
};

export default useFormatDate;
