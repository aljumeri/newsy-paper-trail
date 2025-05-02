
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface StatisticsCardsProps {
  subscribersCount: number;
  newslettersCount: number;
}

const StatisticsCards = ({ subscribersCount, newslettersCount }: StatisticsCardsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      <Card>
        <CardHeader>
          <CardTitle>المشتركين</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{subscribersCount}</div>
          <p className="text-gray-500">إجمالي عدد المشتركين في النشرة الإخبارية</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>النشرات الإخبارية</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{newslettersCount}</div>
          <p className="text-gray-500">إجمالي عدد النشرات الإخبارية المنشورة</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default StatisticsCards;
