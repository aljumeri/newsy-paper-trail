
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
import { Eye, Edit, ExternalLink } from 'lucide-react';

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
        <CardTitle>النشرات الإخبارية <span className="text-xs text-muted-foreground">(v2025.05.06)</span></CardTitle>
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
