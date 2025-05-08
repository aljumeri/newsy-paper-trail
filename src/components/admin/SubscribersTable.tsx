
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

interface Subscriber {
  id: string;
  email: string;
  created_at: string;
  vendor?: string | null;
}

interface SubscribersTableProps {
  subscribers: Subscriber[];
  formatDate: (dateString: string) => string;
}

const SubscribersTable = ({ subscribers, formatDate }: SubscribersTableProps) => {
  // Debug logging to verify data
  console.log("SubscribersTable: Rendering with subscribers count:", subscribers?.length || 0);
  console.log("SubscribersTable: Subscriber data:", subscribers);
  
  // Filter subscribers for solo4ai.com if needed (uncomment if you want to filter)
  // const solo4aiSubscribers = subscribers.filter(sub => 
  //   sub.email?.includes('@solo4ai.com') || 
  //   sub.vendor === 'solo4ai.com'
  // );
  
  return (
    <Card className="border-2 border-green-500">
      <CardHeader className="bg-green-50">
        <CardTitle className="flex items-center justify-between">
          <span>قائمة المشتركين <span className="text-xs text-green-600 font-bold">(تحديث SOLO4AI)</span></span>
          <span className="text-sm font-normal text-muted-foreground">
            {subscribers.length} مشترك
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-right">البريد الإلكتروني</TableHead>
              <TableHead className="text-right">المصدر</TableHead>
              <TableHead className="text-right">تاريخ الاشتراك</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.isArray(subscribers) && subscribers.length > 0 ? (
              subscribers.map((subscriber) => (
                <TableRow key={subscriber.id} className="hover:bg-gray-50">
                  <TableCell>{subscriber.email}</TableCell>
                  <TableCell>{subscriber.vendor || 'solo4ai.com'}</TableCell>
                  <TableCell>{formatDate(subscriber.created_at)}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={3}>
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <div className="rounded-full bg-muted p-3 mb-2">
                      <Info className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold">لا يوجد مشتركين بعد.</h3>
                    <p className="text-muted-foreground mb-4">
                      عندما يقوم الأشخاص بالاشتراك في النشرة الإخبارية، ستظهر معلوماتهم هنا.
                    </p>
                  </div>
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
