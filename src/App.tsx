import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Play, Pause, SkipForward, TrendingUp, TrendingDown, RefreshCcw } from 'lucide-react';

// ডামি ডাটা জেনারেটর (আপনার ব্যাকটেস্টের জন্য ক্যান্ডেলস্টিক ডাটা)
const generateData = () => {
  return Array.from({ length: 100 }, (_, i) => ({
    time: i,
    price: 150 + Math.random() * 20 + (i * 0.5),
    high: 175,
    low: 145,
  }));
};

const App = () => {
  const [allData] = useState(generateData());
  const [visibleData, setVisibleData] = useState(allData.slice(0, 20));
  const [isPlaying, setIsPlaying] = useState(false);
  const [balance, setBalance] = useState(1000);
  const [position, setPosition] = useState(null);

  // অটো-প্লে লজিক
  useEffect(() => {
    let interval;
    if (isPlaying && visibleData.length < allData.length) {
      interval = setInterval(() => {
        nextCandle();
      }, 500);
    }
    return () => clearInterval(interval);
  }, [isPlaying, visibleData]);

  const nextCandle = () => {
    if (visibleData.length < allData.length) {
      setVisibleData(prev => [...prev, allData[prev.length]]);
    } else {
      setIsPlaying(false);
    }
  };

  const handleTrade = (type) => {
    const currentPrice = visibleData[visibleData.length - 1].price;
    if (type === 'BUY') {
      setPosition({ type: 'BUY', entry: currentPrice });
    } else {
      const profit = position?.type === 'BUY' ? currentPrice - position.entry : 0;
      setBalance(prev => prev + profit * 10);
      setPosition(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 font-sans">
      {/* Header */}
      <div className="max-w-4xl mx-auto flex justify-between items-center mb-6 bg-gray-800 p-4 rounded-xl shadow-lg">
        <div className="flex items-center gap-2">
          <TrendingUp className="text-green-400" />
          <h1 className="text-xl font-bold tracking-tight">Trading Backtest Pro</h1>
        </div>
        <div className="text-right">
          <p className="text-gray-400 text-xs uppercase">Balance</p>
          <p className="text-2xl font-mono font-bold text-green-400">${balance.toFixed(2)}</p>
        </div>
      </div>

      {/* Chart Section */}
      <div className="max-w-4xl mx-auto bg-gray-800 p-4 rounded-xl shadow-2xl border border-gray-700 mb-6">
        <div className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={visibleData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="time" hide />
              <YAxis domain={['auto', 'auto']} stroke="#9CA3AF" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px' }}
                itemStyle={{ color: '#10B981' }}
              />
              <Line 
                type="monotone" 
                dataKey="price" 
                stroke="#3B82F6" 
                strokeWidth={3} 
                dot={false}
                animationDuration={300}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Controls */}
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Playback Controls */}
        <div className="flex justify-center items-center gap-4 bg-gray-800 p-4 rounded-xl">
          <button 
            onClick={() => setIsPlaying(!isPlaying)}
            className={`p-4 rounded-full ${isPlaying ? 'bg-yellow-500' : 'bg-blue-600'} hover:scale-105 transition`}
          >
            {isPlaying ? <Pause size={24} /> : <Play size={24} />}
          </button>
          <button 
            onClick={nextCandle}
            className="p-4 bg-gray-700 rounded-full hover:bg-gray-600 transition"
          >
            <SkipForward size={24} />
          </button>
          <button 
            onClick={() => window.location.reload()}
            className="p-4 bg-gray-700 rounded-full hover:bg-gray-600 transition"
          >
            <RefreshCcw size={24} />
          </button>
        </div>

        {/* Trade Controls */}
        <div className="flex gap-4">
          <button 
            disabled={position !== null}
            onClick={() => handleTrade('BUY')}
            className="flex-1 bg-green-600 hover:bg-green-500 disabled:opacity-50 py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 shadow-lg"
          >
            <TrendingUp size={20} /> BUY
          </button>
          <button 
            disabled={position === null}
            onClick={() => handleTrade('SELL')}
            className="flex-1 bg-red-600 hover:bg-red-500 disabled:opacity-50 py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 shadow-lg"
          >
            <TrendingDown size={20} /> SELL
          </button>
        </div>
      </div>

      {/* Status Bar */}
      {position && (
        <div className="max-w-4xl mx-auto mt-4 bg-blue-900/30 border border-blue-500 p-3 rounded-lg text-center animate-pulse">
          <p className="text-blue-400 font-medium">
            Position Open: {position.type} at ${position.entry.toFixed(2)}
          </p>
        </div>
      )}
    </div>
  );
};

export default App;
