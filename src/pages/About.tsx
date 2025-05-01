
import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import CallToAction from '@/components/CallToAction';

const About = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <div className="bg-purple-50 py-16 md:py-24">
          <div className="container">
            <h1 className="text-4xl md:text-5xl font-bold text-center font-serif mb-6">About Paper Trail</h1>
            <p className="text-center text-neutral-600 max-w-2xl mx-auto">
              The story behind our newsletter and the team that makes it happen.
            </p>
          </div>
        </div>
        
        <section className="section">
          <div className="container">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold mb-6 font-serif">Our Mission</h2>
                <p className="text-lg mb-4 text-neutral-700">
                  At Paper Trail, we believe that staying informed shouldn't feel like work. Our mission is to deliver clear, concise, and thoughtful analysis of the most important trends in technology, business, and culture.
                </p>
                <p className="text-lg mb-6 text-neutral-700">
                  Founded in 2022, we've grown from a small passion project to a newsletter trusted by thousands of professionals, entrepreneurs, and curious minds around the world.
                </p>
                <h3 className="text-xl font-bold mb-3 font-serif">What makes us different</h3>
                <ul className="space-y-2 mb-6 text-neutral-700">
                  <li className="flex items-start">
                    <svg className="h-6 w-6 text-purple-500 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Deep research beyond the headlines</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-6 w-6 text-purple-500 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Balanced perspectives that challenge conventional thinking</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-6 w-6 text-purple-500 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Practical insights you can apply immediately</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-6 w-6 text-purple-500 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Concise format designed for busy professionals</span>
                  </li>
                </ul>
                <Button className="bg-purple-500 hover:bg-purple-600">Subscribe Now</Button>
              </div>
              <div className="relative">
                <div className="absolute -left-5 -top-5 w-24 h-24 bg-purple-200/60 rounded-full"></div>
                <img 
                  src="https://images.unsplash.com/photo-1517059224940-d4af9eec41b7?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1305&q=80" 
                  alt="About Paper Trail" 
                  className="rounded-lg shadow-lg relative z-10"
                />
              </div>
            </div>
          </div>
        </section>
        
        <section className="section bg-gray-50">
          <div className="container">
            <h2 className="text-3xl font-bold mb-12 text-center font-serif">Meet the Team</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  name: "Alexandra Reynolds",
                  role: "Founder & Editor-in-Chief",
                  bio: "Former tech journalist with a passion for making complex ideas accessible to everyone.",
                  avatar: "https://randomuser.me/api/portraits/women/23.jpg"
                },
                {
                  name: "David Chen",
                  role: "Senior Writer",
                  bio: "Specializes in business strategy and market analysis with 10+ years in consulting.",
                  avatar: "https://randomuser.me/api/portraits/men/54.jpg"
                },
                {
                  name: "Mia Johnson",
                  role: "Culture & Society Editor",
                  bio: "Anthropologist and writer exploring how technology shapes modern society.",
                  avatar: "https://randomuser.me/api/portraits/women/65.jpg"
                }
              ].map((person, index) => (
                <div key={index} className="text-center">
                  <Avatar className="h-32 w-32 mx-auto mb-4 border-2 border-white shadow-md">
                    <AvatarImage src={person.avatar} alt={person.name} />
                    <AvatarFallback>{person.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <h3 className="text-xl font-bold">{person.name}</h3>
                  <p className="text-purple-600 mb-2">{person.role}</p>
                  <p className="text-neutral-600 max-w-sm mx-auto">{person.bio}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
        
        <CallToAction />
      </main>
      <Footer />
    </div>
  );
};

export default About;
