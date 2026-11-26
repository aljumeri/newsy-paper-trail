import { useEffect, useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import { buildIssuePreview } from '@/lib/latestIssuePreview';
import { Link } from 'react-router-dom';

const LATEST_COUNT = 3;
const LOGO_SRC = '/lovable-uploads/b40e2534-e282-4e60-9ca0-91070f9c6ad7.png';

interface SentNewsletter {
  id: string;
  main_title: string | null;
  sub_title: string | null;
  date: string | null;
  content: unknown;
  created_at: string;
  sent_at: string | null;
}

const formatIssueDate = (newsletter: SentNewsletter) => {
  const editorialDate = newsletter.date?.trim();
  if (editorialDate) return editorialDate;

  const raw = newsletter.sent_at || newsletter.created_at;
  try {
    return new Intl.DateTimeFormat('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(new Date(raw));
  } catch {
    return raw;
  }
};

const IssueImage = ({
  src,
  alt,
}: {
  src: string | null;
  alt: string;
}) => {
  const [failed, setFailed] = useState(false);
  const showPhoto = Boolean(src) && !failed;

  return (
    <div className="aspect-[16/9] overflow-hidden bg-gradient-to-br from-purple-100 via-white to-blue-50">
      {showPhoto ? (
        <img
          src={src ?? undefined}
          alt={alt}
          className="w-full h-full object-cover transition-transform hover:scale-105 duration-500"
          onError={() => setFailed(true)}
        />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center gap-3 px-6 text-center">
          <img src={LOGO_SRC} alt="" className="h-14 w-auto opacity-90" />
          <span className="text-sm text-purple-700/80 font-serif">نشرة سولو</span>
        </div>
      )}
    </div>
  );
};

const FeaturedSection = () => {
  const [newsletters, setNewsletters] = useState<SentNewsletter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLatestIssues = async () => {
      try {
        const { data, error: fetchError } = await supabase
          .from('newsletters')
          .select('id, main_title, sub_title, date, content, created_at, sent_at')
          .not('sent_at', 'is', null)
          .order('sent_at', { ascending: false })
          .limit(LATEST_COUNT);

        if (fetchError) throw fetchError;
        setNewsletters((data as SentNewsletter[]) || []);
      } catch (err) {
        console.error('Error fetching latest newsletters:', err);
        setError('تعذر تحميل آخر الإصدارات');
      } finally {
        setLoading(false);
      }
    };

    fetchLatestIssues();
  }, []);

  return (
    <section className="section bg-white">
      <div className="container">
        <div className="text-center mb-12 max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">آخر الإصدارات</h2>
          <p className="text-neutral-600">
            تذوق الرؤى التي نقدمها أسبوعياً. تصفح بعض نشراتنا الإخبارية الأخيرة.
          </p>
        </div>

        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: LATEST_COUNT }).map((_, index) => (
              <Card key={index} className="overflow-hidden">
                <Skeleton className="aspect-[16/9] w-full rounded-none" />
                <CardHeader className="pt-5 pb-2">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-6 w-full" />
                </CardHeader>
                <CardContent className="py-2 space-y-2">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : error ? (
          <p className="text-center text-neutral-600 py-8">{error}</p>
        ) : newsletters.length === 0 ? (
          <p className="text-center text-neutral-600 py-8">لا توجد إصدارات منشورة حالياً</p>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {newsletters.map((newsletter) => {
              const preview = buildIssuePreview(newsletter.content);
              const title =
                newsletter.main_title?.trim() ||
                newsletter.sub_title?.trim() ||
                'نشرة سولو';
              const dateLabel = formatIssueDate(newsletter);
              const issuePath = `/newsletter/${newsletter.id}`;

              return (
                <Card
                  key={newsletter.id}
                  className="overflow-hidden hover:shadow-lg transition-shadow animate-slide-up flex flex-col h-full min-w-0"
                >
                  <Link to={issuePath} className="block">
                    <IssueImage src={preview.imageUrl} alt={title} />
                  </Link>
                  <CardHeader className="pt-5 pb-2">
                    <div className="text-sm text-neutral-500 mb-1">{dateLabel}</div>
                    <h3 className="text-xl font-semibold font-serif leading-tight">
                      <Link to={issuePath} className="hover:text-purple-600 transition-colors">
                        {title}
                      </Link>
                    </h3>
                  </CardHeader>
                  <CardContent className="py-2 flex-1">
                    {preview.leadHeading && (
                      <p className="font-semibold text-neutral-800 leading-snug line-clamp-2">
                        {preview.leadHeading}
                      </p>
                    )}
                    {preview.excerpt && (
                      <p className="text-neutral-600 leading-relaxed line-clamp-2 mt-2">
                        {preview.excerpt}
                      </p>
                    )}
                  </CardContent>
                  <CardFooter className="pt-2 pb-5 mt-auto">
                    <Button
                      variant="outline"
                      className="hover:bg-blue-50 border-blue-200 text-blue-700 hover:text-blue-800"
                      asChild
                    >
                      <Link to={issuePath}>قراءة العدد</Link>
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        )}

        <div className="text-center mt-12">
          <Button variant="link" className="text-blue-600 hover:text-blue-700 text-lg" asChild>
            <Link to="/archives">عرض كل الأرشيف ←</Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedSection;
