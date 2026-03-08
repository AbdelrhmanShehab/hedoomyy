'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { Instagram } from 'lucide-react';

interface InstagramPost {
  id: string;
  media_url: string;
  permalink: string;
  caption: string;
}

export default function InstagramFeed() {
  const [posts, setPosts] = useState<InstagramPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPosts() {
      try {
        const res = await fetch('/api/instagram');
        const data = await res.json();
        if (data?.data) {
          setPosts(data.data.slice(0, 10));
        }
      } catch (error) {
        console.error('Instagram fetch error:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchPosts();
  }, []);

  return (
    <section className="w-[90%] mx-auto  bg-white py-16">

      {/* Title */}
      <div className="text-center mb-10">
        <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-[#111]">
          Follow us and be part of our family
        </h2>
      </div>

      {/* Grid Wrapper */}
      <div className="relative group ">

        {/* Posts Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 w-full">
          {(loading ? Array.from({ length: 10 }) : posts).map((post: any, i) => (
            <a
              key={post?.id || i}
              href={post?.permalink || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="relative aspect-square overflow-hidden"
            >
              {loading ? (
                <div className="w-full h-full bg-gray-100 animate-pulse" />
              ) : (
                <Image
                  src={post.media_url}
                  alt={post.caption || 'Instagram'}
                  fill
                  className="object-cover"
                  sizes="(max-width:768px) 50vw, 20vw"
                />
              )}
            </a>
          ))}
        </div>

        {/* Section Overlay */}
        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition duration-300 flex items-center justify-center pointer-events-none">

          <div className="flex flex-col items-center">

            <div className=" rounded-2xl">
              <Image src="/instagram.png" alt="Hedoomyy" width={85} height={85} />
            </div>

            <span className="text-white text-3xl font-extrabold mt-3 tracking-wide">
              Hedoomyy
            </span>

          </div>

        </div>

      </div>
    </section>
  );
}