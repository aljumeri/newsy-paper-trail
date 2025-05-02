
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

interface Subscriber {
  id: string;
  email: string;
  created_at: string;
}

interface SubscribersTableProps {
  subscribers: Subscriber[];
  formatDate: (dateString: string) => string;
}

const SubscribersTable = ({ subscribers, formatDate }: SubscribersTableProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>قائمة المشتركين</CardTitle>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-right">البريد الإلكتروني</TableHead>
              <TableHead className="text-right">تاريخ الاشتراك</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {subscribers.length > 0 ? (
              subscribers.map((subscriber) => (
                <TableRow key={subscriber.id} className="hover:bg-gray-50">
                  <TableCell>{subscriber.email}</TableCell>
                  <TableCell>{formatDate(subscriber.created_at)}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={2} className="text-center py-4">
                  لا يوجد مشتركين بعد.
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
