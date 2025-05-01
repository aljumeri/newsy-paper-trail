
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

// Sample newsletter issues data
const newsletterIssues = [
  {
    id: 1,
    title: "The Future of AI in Creative Industries",
    excerpt: "How artificial intelligence is transforming content creation, design, and the way we think about creativity.",
    date: "Apr 25, 2025",
    imageUrl: "https://images.unsplash.com/photo-1655635643532-fa9ba2648cbe?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2232&q=80",
  },
  {
    id: 2,
    title: "Sustainable Tech: Beyond the Buzzwords",
    excerpt: "An in-depth look at how technology companies are truly addressing environmental concerns in 2025.",
    date: "Apr 18, 2025",
    imageUrl: "https://images.unsplash.com/photo-1618044733300-9472054094ee?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2071&q=80",
  },
  {
    id: 3,
    title: "The Remote Work Revolution: 5 Years Later",
    excerpt: "Examining the lasting impact of global remote work adoption on companies, productivity, and work culture.",
    date: "Apr 11, 2025",
    imageUrl: "https://images.unsplash.com/photo-1521898284481-a5ec348cb555?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1974&q=80",
  }
];

const FeaturedSection = () => {
  return (
    <section className="section bg-white">
      <div className="container">
        <div className="text-center mb-12 max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Recent Issues</h2>
          <p className="text-neutral-600">
            Get a taste of the insights we deliver weekly. Browse through some of our recent newsletters.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {newsletterIssues.map((issue) => (
            <Card key={issue.id} className="overflow-hidden hover:shadow-lg transition-shadow animate-slide-up">
              <div className="aspect-[16/9] overflow-hidden">
                <img 
                  src={issue.imageUrl} 
                  alt={issue.title} 
                  className="w-full h-full object-cover transition-transform hover:scale-105 duration-500"
                />
              </div>
              <CardHeader className="pt-5 pb-2">
                <div className="text-sm text-neutral-500 mb-1">{issue.date}</div>
                <h3 className="text-xl font-semibold font-serif leading-tight">{issue.title}</h3>
              </CardHeader>
              <CardContent className="py-2">
                <p className="text-neutral-600">{issue.excerpt}</p>
              </CardContent>
              <CardFooter className="pt-2 pb-5">
                <Button variant="outline" className="hover:bg-purple-50 border-purple-200 text-purple-700 hover:text-purple-800">
                  Read Issue
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
        
        <div className="text-center mt-12">
          <Button variant="link" className="text-purple-600 hover:text-purple-700 text-lg">
            View All Archives →
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedSection;
