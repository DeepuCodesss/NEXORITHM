'use client';

import { useState, useEffect } from 'react';
import { useApp } from "@/context/AppContext";

function BadgeTooltip({ badge, earned }: { badge: { name: string; desc: string }; earned: boolean }) {
  return (
    <div style={{
      position: 'absolute',
      bottom: 'calc(100% + 8px)',
      left: '50%',
      transform: 'translateX(-50%)',
      background: '#1a1a2e',
      border: '1px solid rgba(139,111,255,0.4)',
      borderRadius: '10px',
      padding: '12px 16px',
      width: '200px',
      zIndex: 100,
      pointerEvents: 'none',
      boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
    }}>
      {/* Arrow */}
      <div style={{
        position: 'absolute',
        bottom: '-6px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '12px',
        height: '6px',
        background: '#1a1a2e',
        clipPath: 'polygon(0 0, 100% 0, 50% 100%)',
      }} />
      <p style={{ color: '#fff', fontWeight: 700, fontSize: '13px', margin: '0 0 4px' }}>
        {badge.name}
      </p>
      {earned ? (
        <>
          <p style={{ color: '#4ade80', fontSize: '11px', margin: '0 0 6px', fontWeight: 600 }}>
            ✓ Earned
          </p>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '11px', margin: 0, lineHeight: 1.5 }}>
            {badge.desc}
          </p>
        </>
      ) : (
        <>
          <p style={{ color: '#f59e0b', fontSize: '11px', margin: '0 0 6px', fontWeight: 600 }}>
            🔒 Locked
          </p>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '11px', margin: '0 0 4px', lineHeight: 1.5 }}>
            How to unlock:
          </p>
          <p style={{ color: '#a78bfa', fontSize: '11px', margin: 0, lineHeight: 1.5 }}>
            {badge.desc}
          </p>
        </>
      )}
    </div>
  );
}

export const ALL_BADGES = [
  { id: 'first_code', name: 'First Code', desc: 'Solved your first problem', img: '/badges/first-code.png', category: 'problems' },
  { id: 'getting_started', name: 'Getting Started', desc: 'Solved 10 problems', img: '/badges/getting-started.png', category: 'problems' },
  { id: 'problem_solver', name: 'Problem Solver', desc: 'Solved 50 problems', img: '/badges/problem-solver.png', category: 'problems' },
  { id: 'code_warrior', name: 'Code Warrior', desc: 'Solved 100 problems', img: '/badges/code-warrior.png', category: 'problems' },
  { id: 'streak_starter', name: 'Streak Starter', desc: 'Maintain a 3-day streak', img: '/badges/streak-starter.png', category: 'streaks' },
  { id: 'on_fire', name: 'On Fire', desc: 'Maintain a 7-day streak', img: '/badges/on-fire.png', category: 'streaks' },
  { id: 'blazing_streak', name: 'Blazing Streak', desc: 'Maintain a 30-day streak', img: '/badges/blazing-streak.png', category: 'streaks' },
  { id: 'contest_player', name: 'Contest Player', desc: 'Participate in your first contest', img: '/badges/contest-player.png', category: 'contests' },
  { id: 'top_performer', name: 'Top Performer', desc: 'Rank in top 50 in a contest', img: '/badges/top-performer.png', category: 'contests' },
  { id: 'star_performer', name: 'Star Performer', desc: 'Rank in top 10 in a contest', img: '/badges/star-performer.png', category: 'contests' },
  { id: 'champion', name: 'Champion', desc: 'Rank #1 in a contest', img: '/badges/champion.png', category: 'contests' },
  { id: 'algorithm_master', name: 'Algorithm Master', desc: 'Solved 100 medium problems', img: '/badges/algorithm-master.png', category: 'skills' },
  { id: 'logic_sage', name: 'Logic Sage', desc: 'Solved 200 medium problems', img: '/badges/logic-sage.png', category: 'skills' },
  { id: 'problem_dominator', name: 'Problem Dominator', desc: 'Solved 500 medium problems', img: '/badges/problem-dominator.png', category: 'skills' },
  { id: 'speed_coder', name: 'Speed Coder', desc: 'Solve 10 problems under 5 mins', img: '/badges/speed-coder.png', category: 'speed' },
  { id: 'quick_thinker', name: 'Quick Thinker', desc: 'Solve 50 problems under 5 mins', img: '/badges/quick-thinker.png', category: 'speed' },
  { id: 'accuracy_pro', name: 'Accuracy Pro', desc: 'Solve 100 problems with 100% accuracy', img: '/badges/accuracy-pro.png', category: 'speed' },
  { id: 'consistent_coder', name: 'Consistent Coder', desc: 'Solve problems 7 days in a row', img: '/badges/consistent-coder.png', category: 'consistency' },
  { id: 'unstoppable', name: 'Unstoppable', desc: 'Solve problems 30 days in a row', img: '/badges/unstoppable.png', category: 'consistency' },
  { id: 'rising_star', name: 'Rising Star', desc: 'Gain 100 XP', img: '/badges/rising-star.png', category: 'xp' },
  { id: 'legend', name: 'Legend', desc: 'Gain 1000 XP', img: '/badges/legend.png', category: 'xp' },
];

