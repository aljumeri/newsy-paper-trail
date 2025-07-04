import Footer from '@/components/Footer';
import Navbar from '@/components/Navbar';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

interface Newsletter {
  id: string;
  main_title: string;
  content: string;
  created_at: string;
  created_by: string | null;
  sent_at: string | null;
}

const Archives = () => {
  const [newsletters, setNewsletters] = useState<Newsletter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNewsletters = async () => {
      try {
        const { data, error } = await supabase
          .from('newsletters')
          .select('id, main_title, content, created_at, created_by, sent_at')
          .not('sent_at', 'is', null)
          .order('sent_at', { ascending: false });

        if (error) throw error;
        setNewsletters(data || []);
      } catch (err) {
        console.error('Error fetching newsletters:', err);
        setError(err instanceof Error ? err.message : 'Failed to load newsletters');
      } finally {
        setLoading(false);
      }
    };

    fetchNewsletters();
  }, []);

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('ar-SA', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }).format(date);
    } catch (e) {
      return dateString;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <div className="bg-purple-50 py-16 md:py-24">
          <div className="container">
            <h1 className="text-4xl md:text-5xl font-bold text-center font-serif mb-6">أرشيف النشرات الإخبارية</h1>
            <p className="text-center text-neutral-600 max-w-2xl mx-auto">
              تصفح إصداراتنا السابقة واطلع على الرؤى التي ربما فاتتك.
            </p>
          </div>
        </div>
        
        <section className="section">
          <div className="container">
            {loading ? (
              <div className="text-center py-12">جاري التحميل...</div>
            ) : error ? (
              <div className="text-center py-12 text-red-500">{error}</div>
            ) : newsletters.length === 0 ? (
              <div className="text-center py-12 text-neutral-600">لا توجد نشرات إخبارية في الأرشيف</div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {newsletters.map((newsletter) => (
                  <Card key={newsletter.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <CardHeader className="pt-5 pb-2">
                      <div className="text-sm text-neutral-500 mb-1">
                        {formatDate(newsletter.sent_at || newsletter.created_at)}
                      </div>
                      <h3 className="text-xl font-semibold font-serif leading-tight">{newsletter.main_title}</h3>
                    </CardHeader>
                    <CardContent className="py-2">
                      <div className="text-neutral-600 line-clamp-3" dangerouslySetInnerHTML={{ __html: newsletter.content }} />
                      <div className="mt-4">
                        <Link to={`/newsletter/${newsletter.id}`} className="text-purple-600 hover:text-purple-700 font-medium">
                          قراءة العدد ←
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Archives;
