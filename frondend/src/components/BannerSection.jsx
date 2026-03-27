import React, { useState } from 'react';
import { useSearchParams } from "react-router-dom";

const BannerSection = () => {
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") || "");

  return (
    <section className="relative pt-24 pb-32 px-4 background-banner border-b border-white/10">
      {/* Content wrapper must be relative to sit above the background-image */}
      <div className="relative z-10 max-w-4xl mx-auto text-center">
        
        {/* Badge Animation */}
        <div className="animate-fade-in inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 mb-6 backdrop-blur-md">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
          </span>
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-200">
            Market Intelligence 2026
          </span>
        </div>

        {/* Title Animation */}
        <h1 className="animate-fade-in delay-1 text-5xl md:text-7xl font-black text-white tracking-tight mb-6 leading-[1.1]">
          India's Leading{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600">
            Project Data
          </span>{" "}
          Store
        </h1>

        {/* Paragraph Animation */}
        <p className="animate-fade-in delay-2 text-lg text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed">
          Gain a competitive edge with verified leads in Infrastructure, Manufacturing, and Energy sectors.
        </p>

        {/* Search Bar */}
        <form
          onSubmit={(e) => e.preventDefault()}
          className="animate-fade-in delay-2 flex flex-col md:flex-row max-w-2xl mx-auto gap-3 p-2 rounded-2xl bg-white border border-slate-200 shadow-2xl"
        >
          <div className="flex-1 flex items-center px-4 gap-3">
            <svg className="w-5 h-5 text-slate-400 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
            <input
              type="text"
              placeholder="Search by state, sector or report..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-transparent text-slate-800 placeholder:text-slate-400 outline-none py-3 text-sm font-medium"
            />
          </div>
          <button className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold px-8 py-3 rounded-xl transition-all active:scale-95 shadow-lg shadow-blue-200">
            SEARCH
          </button>
        </form>
      </div>
      
      {/* Visual Overlays for depth */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-80 bg-blue-500/10 blur-[120px] rounded-full z-0"></div>
    </section>
  );
};

export default BannerSection;