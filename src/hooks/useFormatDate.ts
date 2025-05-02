
const useFormatDate = () => {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'غير متوفر';

    try {
      const date = new Date(dateString);
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
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
      console.error('Error formatting date:', error);
      return 'خطأ في التنسيق';
    }
  };

  return { formatDate };
};

export default useFormatDate;
