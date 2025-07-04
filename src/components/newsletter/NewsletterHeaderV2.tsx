import { Card } from "@/components/ui/card";
import EditableText from './EditableText';

interface NewsletterHeaderV2Props {
  title?: string;
  subtitle?: string;
  date?: string;
  readOnly?: boolean;
  onTitleChange?: (val: string) => void;
  onSubtitleChange?: (val: string) => void;
  onDateChange?: (val: string) => void;
}

const NewsletterHeaderV2: React.FC<NewsletterHeaderV2Props> = ({
  title = 'عنوان رئيسي مهم - آخر الأخبار والتحديثات',
  subtitle = 'نشرة إخبارية شاملة تضم أحدث المستجدات في عالم التكنولوجيا والذكاء الاصطناعي',
  date = 'الأحد، 15 ديسمبر 2024',
  readOnly = false,
  onTitleChange,
  onSubtitleChange,
  onDateChange,
}) => {

  return (
    <Card className="relative overflow-hidden bg-transparent border-0 shadow-none">
      {/* Background gradient inspired by logo */}
      <div className="absolute inset-0 bg-gradient-to-l from-logo-blue via-logo-pink to-logo-light-blue opacity-90" />
      
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12" />
      
      <div className="relative z-10 p-8 md:p-12">
        {/* Logo positioned in top right corner */}
        <div className="absolute top-4 right-4 md:top-6 md:right-6">
          <img 
            src="/lovable-uploads/b40e2534-e282-4e60-9ca0-91070f9c6ad7.png" 
            alt="Solo for AI Logo" 
            className="h-12 w-12 md:h-16 md:w-16 drop-shadow-lg"
          />
        </div>

        {/* Date Section */}
        <div className="mb-6 text-center">
          {readOnly || !onDateChange ? (
            <div className="text-sm md:text-base text-white/80">{date}</div>
          ) : (
            <EditableText
              value={date}
              onChange={onDateChange}
              className="text-sm md:text-base text-white/80"
              placeholder="اكتب التاريخ هنا..."
              isTitle={false}
            />
          )}
        </div>
        
        {/* Header Content - Centered */}
        <div className="text-center">
          {readOnly ? (
            <>
              <div className="text-2xl md:text-4xl font-bold text-white mb-3 leading-tight">{title}</div>
              <div className="text-base md:text-lg text-white/90 leading-relaxed">{subtitle}</div>
            </>
          ) : (
            <>
              <EditableText
                value={title}
                onChange={onTitleChange || (() => {})}
                className="text-2xl md:text-4xl font-bold text-white mb-3 leading-tight"
                placeholder="اكتب العنوان الرئيسي هنا..."
                isTitle={true}
              />
              <EditableText
                value={subtitle}
                onChange={onSubtitleChange || (() => {})}
                className="text-base md:text-lg text-white/90 leading-relaxed"
                placeholder="اكتب الوصف التفصيلي هنا..."
                isTitle={false}
              />
            </>
          )}
        </div>
        
        {/* Decorative line */}
        <div className="mt-8 h-1 bg-gradient-to-l from-white/30 via-white/60 to-white/30 rounded-full" />
      </div>
    </Card>
  );
};

export default NewsletterHeaderV2; 