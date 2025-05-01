
import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

// Sample expanded newsletter issues data
const archiveIssues = [
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
  },
  {
    id: 4,
    title: "Digital Privacy in the Age of AI",
    excerpt: "Understanding how advances in AI are reshaping our understanding of privacy and data protection.",
    date: "Apr 4, 2025",
    imageUrl: "https://images.unsplash.com/photo-1566837945700-30057527ade0?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80",
  },
  {
    id: 5,
    title: "The Creator Economy: New Business Models",
    excerpt: "How individual creators are building sustainable businesses and reshaping the digital economy.",
    date: "Mar 28, 2025",
    imageUrl: "https://images.unsplash.com/photo-1661956602139-ec64991b8b16?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=665&q=80",
  },
  {
    id: 6,
    title: "Web3: Promise vs. Reality",
    excerpt: "A balanced examination of where web3 technologies are delivering value and where they're falling short.",
    date: "Mar 21, 2025",
    imageUrl: "https://images.unsplash.com/photo-1639322537228-f710d846310a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1332&q=80",
  },
];

const Archives = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <div className="bg-purple-50 py-16 md:py-24">
          <div className="container">
            <h1 className="text-4xl md:text-5xl font-bold text-center font-serif mb-6">Newsletter Archives</h1>
            <p className="text-center text-neutral-600 max-w-2xl mx-auto">
              Browse through our past issues and catch up on insights you might have missed.
            </p>
          </div>
        </div>
        
        <section className="section">
          <div className="container">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {archiveIssues.map((issue) => (
                <Card key={issue.id} className="overflow-hidden hover:shadow-lg transition-shadow">
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
                    <div className="mt-4">
                      <a href="#" className="text-purple-600 hover:text-purple-700 font-medium">
                        Read Issue →
                      </a>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Archives;
