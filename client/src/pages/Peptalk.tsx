export default function Peptalk() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800 flex items-center justify-center px-4">
      <div className="max-w-4xl w-full text-center">
        <div className="mb-8">
          <img 
            src="/peptalk-logo.png" 
            alt="Peptalk! The Podcast" 
            className="mx-auto max-w-2xl w-full h-auto"
          />
        </div>
        
        <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
          Coming Soon!
        </h1>
        
        <p className="text-xl md:text-2xl text-purple-100 mb-8 max-w-2xl mx-auto">
          Get ready for engaging conversations about health, longevity, peptides, and wellness with leading experts in the field.
        </p>
        
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 mb-8">
          <h2 className="text-2xl font-semibold text-white mb-4">Stay Tuned</h2>
          <p className="text-purple-100 mb-6">
            We're working hard to bring you insightful discussions on cutting-edge health science, 
            anti-aging research, and the latest in peptide bioregulator technology.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <div className="bg-white/20 rounded-lg px-6 py-3">
              <p className="text-white font-semibold">Expert Interviews</p>
            </div>
            <div className="bg-white/20 rounded-lg px-6 py-3">
              <p className="text-white font-semibold">Health Tips</p>
            </div>
            <div className="bg-white/20 rounded-lg px-6 py-3">
              <p className="text-white font-semibold">Science Deep Dives</p>
            </div>
          </div>
        </div>
        
        <a 
          href="/" 
          className="inline-block bg-white text-purple-700 font-semibold px-8 py-4 rounded-full hover:bg-purple-50 transition-colors text-lg"
        >
          Return to Home
        </a>
      </div>
    </div>
  );
}
