'use client';

import { useState } from "react";

export default function Home() {
  const [longUrl, setLongUrl] = useState('');
  const [shortUrl, setShortUrl] = useState('');
  const [isLoading, setIsLoading] =useState(false);

  const getShortUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch('http://localhost:5000/shorten', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({longUrl})
      });

      const data = await res.json();
      if(data.shortUrl) {
        setShortUrl(data.shortUrl);
      }
    }
    catch(err) {
      console.error("Failed to shorten", err)
    }
    finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-black text-white">
      <div className="z-10 max-w-5xl w-full items-center justify-center font-mono text-sm lg:flex flex-col">
        <h1 className="text-4xl font-bold mb-8 text-blue-500">URL Shortener</h1>
        
        <form onSubmit={getShortUrl} className="flex flex-col gap-4 w-full max-w-md">
          <input 
            type="url" 
            placeholder="Enter long URL..." 
            value={longUrl}
            onChange={(e) => setLongUrl(e.target.value)}
            required
            className="p-4 rounded bg-white text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          
          <button 
            type="submit" 
            disabled={isLoading}
            className="p-4 bg-blue-600 rounded font-bold hover:bg-blue-700 transition disabled:opacity-50"
          >
            {isLoading ? 'Shortening...' : 'Shorten URL'}
          </button>
        </form>

        {shortUrl && (
          <div className="mt-8 p-4 bg-gray-800 rounded border border-gray-700">
            <p className="text-gray-400">Shortened URL:</p>
            <a 
              href={shortUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-green-400 text-xl font-bold hover:underline"
            >
              {shortUrl}
            </a>
          </div>
        )}
      </div>
    </main>
  );
}