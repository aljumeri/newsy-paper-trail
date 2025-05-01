
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const testimonials = [
  {
    content: "This newsletter has become my weekly ritual. The insights are always fresh, deeply researched, and surprisingly applicable to my work.",
    author: "Alex Morgan",
    role: "Product Manager, Stripe",
    avatar: "https://randomuser.me/api/portraits/women/44.jpg"
  },
  {
    content: "I've subscribed to dozens of newsletters over the years, and Paper Trail is consistently the only one I make time to read every single week.",
    author: "James Wilson",
    role: "CEO, FutureTech",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg"
  },
  {
    content: "The depth of analysis combined with concise delivery makes this newsletter stand out. It's like having a brilliant analyst on your team.",
    author: "Sarah Chen",
    role: "Investment Strategist",
    avatar: "https://randomuser.me/api/portraits/women/68.jpg"
  },
  {
    content: "What impresses me most is how the newsletter consistently identifies emerging trends weeks or months before they hit mainstream coverage.",
    author: "Michael Davis",
    role: "Head of Innovation",
    avatar: "https://randomuser.me/api/portraits/men/46.jpg"
  }
];

const TestimonialsSection = () => {
  return (
    <section className="section bg-white">
      <div className="container">
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">What Our Readers Say</h2>
          <p className="text-lg text-neutral-600">
            Join thousands of satisfied subscribers who trust our insights every week.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="bg-gray-50 border-none">
              <CardContent className="p-6">
                <div className="flex flex-col h-full">
                  <div className="mb-4">
                    <svg 
                      className="h-8 w-8 text-purple-300" 
                      fill="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                    </svg>
                  </div>
                  
                  <p className="text-neutral-700 flex-grow">
                    {testimonial.content}
                  </p>
                  
                  <div className="flex items-center mt-6">
                    <Avatar className="h-10 w-10 border-2 border-white">
                      <AvatarImage src={testimonial.avatar} alt={testimonial.author} />
                      <AvatarFallback>{testimonial.author.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="ml-3">
                      <div className="font-medium">{testimonial.author}</div>
                      <div className="text-sm text-neutral-500">{testimonial.role}</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