export default function BadgesPage() {
  const { user, problems } = useApp();
  const [hoveredBadge, setHoveredBadge] = useState<string | null>(null);
  const [showcasedIds, setShowcasedIds] = useState<string[]>([]);

  useEffect(() => {
    if (user && user.showcaseBadges) {
      setShowcasedIds(user.showcaseBadges.split(',').filter(Boolean));
    }
  }, [user]);

  const toggleShowcase = async (badgeId: string) => {
    let nextShowcase = [...showcasedIds];
    if (nextShowcase.includes(badgeId)) {
      nextShowcase = nextShowcase.filter(id => id !== badgeId);
    } else {
      if (nextShowcase.length >= 4) {
        alert("You can showcase a maximum of 4 badges in your profile!");
        return;
      }
      nextShowcase.push(badgeId);
    }
    
    setShowcasedIds(nextShowcase);
    
    try {
      const res = await fetch('/api/profile/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ showcaseBadges: nextShowcase.join(',') }),
      });
      if (res.ok) {
        if (user) {
          user.showcaseBadges = nextShowcase.join(',');
        }
      }
    } catch (err) {
      console.error("Failed to update showcase badges:", err);
    }
  };

  // Evaluate earned badges dynamically based on synced user metrics
  const earnedBadgeIds: string[] = [];

  if (user && user.solvedProblemIds) {
    const solvedCount = user.solvedProblemIds.length;
    const maxStreak = user.longestStreak;
    const currentXp = user.xp;
    const reputation = user.reputation;

    // Solve problems
    if (solvedCount >= 1) earnedBadgeIds.push('first_code');
    if (solvedCount >= 10) earnedBadgeIds.push('getting_started');
    if (solvedCount >= 50) earnedBadgeIds.push('problem_solver');
    if (solvedCount >= 100) earnedBadgeIds.push('code_warrior');

    // Streaks
    if (maxStreak >= 3) earnedBadgeIds.push('streak_starter');
    if (maxStreak >= 7) earnedBadgeIds.push('on_fire');
    if (maxStreak >= 30) earnedBadgeIds.push('blazing_streak');

    // XP
    if (currentXp >= 100) earnedBadgeIds.push('rising_star');
    if (currentXp >= 1000) earnedBadgeIds.push('legend');

    // Contests & Reputation (approximation/unlock rules)
    if (reputation >= 10) earnedBadgeIds.push('contest_player');
    if (reputation >= 50) earnedBadgeIds.push('top_performer');
    if (reputation >= 150) earnedBadgeIds.push('star_performer');
    if (reputation >= 500) earnedBadgeIds.push('champion');

    // Medium solved problems
    const mediumSolvedCount = user.solvedProblemIds.filter(id => {
      const p = problems.find(prob => prob.id === id);
      return p?.difficulty?.toLowerCase() === 'medium';
    }).length;
    
    if (mediumSolvedCount >= 100) earnedBadgeIds.push('algorithm_master');
    if (mediumSolvedCount >= 200) earnedBadgeIds.push('logic_sage');
    if (mediumSolvedCount >= 500) earnedBadgeIds.push('problem_dominator');

    // Speed, Accuracy & Consistency
    if (solvedCount >= 10 && reputation >= 20) earnedBadgeIds.push('speed_coder');
    if (solvedCount >= 50 && reputation >= 100) earnedBadgeIds.push('quick_thinker');
    if (solvedCount >= 100 && reputation >= 300) earnedBadgeIds.push('accuracy_pro');
    
    if (maxStreak >= 7) earnedBadgeIds.push('consistent_coder');
    if (maxStreak >= 30) earnedBadgeIds.push('unstoppable');
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#05050f',
        padding: '60px 5%',
        fontFamily: 'system-ui',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '48px',
          flexWrap: 'wrap',
          gap: '24px',
        }}
      >
        <div>
          <p
            style={{
              color: '#8b6fff',
              fontSize: '11px',
              letterSpacing: '0.15em',
              marginBottom: '8px',
            }}
          >
            ACHIEVEMENTS THAT DEFINE YOU
          </p>
          <h1
            style={{
              fontSize: 'clamp(2rem, 4vw, 3rem)',
              fontWeight: 700,
              color: '#fff',
              margin: '0 0 12px',
            }}
          >
            Nexorithm{' '}
            <span
              style={{
                background: 'linear-gradient(135deg, #8b6fff, #c084fc)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Badges
            </span>
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '15px', lineHeight: 1.6 }}>
            Solve problems. Build streaks. Earn respect.<br />
            Collect badges that showcase your coding journey.
          </p>
        </div>

        <div
          style={{
            background: 'rgba(139,111,255,0.08)',
            border: '1px solid rgba(139,111,255,0.2)',
            borderRadius: '12px',
            padding: '20px 24px',
            maxWidth: '320px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <span style={{ fontSize: '24px' }}>🏅</span>
            <h3 style={{ color: '#fff', fontSize: '15px', fontWeight: 600, margin: 0 }}>How it works</h3>
          </div>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', margin: 0, lineHeight: 1.6 }}>
            Complete challenges, maintain streaks, and achieve milestones to earn exclusive badges. More badges, more reputation.
          </p>
        </div>
      </div>

      {/* Stats bar */}
      <div
        style={{
          display: 'flex',
          gap: '24px',
          marginBottom: '32px',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px' }}>
          <span style={{ color: '#8b6fff', fontWeight: 700, fontSize: '20px' }}>
            {earnedBadgeIds.length}
          </span>{' '}
          / {ALL_BADGES.length} badges earned
        </div>
        <div
          style={{
            height: '6px',
            background: 'rgba(255,255,255,0.1)',
            borderRadius: '3px',
            flex: 1,
            alignSelf: 'center',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${(earnedBadgeIds.length / ALL_BADGES.length) * 100}%`,
              background: 'linear-gradient(90deg, #8b6fff, #c084fc)',
              borderRadius: '3px',
              transition: 'width 0.5s ease',
            }}
          />
        </div>
      </div>

      {/* Badge Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', // Responsive: minmax 120px for mobile
          gap: '16px',
        }}
      >
        {ALL_BADGES.map((badge) => {
          const earned = earnedBadgeIds.includes(badge.id);
          return (
            <div
              key={badge.id}
              style={{
                position: 'relative',
                background: earned ? 'rgba(139,111,255,0.08)' : 'rgba(255,255,255,0.02)',
                border: `1px solid ${earned ? 'rgba(139,111,255,0.3)' : 'rgba(255,255,255,0.06)'}`,
                borderRadius: '12px',
                padding: '20px 12px',
                textAlign: 'center',
                filter: earned ? 'none' : 'grayscale(100%)',
                opacity: 1,
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(139,111,255,0.2)';
                setHoveredBadge(badge.id);
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
                setHoveredBadge(null);
              }}
            >
              {hoveredBadge === badge.id && (
                <BadgeTooltip badge={badge} earned={earned} />
              )}
              {earned && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleShowcase(badge.id);
                  }}
                  style={{
                    position: 'absolute',
                    top: '8px',
                    right: '8px',
                    background: showcasedIds.includes(badge.id) ? 'rgba(139,111,255,0.2)' : 'rgba(255,255,255,0.03)',
                    border: showcasedIds.includes(badge.id) ? '1px solid rgba(139,111,255,0.4)' : '1px solid rgba(255,255,255,0.05)',
                    borderRadius: '6px',
                    padding: '2px 6px',
                    fontSize: '10px',
                    color: showcasedIds.includes(badge.id) ? '#a78bfa' : 'rgba(255,255,255,0.4)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    transition: 'all 0.2s ease',
                    zIndex: 10
                  }}
                  title={showcasedIds.includes(badge.id) ? "Remove from profile showcase" : "Showcase in profile"}
                >
                  <span>{showcasedIds.includes(badge.id) ? '★' : '☆'}</span>
                  <span>{showcasedIds.includes(badge.id) ? 'Showcased' : 'Showcase'}</span>
                </button>
              )}
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }}>
                <img
                  src={badge.img}
                  alt={badge.name}
                  style={{
                    width: '80px',
                    height: '80px',
                    objectFit: 'contain',
                  }}
                  onError={(e) => {
                    e.currentTarget.src = '/badges/first-code.png';
                  }}
                />
              </div>
              <p
                style={{
                  color: earned ? '#fff' : 'rgba(255,255,255,0.4)',
                  fontWeight: 600,
                  fontSize: '13px',
                  margin: '0 0 4px',
                }}
              >
                {badge.name}
              </p>
              <p
                style={{
                  color: 'rgba(255,255,255,0.35)',
                  fontSize: '11px',
                  margin: '0 0 8px',
                  lineHeight: 1.4,
                }}
              >
                {badge.desc}
              </p>
              {earned && (
                <span
                  style={{
                    background: 'rgba(139,111,255,0.2)',
                    color: '#a78bfa',
                    fontSize: '10px',
                    padding: '2px 10px',
                    borderRadius: '20px',
                    fontWeight: 600,
                    letterSpacing: '0.05em',
                  }}
                >
                  EARNED ✓
                </span>
              )}
              {!earned && (
                <span
                  style={{
                    color: 'rgba(255,255,255,0.2)',
                    fontSize: '10px',
                    letterSpacing: '0.05em',
                  }}
                >
                  LOCKED
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Bottom bar */}
      <div
        style={{
          textAlign: 'center',
          marginTop: '48px',
          padding: '24px',
          borderTop: '1px solid rgba(255,255,255,0.05)',
          color: 'rgba(255,255,255,0.4)',
          fontSize: '14px',
        }}
      >
        ⭐ More epic badges are coming soon. &nbsp;|&nbsp;
        <span style={{ color: '#8b6fff' }}>Keep coding. Keep growing.</span>
      </div>
    </div>
  );
}
