import Image from "next/image";
import {
  Flame,
  Star,
  Calendar,
  Swords,
  IndianRupee,
  Zap,
  Trophy,
  Users,
  ShieldCheck,
  Gift
} from "lucide-react";

export default function ContestsPage() {
  return (
    <div className="app-shell relative h-screen overflow-hidden bg-[#0a0216] font-sans">
      <div className="absolute inset-0">
        <Image
          src="/contest-bg-new.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-center opacity-40 mix-blend-screen"
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,rgba(139,92,246,0.25),transparent_40%),radial-gradient(circle_at_30%_50%,rgba(139,92,246,0.15),transparent_40%)]" />
      </div>

      <main className="relative mx-auto flex h-[calc(100vh-72px)] max-w-[1500px] flex-col px-4 pt-6 sm:px-6 lg:px-10 pb-6">
        
        <div className="relative flex flex-1 flex-col justify-center lg:flex-row lg:justify-start lg:items-center">
          
          {/* Left Content */}
          <div className="relative z-10 w-full space-y-6 lg:w-[50%]">
            
            {/* Top Badges */}
            <div className="flex flex-wrap items-center gap-4">
              <span className="flex items-center gap-2 rounded-full border border-purple-500/40 bg-[#1f093a]/80 px-4 py-1.5 text-[11px] font-bold uppercase tracking-wider text-purple-300 shadow-[0_0_20px_rgba(168,85,247,0.5)] backdrop-blur-md">
                <Flame className="h-4 w-4" />
                Coming Soon
              </span>
              <span className="flex items-center gap-2 rounded-full border border-yellow-500/50 bg-[#3a2208]/80 px-4 py-1.5 text-[11px] font-bold uppercase tracking-wider text-yellow-500 shadow-[0_0_20px_rgba(234,179,8,0.4)] backdrop-blur-md">
                <Star className="h-4 w-4 fill-current" />
                Heavy Prizes
              </span>
            </div>

            {/* Main Title */}
            <h1 className="font-[Impact,Arial_Black,sans-serif] text-[5rem] leading-[0.85] tracking-wide sm:text-[6.5rem] md:text-[7.5rem] lg:text-[8rem]">
              <span className="bg-gradient-to-b from-white via-[#e0c4ff] to-[#8b31ff] bg-clip-text text-transparent drop-shadow-[0_0_40px_rgba(168,85,247,0.6)]">
                CONTESTS
              </span>
            </h1>

            {/* Description */}
            <p className="max-w-xl text-[1rem] font-medium leading-[1.6] text-gray-200">
              A sharper, bigger contest stage is coming. <br />
              Live rounds, college battles, prize announcements, <br />
              and real rankings – <span className="font-bold text-purple-400">all in one place.</span>
            </p>

            {/* Tags Grid */}
            <div className="grid max-w-lg grid-cols-2 gap-3">
              <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-[#160a2c]/80 px-4 py-2.5 shadow-[0_0_15px_rgba(168,85,247,0.15)] backdrop-blur-md">
                <Calendar className="h-4 w-4 text-purple-400" />
                <span className="text-[11px] font-bold uppercase tracking-widest text-gray-300">Weekly Contests</span>
              </div>
              <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-[#160a2c]/80 px-4 py-2.5 shadow-[0_0_15px_rgba(168,85,247,0.15)] backdrop-blur-md">
                <Swords className="h-4 w-4 text-purple-400" />
                <span className="text-[11px] font-bold uppercase tracking-widest text-gray-300">Campus Battles</span>
              </div>
              <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-[#160a2c]/80 px-4 py-2.5 shadow-[0_0_15px_rgba(168,85,247,0.15)] backdrop-blur-md">
                <IndianRupee className="h-4 w-4 text-purple-400" />
                <span className="text-[11px] font-bold uppercase tracking-widest text-gray-300">Cash Prizes</span>
              </div>
              <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-[#160a2c]/80 px-4 py-2.5 shadow-[0_0_15px_rgba(168,85,247,0.15)] backdrop-blur-md">
                <Zap className="h-4 w-4 text-purple-400" />
                <span className="text-[11px] font-bold uppercase tracking-widest text-gray-300">Fast Judging</span>
              </div>
            </div>

            {/* Giant Prize Pool Box */}
            <div className="relative mt-4 inline-flex flex-col items-center justify-center overflow-hidden rounded-[24px] border-2 border-purple-500 bg-[#0b041a] px-12 py-6 shadow-[0_0_50px_rgba(168,85,247,0.6),inset_0_0_30px_rgba(168,85,247,0.4)] backdrop-blur-xl transition-all hover:scale-[1.02] hover:shadow-[0_0_80px_rgba(168,85,247,0.9),inset_0_0_40px_rgba(168,85,247,0.6)] cursor-default">
              <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.05)_50%,transparent_75%)] bg-[length:250%_250%] animate-[shimmer_3s_linear_infinite]" />
              
              <div className="relative z-10 mb-2 flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.4em] text-purple-300">
                <span className="opacity-60">&rarr;</span> TOTAL PRIZE POOL <span className="opacity-60">&larr;</span>
              </div>
              
              <div className="relative z-10 font-[Impact,Arial_Black,sans-serif] text-[4.5rem] leading-none tracking-wide sm:text-[5rem]">
                <span className="bg-gradient-to-b from-[#fff7d1] via-[#ffd700] to-[#b8860b] bg-clip-text text-transparent drop-shadow-[0_5px_15px_rgba(255,215,0,0.4)]">
                  ₹10,00,000
                </span>
              </div>

              <div className="relative z-10 mt-3 text-[11px] font-black uppercase tracking-[0.3em] text-white/90 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                Compete. Perform. Win Big.
              </div>
            </div>
            
          </div>

          {/* Right Image/Trophy (Massive & Positioned Absolute to Right) */}
          <div className="pointer-events-none absolute right-[-5%] top-1/2 hidden -translate-y-[45%] h-[140%] w-[75%] lg:block xl:right-[-8%] xl:h-[160%] xl:w-[85%]">
             <Image
                src="/contest-leaderboard-trophy-v2.png"
                alt=""
                fill
                sizes="85vw"
                className="object-contain object-right drop-shadow-[0_0_120px_rgba(168,85,247,0.7)]"
                priority
              />
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="relative z-10 mt-auto w-full rounded-[32px] border border-white/10 bg-[#0d071a]/70 px-6 py-5 shadow-[0_0_40px_rgba(0,0,0,0.5)] backdrop-blur-2xl md:px-10">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            
            <div className="flex flex-col items-center justify-center gap-2 text-center sm:flex-row sm:text-left">
              <Trophy className="h-7 w-7 text-purple-500" />
              <div>
                <p className="text-[12px] font-black uppercase tracking-wider text-white">Leaderboard</p>
                <p className="mt-0.5 text-[10px] font-bold uppercase tracking-widest text-purple-400">Rank & Rise</p>
              </div>
            </div>

            <div className="flex flex-col items-center justify-center gap-2 text-center sm:flex-row sm:text-left">
              <Users className="h-7 w-7 text-[#3b82f6]" />
              <div>
                <p className="text-[12px] font-black uppercase tracking-wider text-white">College Vs College</p>
                <p className="mt-0.5 text-[10px] font-bold uppercase tracking-widest text-[#3b82f6]">Battle For Glory</p>
              </div>
            </div>

            <div className="flex flex-col items-center justify-center gap-2 text-center sm:flex-row sm:text-left">
              <ShieldCheck className="h-7 w-7 text-purple-500" />
              <div>
                <p className="text-[12px] font-black uppercase tracking-wider text-white">Fair Play</p>
                <p className="mt-0.5 text-[10px] font-bold uppercase tracking-widest text-purple-400">100% Transparent</p>
              </div>
            </div>

            <div className="flex flex-col items-center justify-center gap-2 text-center sm:flex-row sm:text-left">
              <Gift className="h-7 w-7 text-purple-500" />
              <div>
                <p className="text-[12px] font-black uppercase tracking-wider text-white">Exciting Rewards</p>
                <p className="mt-0.5 text-[10px] font-bold uppercase tracking-widest text-purple-400">Beyond Expectations</p>
              </div>
            </div>

          </div>
        </div>

      </main>
    </div>
  );
}
