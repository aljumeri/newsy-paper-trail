
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface StatisticsCardsProps {
  subscribersCount: number;
  newslettersCount: number;
  isLoading?: boolean;
}

const StatisticsCards = ({ 
  subscribersCount, 
  newslettersCount, 
  isLoading = false 
}: StatisticsCardsProps) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
      <Card>
        <CardHeader>
          <CardTitle>المشتركين</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">
            {isLoading ? 'جارٍ التحميل...' : subscribersCount}
          </div>
          <p className="text-gray-500">إجمالي عدد المشتركين في النشرة الإخبارية</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>النشرات الإخبارية</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">
            {isLoading ? 'جارٍ التحميل...' : newslettersCount}
          </div>
          <p className="text-gray-500">إجمالي عدد النشرات الإخبارية المنشورة</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default StatisticsCards;
