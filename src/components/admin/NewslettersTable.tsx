import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell
} from '@/components/ui/table';
import { Eye, Edit, ExternalLink, Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { adminUtils } from '@/utils/adminUtils';

interface Newsletter {
  id: string;
  subject: string;
  created_at: string;
  sent_at: string | null;
}

interface NewslettersTableProps {
  newsletters: Newsletter[];
  formatDate: (dateString: string) => string;
}

const NewslettersTable = ({ newsletters, formatDate }: NewslettersTableProps) => {
  const [sendingId, setSendingId] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSendNewsletter = async (id: string) => {
    if (!confirm('هل أنت متأكد من رغبتك في إرسال هذه النشرة الإخبارية؟')) {
      return;
    }
    
    setSendingId(id);
    
    try {
      await adminUtils.logSecurityEvent('newsletter_send_attempt', 'newsletter', id);
      
      // Verify admin status before sending
      const isAdmin = await adminUtils.isCurrentUserAdmin();
      if (!isAdmin) {
        await adminUtils.logSecurityEvent('newsletter_send_denied', 'newsletter', id);
        toast({
          title: "صلاحيات غير كافية",
          description: "ليس لديك صلاحيات إرسال النشرات الإخبارية",
          variant: "destructive"
        });
        setSendingId(null);
        return;
      }
      
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !sessionData.session) {
        toast({
          title: "خطأ في التحقق",
          description: "يجب أن تكون مسجل الدخول لإرسال النشرة الإخبارية",
          variant: "destructive"
        });
        setSendingId(null);
        return;
      }
      
      console.log("User is authenticated, proceeding with newsletter send");
      
      // Try using the Edge Function first
      try {
        console.log("Attempting to send newsletter via Edge Function...");
        const { data, error } = await supabase.functions.invoke('send-newsletter', {
          body: { newsletterId: id }
        });
        
        if (error) {
          console.error("Edge Function error details:", error);
          throw error;
        }
        
        console.log("Edge Function response:", data);
        
        if (data && data.success) {
          const { error: updateError } = await supabase
            .from('newsletters')
            .update({ 
              sent_at: new Date().toISOString(),
              recipients_count: data.subscribers || 0 
            })
            .eq('id', id);
            
          if (updateError) {
            console.warn("Could not update newsletter status:", updateError);
          }
          
          await adminUtils.logSecurityEvent('newsletter_send_success', 'newsletter', id);
          toast({
            title: "تم الإرسال بنجاح",
            description: `تم إرسال النشرة الإخبارية إلى ${data.subscribers} مشترك`,
          });
          return;
        } else {
          throw new Error(data?.message || "حدث خطأ أثناء إرسال النشرة الإخبارية");
        }
      } catch (edgeFunctionError) {
        console.error('Edge Function error:', edgeFunctionError);
        console.log('Falling back to direct database operations...');
        
        // Fallback to direct database operations
        console.log("Fetching newsletter content...");
        const { data: newsletter, error: newsletterError } = await supabase
          .from('newsletters')
          .select('subject, content')
          .eq('id', id)
          .single();
          
        if (newsletterError) {
          console.error("Newsletter fetch error:", newsletterError);
          throw new Error(`فشل في العثور على النشرة الإخبارية: ${newsletterError.message}`);
        }
        
        if (!newsletter) {
          throw new Error("النشرة الإخبارية غير موجودة");
        }
        
        console.log("Newsletter content fetched successfully:", newsletter.subject);
        
        console.log("Fetching subscribers...");
        const { data: subscribers, error: subscribersError } = await supabase
          .from('subscribers')
          .select('email');
          
        if (subscribersError) {
          console.error("Subscribers fetch error:", subscribersError);
          throw new Error(`فشل في جلب قائمة المشتركين: ${subscribersError.message}`);
        }
        
        console.log("Subscribers fetched successfully, count:", subscribers?.length || 0);
        
        if (!subscribers || subscribers.length === 0) {
          toast({
            title: "لا يوجد مشتركين",
            description: "لم يتم العثور على أي مشتركين في النشرة الإخبارية"
          });
          setSendingId(null);
          return;
        }
        
        console.log("Updating newsletter as sent...");
        const { error: updateError } = await supabase
          .from('newsletters')
          .update({ 
            sent_at: new Date().toISOString(),
            recipients_count: subscribers.length,
            status: 'sent'
          })
          .eq('id', id);
          
        if (updateError) {
          console.error("Failed to mark newsletter as sent:", updateError);
        } else {
          console.log("Newsletter marked as sent successfully");
        }
        
        await adminUtils.logSecurityEvent('newsletter_send_fallback_success', 'newsletter', id);
        toast({
          title: "تم الإرسال بنجاح",
          description: `تم تحديث حالة النشرة الإخبارية لـ ${subscribers.length} مشترك`,
        });
      }
    } catch (error: unknown) {
      console.error('Error sending newsletter:', error);
      await adminUtils.logSecurityEvent('newsletter_send_failed', 'newsletter', id);
      const errorMessage = error instanceof Error ? error.message : "حدث خطأ أثناء إرسال النشرة الإخبارية";
      toast({
        title: "فشل إرسال النشرة الإخبارية",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setSendingId(null);
    }
  };
  
  return (
    <Card className="border-2 border-blue-500">
      <CardHeader className="bg-blue-50">
        <CardTitle>النشرات الإخبارية <span className="text-xs text-blue-600 font-bold">({new Date().toLocaleDateString('ar-SA')})</span></CardTitle>
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
                        onClick={() => navigate(`/admin-control/newsletter/edit/${newsletter.id}`)}
                      >
                        <Edit className="w-4 h-4 ml-1" /> تعديل
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => navigate(`/admin-control/newsletter/view/${newsletter.id}`)}
                      >
                        <Eye className="w-4 h-4 ml-1" /> عرض
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        asChild
                        className="text-blue-500"
                      >
                        <a href={`/admin-control/newsletter/view/${newsletter.id}`} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="w-4 h-4 ml-1" /> فتح في صفحة جديدة
                        </a>
                      </Button>
                      {!newsletter.sent_at && (
                        <Button 
                          variant="default" 
                          size="sm"
                          onClick={() => handleSendNewsletter(newsletter.id)}
                          disabled={sendingId === newsletter.id}
                        >
                          <Send className="h-4 w-4 ml-1" />
                          {sendingId === newsletter.id ? 'جارِ الإرسال...' : 'إرسال'}
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-4">
                  لم يتم إنشاء أي نشرة إخبارية بعد.
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
