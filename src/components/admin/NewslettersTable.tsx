
import React from 'react';
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
  const navigate = useNavigate();
  
  return (
    <Card>
      <CardHeader>
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
                        variant="ghost" 
                        size="sm"
                        onClick={() => navigate(`/admin/edit/${newsletter.id}`)}
                      >
                        تعديل
                      </Button>
                      {!newsletter.sent_at && (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => navigate(`/admin/send/${newsletter.id}`)}
                        >
                          إرسال
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
