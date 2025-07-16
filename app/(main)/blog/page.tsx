// app/blog/page.tsx
import React from 'react';

const blogPosts = [
  {
    title: 'How AI Is Revolutionizing Document Processing',
    date: 'July 10, 2025',
    excerpt: 'Discover how artificial intelligence is transforming the way businesses handle documents, extract data, and automate workflows.',
  },
  {
    title: 'Behind the Code: Building Face Verification Systems',
    date: 'July 3, 2025',
    excerpt: 'A look into how we engineered a secure, scalable, and privacy-first facial recognition API with real-world use cases.',
  },
  {
    title: 'Top 5 Use Cases for Branded QR Codes in 2025',
    date: 'June 25, 2025',
    excerpt: 'QR Masking isn’t just design—it’s about making marketing interactive. See how industries are using custom QR solutions.',
  },
];

export default function BlogPage() {
  return (
    <main className="max-w-6xl mx-auto px-4 py-24 text-white">
      <h1 className="text-5xl font-bold mb-10 text-center">From Our Blog</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {blogPosts.map((post, index) => (
          <div
            key={index}
            className="bg-gradient-to-br from-slate-800 to-gray-900 p-6 rounded-2xl shadow-md border border-gray-700 hover:border-white transition-all"
          >
            <h2 className="text-2xl font-semibold mb-2">{post.title}</h2>
            <p className="text-sm text-gray-400 mb-3">{post.date}</p>
            <p className="text-gray-300 text-sm leading-relaxed">{post.excerpt}</p>
          </div>
        ))}
      </div>
    </main>
  );
}