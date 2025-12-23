'use client';

import { useState } from "react";
import CopyLink from "./utils/copyShortLink";

export default function Home() {
  const [longUrl, setLongUrl] = useState('');
  const [shortUrl, setShortUrl] = useState('');
  const [isLoading, setIsLoading] =useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  const getShortUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch(`${API_URL}/shorten`, {
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
    <main className="flex min-h-screen w-full flex-col items-center justify-center p-1 m-auto bg-black text-white">
      <div className="z-10 p-1 w-full items-center justify-center font-mono text-sm lg:flex flex-col">
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
          <div className=" flex flex-col shrink mt-8 p-4 bg-gray-800 rounded border border-gray-700 w-full max-w-md">
            <p className="text-gray-400 mb-2">Shortened URL:</p>
            <div style={{display:'flex', flexDirection:'row', justifyContent:'space-around'}}>
              <a 
                href={shortUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-green-400 text-xl font-bold hover:underline"
                style={{paddingRight:'30px'}}
              >
                {shortUrl.substring(7)}
              </a>
              <CopyLink linkToCopy={shortUrl}/>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}