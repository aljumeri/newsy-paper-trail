import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Edit, ExternalLink, Eye, Mail, Send, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { sendNewsletterToSingleEmail } from '../../utils/subscriptionService';

interface Newsletter {
  id: string;
  main_title: string;
  created_at: string;
  sent_at: string | null;
}

interface NewslettersTableProps {
  newsletters: Newsletter[];
  formatDate: (dateString: string) => string;
  onRefresh?: () => Promise<void>;
}

const NewslettersTable = ({
  newsletters,
  formatDate,
  onRefresh,
}: NewslettersTableProps) => {
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [testingId, setTestingId] = useState<string | null>(null);
  const [testEmail, setTestEmail] = useState<string>('');
  const [showTestDialog, setShowTestDialog] = useState<boolean>(false);
  const [selectedNewsletterId, setSelectedNewsletterId] = useState<string>('');
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSendNewsletter = async (id: string) => {
    setSendingId(id);
    try {
      // First, get the newsletter content
      const { data: newsletter, error: newsletterError } = await supabase
        .from('newsletters')
        .select('main_title, content')
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
          title: 'لا يوجد مشتركين',
          description: 'لم يتم العثور على أي مشتركين في النشرة الإخبارية',
        });
        return;
      }

      // Update newsletter as sent
      const { error: updateError } = await supabase
        .from('newsletters')
        .update({
          sent_at: new Date().toISOString(),
          recipients_count: subscribers.length,
          status: 'sent',
        })
        .eq('id', id);

      if (updateError) throw updateError;

      // Call the send-newsletter edge function
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-newsletter`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            newsletterId: id,
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to send newsletter');
      }

      toast({
        title: 'تم الإرسال',
        description: `تم إرسال النشرة الإخبارية إلى ${subscribers.length} مشترك`,
      });

      if (onRefresh) await onRefresh();
    } catch (error: any) {
      console.error('Error sending newsletter:', error);
      toast({
        title: 'خطأ',
        description: error.message || 'حدث خطأ أثناء إرسال النشرة الإخبارية',
        variant: 'destructive',
      });
    } finally {
      setSendingId(null);
    }
  };

  const handleDeleteNewsletter = async (id: string) => {
    setDeletingId(id);
    try {
      const { error } = await supabase
        .from('newsletters')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'تم الحذف بنجاح',
        description: 'تم حذف النشرة الإخبارية بنجاح',
      });

      if (onRefresh) await onRefresh();
    } catch (error: any) {
      console.error('Error deleting newsletter:', error);
      toast({
        title: 'خطأ في الحذف',
        description: error.message || 'حدث خطأ أثناء حذف النشرة الإخبارية',
        variant: 'destructive',
      });
    } finally {
      setDeletingId(null);
    }
  };

  const handleTestEmail = async (id: string) => {
    if (!testEmail.trim()) {
      toast({
        title: 'خطأ',
        description: 'يرجى إدخال عنوان البريد الإلكتروني',
        variant: 'destructive',
      });
      return;
    }

    setTestingId(id);
    try {
      const result = await sendNewsletterToSingleEmail(id, testEmail.trim());
      
      toast({
        title: 'تم الإرسال بنجاح',
        description: `تم إرسال النشرة الإخبارية إلى ${testEmail}`,
      });

      setTestEmail('');
      setShowTestDialog(false);
    } catch (error: any) {
      console.error('Error sending test email:', error);
      toast({
        title: 'خطأ',
        description: error.message || 'حدث خطأ أثناء إرسال البريد الإلكتروني التجريبي',
        variant: 'destructive',
      });
    } finally {
      setTestingId(null);
    }
  };

  return (
    <Card className="border-2 border-blue-500 overflow-hidden">
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
              newsletters.map(newsletter => (
                <TableRow key={newsletter.id} className="hover:bg-gray-50">
                  <TableCell>{newsletter.main_title}</TableCell>
                  <TableCell>{formatDate(newsletter.created_at)}</TableCell>
                  <TableCell>
                    {newsletter.sent_at
                      ? formatDate(newsletter.sent_at)
                      : 'لم يتم الإرسال بعد'}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          navigate(`/admin-control/edit/${newsletter.id}`)
                        }
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
                        <a
                          href={`/newsletter/${newsletter.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="w-4 h-4 ml-1" /> فتح في صفحة
                          جديدة
                        </a>
                      </Button>
                      {!newsletter.sent_at && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleSendNewsletter(newsletter.id)}
                            disabled={sendingId === newsletter.id}
                            className="text-green-500"
                          >
                            <Send className="w-4 h-4 ml-1" />
                            {sendingId === newsletter.id
                              ? 'جاري الإرسال...'
                              : 'إرسال'}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedNewsletterId(newsletter.id);
                              setShowTestDialog(true);
                            }}
                            disabled={testingId === newsletter.id}
                            className="text-blue-500"
                          >
                            <Mail className="w-4 h-4 ml-1" />
                            {testingId === newsletter.id
                              ? 'جاري الإرسال...'
                              : 'إرسال تجريبي'}
                          </Button>
                        </>
                      )}
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            disabled={deletingId === newsletter.id}
                          >
                            <Trash2 className="w-4 h-4 ml-1" />
                            {deletingId === newsletter.id ? 'جاري الحذف...' : 'حذف'}
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
                            <AlertDialogDescription>
                              هل أنت متأكد من رغبتك في حذف النشرة الإخبارية "{newsletter.main_title}"؟ 
                              لا يمكن التراجع عن هذا الإجراء.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>إلغاء</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteNewsletter(newsletter.id)}
                              className="bg-red-500 hover:bg-red-600"
                            >
                              حذف
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
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
      
      {/* Test Email Dialog */}
      <AlertDialog open={showTestDialog} onOpenChange={setShowTestDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>إرسال تجريبي</AlertDialogTitle>
            <AlertDialogDescription>
              أدخل عنوان البريد الإلكتروني لإرسال النشرة الإخبارية كتجربة
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Input
              type="email"
              placeholder="example@email.com"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              className="w-full"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setTestEmail('');
              setShowTestDialog(false);
            }}>
              إلغاء
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => handleTestEmail(selectedNewsletterId)}
              disabled={!testEmail.trim() || testingId !== null}
            >
              إرسال
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};

export default NewslettersTable;
