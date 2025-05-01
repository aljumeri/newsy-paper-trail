
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Bell } from 'lucide-react';

const HeroSection = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      toast({
        title: "Success!",
        description: "You've been subscribed to our newsletter.",
      });
      setIsLoading(false);
      setEmail('');
    }, 1000);
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-purple-50 to-white pt-20 pb-16 md:pt-32 md:pb-24">
      <div className="container grid lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-6 max-w-lg animate-fade-in">
          <div className="flex items-center gap-2 text-purple-500 font-medium">
            <Bell size={20} />
            <span>Weekly newsletter</span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
            Insights that elevate your thinking
          </h1>
          <p className="text-lg text-neutral-600">
            Join thousands of subscribers receiving our carefully curated insights on technology, business, and culture — delivered straight to your inbox every week.
          </p>
          
          <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 pt-2">
            <Input
              type="email"
              placeholder="Enter your email"
              className="flex-grow text-base py-6"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Button 
              type="submit"
              className="bg-purple-500 hover:bg-purple-600 text-white py-6 px-8" 
              disabled={isLoading}
            >
              {isLoading ? "Subscribing..." : "Subscribe"}
            </Button>
          </form>
          
          <div className="text-neutral-500 text-sm">
            Join over 10,000+ subscribers. No spam, unsubscribe anytime.
          </div>
        </div>
        
        <div className="hidden lg:flex justify-end animate-fade-in">
          <div className="relative">
            <div className="absolute -left-10 -top-10 w-20 h-20 bg-purple-200/50 rounded-full"></div>
            <div className="absolute -right-5 -bottom-5 w-32 h-32 bg-purple-100/80 rounded-full"></div>
            <img 
              src="https://images.unsplash.com/photo-1586339949916-3e9457bef6d3?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80" 
              alt="Newsletter preview" 
              className="w-full max-w-md rounded-lg shadow-xl relative z-10"
            />
          </div>
        </div>
      </div>
      
      {/* Decorative elements */}
      <div className="absolute top-1/3 left-0 w-40 h-40 bg-purple-200/30 rounded-full blur-3xl -z-10"></div>
      <div className="absolute bottom-0 right-0 w-60 h-60 bg-purple-100/50 rounded-full blur-3xl -z-10"></div>
    </section>
  );
};

export default HeroSection;
