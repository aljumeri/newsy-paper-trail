
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Send } from 'lucide-react';

interface NewsletterFormActionsProps {
  onPreview: () => void;
  onSave: () => void;
  isSaving?: boolean;
  newsletterId?: string;
  onSend?: (id: string) => Promise<void>;
}

const NewsletterFormActions: React.FC<NewsletterFormActionsProps> = ({
  onPreview,
  onSave,
  isSaving = false,
  newsletterId,
  onSend
}) => {
  const [isSending, setIsSending] = useState(false);
  
  const handleSendNewsletter = async () => {
    if (!newsletterId || !onSend) return;
    
    try {
      setIsSending(true);
      await onSend(newsletterId);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex justify-between items-center">
      <Button 
        type="button" 
        variant="outline" 
        onClick={onPreview}
        className="dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
      >
        معاينة
      </Button>
      
      <div className="flex gap-2">
        {newsletterId && onSend && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button 
                type="button" 
                variant="outline"
                className="flex items-center gap-1"
                disabled={isSending || isSaving}
              >
                <Send size={16} />
                {isSending ? "جار الإرسال..." : "إرسال النشرة"}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="dark:bg-gray-800 dark:text-white">
              <AlertDialogHeader>
                <AlertDialogTitle className="dark:text-white">تأكيد إرسال النشرة</AlertDialogTitle>
                <AlertDialogDescription className="dark:text-gray-300">
                  هل أنت متأكد من رغبتك في إرسال هذه النشرة إلى جميع المشتركين؟ لا يمكن التراجع عن هذا الإجراء.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600">إلغاء</AlertDialogCancel>
                <AlertDialogAction onClick={handleSendNewsletter}>إرسال</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
        
        <Button 
          type="button" 
          onClick={onSave}
          disabled={isSaving}
        >
          {isSaving ? "جار الحفظ..." : "حفظ النشرة"}
        </Button>
      </div>
    </div>
  );
};

export default NewsletterFormActions;
