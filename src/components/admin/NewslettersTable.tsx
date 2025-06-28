
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Edit, ExternalLink, Eye, Send } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface Newsletter {
  id: string;
  subject: string;
  created_at: string;
  sent_at: string | null;
}

interface NewslettersTableProps {
  newsletters: Newsletter[];
  formatDate: (dateString: string) => string;
  onRefresh?: () => Promise<void>;
}

const NewslettersTable = ({ newsletters, formatDate, onRefresh }: NewslettersTableProps) => {
  const [sendingId, setSendingId] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSendNewsletter = async (id: string) => {
    setSendingId(id);
    console.log(`Starting newsletter send process for ID: ${id}`);
    
    try {
      // Call the send-newsletter edge function
      console.log('Calling send-newsletter edge function...');
      const { data, error } = await supabase.functions.invoke('send-newsletter', {
        body: {
          newsletterId: id
        }
      });

      console.log('Edge function response:', { data, error });

      if (error) {
        console.error('Edge function error:', error);
        throw new Error(error.message || 'Failed to send newsletter');
      }

      if (data && data.success) {
        toast({
          title: "تم الإرسال بنجاح",
          description: data.message || `تم إرسال النشرة الإخبارية إلى ${data.subscribers} مشترك`
        });

        // Refresh the data to show updated status
        if (onRefresh) {
          await onRefresh();
        }
      } else {
        throw new Error(data?.error || 'Failed to send newsletter');
      }

    } catch (error: any) {
      console.error('Error sending newsletter:', error);
      toast({
        title: "خطأ في الإرسال",
        description: error.message || "حدث خطأ أثناء إرسال النشرة الإخبارية",
        variant: "destructive"
      });
    } finally {
      setSendingId(null);
    }
  };

  return (
    <Card className="border-2 border-blue-500">
      <CardHeader className="bg-blue-50">
        <CardTitle>النشرات الإخبارية</CardTitle>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-right">العنوان</TableHead>
              <TableHead className="text-right">تاريخ الإنشاء</TableHead>
              <TableHead className="text-right">تاريخ الإرسال</TableHead>
              <TableHead className="text-right">الإجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {newsletters.length > 0 ? (
              newsletters.map((newsletter) => (
                <TableRow key={newsletter.id} className="hover:bg-gray-50">
                  <TableCell>{newsletter.subject}</TableCell>
                  <TableCell>{formatDate(newsletter.created_at)}</TableCell>
                  <TableCell>
                    {newsletter.sent_at ? formatDate(newsletter.sent_at) : 'لم يتم الإرسال بعد'}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => navigate(`/admin-control/edit/${newsletter.id}`)}
                      >
                        <Edit className="w-4 h-4 ml-1" /> تعديل
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => navigate(`/newsletter/${newsletter.id}`)}
                      >
                        <Eye className="w-4 h-4 ml-1" /> عرض
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        asChild
                        className="text-blue-500"
                      >
                        <a href={`/newsletter/${newsletter.id}`} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="w-4 h-4 ml-1" /> فتح في صفحة جديدة
                        </a>
                      </Button>
                      {!newsletter.sent_at && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSendNewsletter(newsletter.id)}
                          disabled={sendingId === newsletter.id}
                          className="text-green-500 hover:text-green-600"
                        >
                          <Send className="w-4 h-4 ml-1" />
                          {sendingId === newsletter.id ? 'جاري الإرسال...' : 'إرسال'}
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-4">
                  لم يتم العثور على أي نشرات إخبارية.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default NewslettersTable;
