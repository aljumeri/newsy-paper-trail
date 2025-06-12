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
    try {
      // First, get the newsletter content
      const { data: newsletter, error: newsletterError } = await supabase
        .from('newsletters')
        .select('subject, content')
        .eq('id', id)
        .single();

      if (newsletterError) throw newsletterError;
      if (!newsletter) throw new Error('Newsletter not found');

      // Get all subscribers
      const { data: subscribers, error: subscribersError } = await supabase
        .from('subscribers')
        .select('email');

      if (subscribersError) throw subscribersError;
      if (!subscribers || subscribers.length === 0) {
        toast({
          title: "لا يوجد مشتركين",
          description: "لم يتم العثور على أي مشتركين في النشرة الإخبارية"
        });
        return;
      }

      // Update newsletter as sent
      const { error: updateError } = await supabase
        .from('newsletters')
        .update({ 
          sent_at: new Date().toISOString(),
          recipients_count: subscribers.length,
          status: 'sent'
        })
        .eq('id', id);

      if (updateError) throw updateError;

      // Call the send-newsletter edge function
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-newsletter`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({
          newsletterId: id
        })
      });

      if (!response.ok) {
        throw new Error('Failed to send newsletter');
      }

      toast({
        title: "تم الإرسال",
        description: `تم إرسال النشرة الإخبارية إلى ${subscribers.length} مشترك`
      });

      if (onRefresh) await onRefresh();
    } catch (error: any) {
      console.error('Error sending newsletter:', error);
      toast({
        title: "خطأ",
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
                          className="text-green-500"
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
