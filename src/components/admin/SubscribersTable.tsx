import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
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
import { Plus, RefreshCw, Trash2 } from 'lucide-react';
import React, { useState } from 'react';

interface Subscriber {
  id: string;
  email: string;
  name?: string;
  created_at: string;
}

export interface SubscribersTableProps {
  subscribers: Subscriber[];
  formatDate: (dateString: string) => string;
  onRefresh?: () => Promise<void>;
  isRefreshing?: boolean;
}

const SubscribersTable: React.FC<SubscribersTableProps> = ({ 
  subscribers, 
  formatDate,
  onRefresh,
  isRefreshing = false 
}) => {
  const [newEmail, setNewEmail] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const { toast } = useToast();

  const handleAddSubscriber = async () => {
    if (!newEmail.trim()) {
      toast({
        title: "خطأ",
        description: "يرجى إدخال بريد إلكتروني",
        variant: "destructive"
      });
      return;
    }

    setIsAdding(true);
    try {
      const { error } = await supabase
        .from('subscribers')
        .insert([{ 
          email: newEmail.trim(),
          created_at: new Date().toISOString()
        }]);

      if (error) throw error;

      toast({
        title: "تمت الإضافة",
        description: "تم إضافة المشترك بنجاح"
      });
      setNewEmail('');
      if (onRefresh) await onRefresh();
    } catch (error: any) {
      toast({
        title: "خطأ",
        description: error.message || "حدث خطأ أثناء إضافة المشترك",
        variant: "destructive"
      });
    } finally {
      setIsAdding(false);
    }
  };

  const handleDeleteSubscriber = async (id: string) => {
    setIsDeleting(id);
    try {
      const { error } = await supabase
        .from('subscribers')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "تم الحذف",
        description: "تم حذف المشترك بنجاح"
      });
      if (onRefresh) await onRefresh();
    } catch (error: any) {
      toast({
        title: "خطأ",
        description: error.message || "حدث خطأ أثناء حذف المشترك",
        variant: "destructive"
      });
    } finally {
      setIsDeleting(null);
    }
  };

  return (
    <Card className="border-2 border-emerald-500">
      <CardHeader className="bg-emerald-50 flex flex-row items-center justify-between">
        <CardTitle>المشتركين</CardTitle>
        <div className="flex gap-2">
          <div className="flex gap-2">
            <Input
              type="email"
              placeholder="البريد الإلكتروني للمشترك الجديد"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              className="w-64"
            />
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleAddSubscriber}
              disabled={isAdding}
            >
              <Plus className="h-4 w-4 ml-1" />
              {isAdding ? 'جاري الإضافة...' : 'إضافة مشترك'}
            </Button>
          </div>
          {onRefresh && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onRefresh} 
              disabled={isRefreshing}
              className="flex items-center"
            >
              <RefreshCw className={`h-4 w-4 ml-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'جارِ التحديث...' : 'تحديث'}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-right">البريد الإلكتروني</TableHead>
              <TableHead className="text-right">الاسم</TableHead>
              <TableHead className="text-right">تاريخ الاشتراك</TableHead>
              <TableHead className="text-right">الإجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {subscribers.length > 0 ? (
              subscribers.map((subscriber) => (
                <TableRow key={subscriber.id} className="hover:bg-gray-50">
                  <TableCell className="font-medium">{subscriber.email}</TableCell>
                  <TableCell>{subscriber.name || '—'}</TableCell>
                  <TableCell>{formatDate(subscriber.created_at)}</TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteSubscriber(subscriber.id)}
                      disabled={isDeleting === subscriber.id}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4 ml-1" />
                      {isDeleting === subscriber.id ? 'جاري الحذف...' : 'حذف'}
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-4">
                  لم يتم العثور على أي مشتركين.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default SubscribersTable;
