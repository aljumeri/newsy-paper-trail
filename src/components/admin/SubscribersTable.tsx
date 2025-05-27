import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell
} from '@/components/ui/table';
import { Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

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
  return (
    <Card className="border-2 border-emerald-500">
      <CardHeader className="bg-emerald-50 flex flex-row items-center justify-between">
        <CardTitle>المشتركين</CardTitle>
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
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-right">البريد الإلكتروني</TableHead>
              <TableHead className="text-right">الاسم</TableHead>
              <TableHead className="text-right">تاريخ الاشتراك</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {subscribers.length > 0 ? (
              subscribers.map((subscriber) => (
                <TableRow key={subscriber.id} className="hover:bg-gray-50">
                  <TableCell className="font-medium">{subscriber.email}</TableCell>
                  <TableCell>{subscriber.name || '—'}</TableCell>
                  <TableCell>{formatDate(subscriber.created_at)}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-4">
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
