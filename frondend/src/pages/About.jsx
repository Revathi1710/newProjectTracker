import React from 'react';
import { ArrowRight, BarChart3, Globe, ShieldCheck, Zap, Database, FileText, CheckCircle2 } from 'lucide-react';
import Footer from '../components/Footer';
import Header from '../components/Header';

const About = () => {
  return (
    <>
    
      {/* 1. Main container background to Slate-50 for clean contrast */}
      <div className="bg-slate-50 min-h-screen font-sans">
        
        {/* 2. Hero Section - Set to Slate-950 for a rich, deep professional feel */}
        <section className="bg-slate-950 text-white py-24 px-6">
          <div className="max-w-6xl mx-auto text-center">
            {/* 3. Badge with Blue-500/10 and Blue-400 text */}
            <div className="inline-block px-4 py-1.5 mb-6 border border-blue-500/30 bg-blue-500/10 rounded-full">
              <span className="text-blue-400 text-xs font-bold uppercase tracking-widest">Industrial Intelligence</span>
            </div>
            {/* 4. White text for primary heading, Blue-600 for the secondary part to match logo text color */}
            <h1 className="text-4xl md:text-6xl font-extrabold mb-8 tracking-tight">
              Actionable Data for <br />
              <span className="text-blue-600">Strategic Growth</span>
            </h1>
            {/* 5. Slate-400 for descriptions on dark background (hierarchy) */}
            <p className="text-xl text-slate-400 max-w-3xl mx-auto leading-relaxed">
              New Projects Tracker (NPT) is your premier destination for verified project intelligence 
              and industrial market research reports across India.
            </p>
          </div>
        </section>

        {/* 6. Why Us Section - Using Slate-900 for dark text, Slate-600 for light text on light bg */}
        <section className="py-20 px-6 max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-start">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6 leading-tight">
                Fuel Your Business with <br /> Verified Intelligence
              </h2>
              <p className="text-slate-600 leading-relaxed mb-6 text-lg">
                At <strong>NPT Report Store</strong>, we simplify how businesses access critical industrial data. 
                Our research is specifically designed for Process Equipment Manufacturers, Engineering Providers, 
                and Industrial Suppliers who need to stay ahead of market shifts.
              </p>
              
              {/* 7. Format Section (Modified) - Blue-50 background, Blue-600 border/icons */}
              <div className="bg-blue-50 border-l-4 border-blue-600 p-6 my-8 rounded-r-xl">
                <h4 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
                  <CheckCircle2 size={20} /> No Subscription Required
                </h4>
                <p className="text-blue-800/80 text-sm">
                  We believe in accessibility. Choose individual reports in <strong>PDF or Excel</strong> formats 
                  and pay only for the data you need—perfect for targeted marketing and sales pipelines.
                </p>
              </div>

              {/* 8. Call-to-Action - Vibrant Blue-600 */}
              <div className="flex flex-wrap gap-4 mt-8">
                <button className="bg-blue-600 text-white px-8 py-4 rounded-lg font-bold hover:bg-blue-700 transition flex items-center gap-2 shadow-lg shadow-blue-600/20">
                  Browse Report Titles <ArrowRight size={20} />
                </button>
              </div>
            </div>

            {/* 9. Feature Grid - Clean white cards on Slate-50 background, Blue-600 icons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { icon: <Zap />, title: "Emerging Projects", desc: "Real-time tracking of new industrial developments." },
                { icon: <BarChart3 />, title: "Market Trends", desc: "In-depth analysis of shifting dynamics and pricing." },
                { icon: <ShieldCheck />, title: "Verified Data", desc: "Manually vetted reports to reduce investment risk." },
                { icon: <Database />, title: "Lead Generation", desc: "Direct project leads for your sales force." },
              ].map((item, idx) => (
                <div key={idx} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:border-blue-200 transition-colors">
                  <div className="text-blue-600 mb-4">{item.icon}</div>
                  <h4 className="font-bold text-slate-900 mb-2">{item.title}</h4>
                  <p className="text-sm text-slate-500 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 10. Format Section - Emphasizing file types and location context with deep background */}
        <section className="bg-slate-950 py-20 px-6 overflow-hidden relative">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-12 relative z-10">
            <div className="text-left max-w-xl">
              <h2 className="text-3xl font-bold text-white mb-6">Data Your Way</h2>
              <p className="text-slate-400 text-lg mb-8 leading-relaxed">
                Whether you need a polished presentation for your board or raw data for your CRM, 
                we provide the right format for your workflow.
              </p>
              <div className="flex gap-6 text-sm">
                <div className="flex items-center gap-2 text-white font-semibold">
                  <FileText className="text-blue-600" /> PDF Reports
                </div>
                <div className="flex items-center gap-2 text-white font-semibold">
                  <Database className="text-blue-600" /> Excel Databases
                </div>
              </div>
            </div>
            {/* 11. Location Context Card - Subtle differentiation using Slate-800 */}
            <div className="bg-slate-800/50 p-8 rounded-3xl border border-slate-700 backdrop-blur-sm">
                <div className="flex gap-4 items-center">
                    <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center font-bold text-xl text-white">N</div>
                    <div>
                        <p className="text-slate-300 text-sm">Chennai-based Intelligence</p>
                        <p className="text-white font-bold tracking-wide text-xs">EST. 2026 RESEARCH SERVICES</p>
                    </div>
                </div>
            </div>
          </div>
          {/* 12. Secondary Decorative Glow - Blue-600/5 */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl -mr-48 -mt-48"></div>
        </section>

        {/* 13. Final CTA - Using Slate-900/800 for dark contrast below the dark section */}
        <section className="py-24 px-6 text-center">
          <div className="max-w-3xl mx-auto">
            <Globe className="mx-auto text-blue-600 mb-8 opacity-20" size={64} />
            <h2 className="text-4xl font-bold text-slate-900 mb-6">Start Your Intelligence Journey</h2>
            <p className="text-slate-600 text-lg mb-10 leading-relaxed">
              Our team is ready to support your search for high-impact project data. 
              Find the specific report you need and take control of your market growth.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
                <button className="bg-slate-950 text-white px-10 py-4 rounded-lg font-bold hover:bg-slate-800 transition-all shadow-xl shadow-slate-950/20">
                    View Pricing Options
                </button>
                <button className="border-2 border-slate-200 text-slate-900 px-10 py-4 rounded-lg font-bold hover:bg-slate-50 transition-all">
                    Contact Our Sales Team
                </button>
            </div>
          </div>
        </section>
      </div>
      
    </>
  );
};

export default About;