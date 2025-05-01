
import React from 'react';
import { Mail, Calendar, Inbox, MessageSquare } from 'lucide-react';

const benefits = [
  {
    icon: <Mail className="h-10 w-10 text-purple-500" />,
    title: "Curated Insights",
    description: "Every edition is carefully researched and crafted to deliver maximum value in minimum time."
  },
  {
    icon: <Calendar className="h-10 w-10 text-purple-500" />,
    title: "Weekly Delivery",
    description: "Receive our newsletter every Tuesday morning, perfect timing to shape your strategic thinking for the week."
  },
  {
    icon: <Inbox className="h-10 w-10 text-purple-500" />,
    title: "Exclusive Content",
    description: "Gain access to interviews and analysis you won't find anywhere else, from industry leaders and innovators."
  },
  {
    icon: <MessageSquare className="h-10 w-10 text-purple-500" />,
    title: "Join the Conversation",
    description: "Subscribers can participate in our private community discussions and monthly Q&A sessions."
  }
];

const BenefitsSection = () => {
  return (
    <section className="section bg-purple-50">
      <div className="container">
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Subscribe?</h2>
          <p className="text-lg text-neutral-600">
            More than just another newsletter. We deliver carefully crafted insights that help you stay ahead.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {benefits.map((benefit, index) => (
            <div 
              key={index} 
              className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="mb-4">{benefit.icon}</div>
              <h3 className="text-xl font-serif font-semibold mb-3">{benefit.title}</h3>
              <p className="text-neutral-600">{benefit.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BenefitsSection;
