import { useState, useEffect } from 'react';
import { Search, ChevronDown, Award, Briefcase, GitPullRequest, FolderGit2, Trophy, Github, Code, Globe, Sparkles, TrendingUp, Star, Users, GitFork, DollarSign, GitMerge, Calendar, ChevronRight, Filter, Circle, Eye, Crown } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useTheme } from '../../../shared/contexts/ThemeContext';
import { useAuth } from '../../../shared/contexts/AuthContext';
import { getUserProfile } from '../../../shared/api/client';

interface ProfileData {
  contributions_count: number;
  languages: Array<{ language: string; contribution_count: number }>;
  ecosystems: Array<{ ecosystem_name: string; contribution_count: number }>;
  rank: {
    position: number | null;
    tier: string;
    tier_name: string;
    tier_color: string;
  };
}

export function ProfilePage() {
  const { theme } = useTheme();
  const { user, userRole } = useAuth();
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedMonths, setExpandedMonths] = useState<{ [key: string]: boolean }>({
    'November 2025': true,
    'October 2025': false,
    'September 2025': false,
    'August 2025': false,
    'July 2025': false,
    'June 2025': false,
    'May 2025': false,
    'April 2025': false,
    'March 2025': false,
  });

  // Sample contribution data for heatmap (365 days)
  const contributionData = Array.from({ length: 365 }, (_, i) => {
    const random = Math.random();
    return random > 0.7 ? 3 : random > 0.5 ? 2 : random > 0.3 ? 1 : 0;
  });

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  // Fetch profile data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoadingProfile(true);
        const data = await getUserProfile();
        setProfileData(data);
      } catch (error) {
        console.error('Failed to fetch profile:', error);
      } finally {
        setIsLoadingProfile(false);
      }
    };
    fetchProfile();
  }, []);

  const toggleMonth = (month: string) => {
    setExpandedMonths(prev => ({
      ...prev,
      [month]: !prev[month],
    }));
  };

  // Get rank tier icon
  const getRankIcon = (tierName: string) => {
    const iconClass = "w-5 h-5 text-white drop-shadow-md";
    switch (tierName.toLowerCase()) {
      case 'conqueror':
        return <Crown className={iconClass} />;
      case 'ace':
        return <Trophy className={iconClass} />;
      case 'crown':
        return <Medal className={iconClass} />;
      case 'diamond':
        return <Sparkles className={iconClass} />;
      case 'gold':
        return <Award className={iconClass} />;
      case 'silver':
        return <Circle className={iconClass} />;
      case 'bronze':
        return <Eye className={iconClass} />;
      default:
        return <Award className={iconClass} />;
    }
  };

  const projects = [
    {
      id: 1,
      name: 'React Ecosystem',
      logo: '⚛️',
      rank: 5,
      leads: 2,
      contributions: 15,
      rewards: 3600,
    },
    {
      id: 2,
      name: 'NestJS Framework',
      logo: '▲',
      rank: 8,
      leads: 1,
      contributions: 8,
      rewards: 2640,
    },
    {
      id: 3,
      name: 'Vue.js',
      logo: 'V',
      rank: 3,
      leads: 3,
      contributions: 12,
      rewards: 1800,
    },
  ];

  const contributionsByMonth: { [key: string]: any[] } = {
    'December 2025': [
      {
        id: 1,
        type: 'issue',
        number: 1234,
        badgeColor: '#c9983a',
        title: 'Add support for new React hooks',
        project: 'React Ecosystem',
        date: '27 Nov.',
      },
      {
        id: 2,
        type: 'pr',
        number: 5678,
        badgeColor: '#d4af37',
        title: 'Fix memory leak in component lifecycle',
        project: 'NestJS Framework',
        date: '07 Dec.',
      },
      {
        id: 3,
        type: 'review',
        number: 3421,
        badgeColor: '#b8873a',
        title: 'Review: Improve type safety in API client',
        project: 'Vue.js',
        date: '17 Dec.',
      },
    ],
    'November 2025': [
      {
        id: 4,
        type: 'issue',
        number: 2341,
        badgeColor: '#c9983a',
        title: 'Implement caching layer',
        project: 'React Ecosystem',
        date: '15 Nov.',
      },
      {
        id: 5,
        type: 'pr',
        number: 8923,
        badgeColor: '#d4af37',
        title: 'Add unit tests for API endpoints',
        project: 'NestJS Framework',
        date: '22 Nov.',
      },
    ],
    'October 2025': [
      {
        id: 6,
        type: 'issue',
        number: 4512,
        badgeColor: '#b8873a',
        title: 'Optimize database queries',
        project: 'Vue.js',
        date: '10 Oct.',
      },
    ],
    'September 2025': [
      {
        id: 7,
        type: 'pr',
        number: 7821,
        badgeColor: '#c9983a',
        title: 'Add error boundary component',
        project: 'React Ecosystem',
        date: '05 Sep.',
      },
    ],
    'August 2025': [
      {
        id: 8,
        type: 'issue',
        number: 6234,
        badgeColor: '#d4af37',
        title: 'Refactor state management',
        project: 'NestJS Framework',
        date: '18 Aug.',
      },
    ],
  };

  // Most active languages data
  const activeLanguages = [
    { name: 'Rust', icon: '🦀', activityLevel: 1 }, // 1 dot
    { name: 'Cairo', icon: '🔺', activityLevel: 2 }, // 2 dots
    { name: 'Noir', icon: '◆', activityLevel: 3 }, // 3 dots
  ];

  // Most active ecosystems data
  const activeEcosystems = [
    { name: 'Ethereum', icon: '◆', activityLevel: 1 },
    { name: 'Avail', icon: '🔷', activityLevel: 1 },
  ];

  // Rewards data for donut chart
  const rewardsData = [
    { name: 'Madara', value: 30, color: '#FDB462', amount: 12500 },
    { name: 'Kakarot', value: 25, color: '#B39DDB', amount: 9800 },
    { name: 'Starkly', value: 20, color: '#81C784', amount: 7200 },
    { name: 'Starknet', value: 15, color: '#64B5F6', amount: 5400 },
    { name: 'Others', value: 10, color: '#FFB74D', amount: 3600 },
  ];

  const totalRewards = rewardsData.reduce((sum, item) => sum + item.amount, 0);

  // Activity heatmap data for last 4 weeks
  const activityWeeks = [
    { label: 'Week 29 2023', days: [0, 2, 1, 0, 3, 2, 1] },
    { label: 'Week 45 2023', days: [1, 0, 2, 3, 1, 0, 2] },
    { label: 'Week 46 2023', days: [2, 1, 0, 2, 3, 1, 0] },
    { label: '< Current week', days: [0, 3, 2, 1, 0, 2, 1] },
  ];

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="backdrop-blur-[40px] bg-gradient-to-br from-white/[0.18] to-white/[0.10] rounded-[32px] border-2 border-white/30 shadow-[0_20px_60px_rgba(0,0,0,0.15),0_0_80px_rgba(201,152,58,0.08)] p-12 relative overflow-hidden group">
        {/* Ambient Background Glow - Enhanced */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-[#c9983a]/15 via-[#d4af37]/10 to-transparent rounded-full blur-3xl pointer-events-none group-hover:scale-110 transition-transform duration-1000" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-[#d4af37]/12 to-transparent rounded-full blur-3xl pointer-events-none group-hover:scale-110 transition-transform duration-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-gradient-to-r from-[#c9983a]/5 via-transparent to-[#d4af37]/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative flex items-start justify-between gap-10">
          {/* Left Section - Profile Info */}
          <div className="flex items-start gap-7">
            {/* Avatar with Enhanced Effects */}
            <div className="relative group/avatar">
              <div className="absolute inset-0 bg-gradient-to-br from-[#c9983a]/40 to-[#d4af37]/25 rounded-full blur-2xl group-hover/avatar:blur-3xl transition-all duration-700 animate-pulse" />
              <div className="absolute inset-0 bg-gradient-to-br from-[#ffd700]/20 to-[#c9983a]/10 rounded-full blur-xl" />
              {user?.github.avatar_url ? (
                <img 
                  src={user.github.avatar_url} 
                  alt={user.github.login}
                  className="relative w-32 h-32 rounded-full border-[6px] border-white/40 shadow-[0_12px_40px_rgba(0,0,0,0.25),inset_0_2px_8px_rgba(255,255,255,0.3)] flex-shrink-0 group-hover/avatar:scale-105 transition-transform duration-500 object-cover"
                />
              ) : (
                <div className="relative w-32 h-32 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-purple-600 border-[6px] border-white/40 shadow-[0_12px_40px_rgba(0,0,0,0.25),inset_0_2px_8px_rgba(255,255,255,0.3)] flex-shrink-0 group-hover/avatar:scale-105 transition-transform duration-500" />
              )}
              <div className="absolute -bottom-3 -right-3 w-12 h-12 rounded-full backdrop-blur-[25px] bg-gradient-to-br from-[#ffd700] via-[#c9983a] to-[#b8873a] border-[4px] border-white/50 shadow-[0_6px_20px_rgba(201,152,58,0.5),0_0_20px_rgba(255,215,0,0.3)] flex items-center justify-center group-hover/avatar:rotate-12 transition-transform duration-500">
                <Award className="w-6 h-6 text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]" />
              </div>
            </div>
            
            {/* User Details */}
            <div className="flex-1 pt-1">
              {/* Username with Glow */}
              <h1 className={`text-[42px] font-black mb-3 tracking-tight transition-colors ${
                theme === 'dark'
                  ? 'text-[#f5f5f5]'
                  : 'bg-gradient-to-r from-[#1a1410] via-[#2d2820] to-[#4a3f2f] bg-clip-text text-transparent drop-shadow-[0_2px_4px_rgba(0,0,0,0.1)]'
              }`}>
                {user?.github.login || 'Loading...'}
              </h1>
              
              {/* Role and Rank Badges */}
              <div className="flex items-center gap-3 mb-7 flex-wrap">
                {/* Role Badge - Ultra Premium Design */}
                <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-[14px] backdrop-blur-[30px] bg-gradient-to-r from-[#c9983a]/30 via-[#d4af37]/25 to-[#c9983a]/20 border-[2.5px] border-[#c9983a]/50 shadow-[0_10px_30px_rgba(201,152,58,0.3),inset_0_1px_3px_rgba(255,255,255,0.4),0_0_40px_rgba(201,152,58,0.15)] hover:shadow-[0_15px_40px_rgba(201,152,58,0.4),inset_0_1px_3px_rgba(255,255,255,0.5)] hover:scale-105 transition-all duration-300 group/badge">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#ffd700] via-[#f4c430] to-[#c9983a] flex items-center justify-center shadow-[0_3px_12px_rgba(201,152,58,0.5),inset_0_1px_2px_rgba(255,255,255,0.5)]">
                    <Award className="w-4 h-4 text-white drop-shadow-md" />
                  </div>
                  <span className={`text-[16px] font-black tracking-wide capitalize transition-colors ${
                    theme === 'dark'
                      ? 'text-[#f5c563]'
                      : 'bg-gradient-to-r from-[#2d2820] via-[#c9983a] to-[#2d2820] bg-clip-text text-transparent'
                  }`}>
                    {userRole || 'contributor'}
                  </span>
                  <Sparkles className="w-5 h-5 text-[#c9983a] animate-pulse drop-shadow-[0_0_8px_rgba(201,152,58,0.6)]" />
                </div>

                {/* Rank Badge */}
                {profileData?.rank && (
                  <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-[14px] backdrop-blur-[30px] bg-gradient-to-r from-white/[0.2] to-white/[0.15] border-[2.5px] border-white/30 shadow-[0_10px_30px_rgba(0,0,0,0.1),inset_0_1px_3px_rgba(255,255,255,0.3)] hover:shadow-[0_15px_40px_rgba(0,0,0,0.15),inset_0_1px_3px_rgba(255,255,255,0.4)] hover:scale-105 transition-all duration-300 group/rank-badge">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#c9983a] to-[#d4af37] flex items-center justify-center shadow-[0_3px_12px_rgba(201,152,58,0.5),inset_0_1px_2px_rgba(255,255,255,0.5)]">
                      {getRankIcon(profileData.rank.tier_name)}
                    </div>
                    <span className={`text-[16px] font-black tracking-wide capitalize transition-colors ${
                      theme === 'dark'
                        ? 'text-[#f5f5f5]'
                        : 'text-[#2d2820]'
                    }`}>
                      {profileData.rank.tier_name}
                    </span>
                    {profileData.rank.position && (
                      <span className={`text-[14px] font-bold transition-colors ${
                        theme === 'dark' ? 'text-[#d4d4d4]' : 'text-[#7a6b5a]'
                      }`}>
                        #{profileData.rank.position}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Stats Grid - Inline Premium Style */}
              <div className="space-y-4 mb-6">
                {/* Row 1 - Contributions & Rewards */}
                <div className="flex items-center gap-8">
                  <div className="flex items-center gap-3 group/stat">
                    <div className="w-12 h-12 rounded-[14px] bg-gradient-to-br from-[#c9983a]/30 via-[#d4af37]/25 to-[#c9983a]/20 border-2 border-[#c9983a]/50 flex items-center justify-center shadow-[0_4px_16px_rgba(201,152,58,0.25),inset_0_1px_2px_rgba(255,255,255,0.2)] group-hover/stat:scale-110 group-hover/stat:shadow-[0_6px_24px_rgba(201,152,58,0.4)] transition-all duration-300">
                      <GitPullRequest className="w-6 h-6 text-[#c9983a] drop-shadow-sm" />
                    </div>
                    <div>
                      <div className={`text-[28px] font-black leading-none mb-1 drop-shadow-sm transition-colors ${
                        theme === 'dark' ? 'text-[#f5f5f5]' : 'text-[#2d2820]'
                      }`}>
                        {isLoadingProfile ? '...' : (profileData?.contributions_count || 0)}
                      </div>
                      <div className={`text-[12px] font-bold uppercase tracking-wider transition-colors ${
                        theme === 'dark' ? 'text-[#d4d4d4]' : 'text-[#7a6b5a]'
                      }`}>Contributions</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 group/stat">
                    <div className="w-12 h-12 rounded-[14px] bg-gradient-to-br from-[#c9983a]/30 via-[#d4af37]/25 to-[#c9983a]/20 border-2 border-[#c9983a]/50 flex items-center justify-center shadow-[0_4px_16px_rgba(201,152,58,0.25),inset_0_1px_2px_rgba(255,255,255,0.2)] group-hover/stat:scale-110 group-hover/stat:shadow-[0_6px_24px_rgba(201,152,58,0.4)] transition-all duration-300">
                      <Trophy className="w-6 h-6 text-[#c9983a] drop-shadow-sm" />
                    </div>
                    <div>
                      <div className={`text-[28px] font-black leading-none mb-1 drop-shadow-sm transition-colors ${
                        theme === 'dark' ? 'text-[#f5f5f5]' : 'text-[#2d2820]'
                      }`}>4</div>
                      <div className={`text-[12px] font-bold uppercase tracking-wider transition-colors ${
                        theme === 'dark' ? 'text-[#d4d4d4]' : 'text-[#7a6b5a]'
                      }`}>Rewards</div>
                    </div>
                  </div>
                </div>

                {/* Row 2 - Projects Stats */}
                <div className="flex items-center gap-8">
                  <div className="flex items-center gap-3 group/stat">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#c9983a]/30 to-[#d4af37]/20 border-2 border-[#c9983a]/50 flex items-center justify-center shadow-[0_3px_12px_rgba(201,152,58,0.25),inset_0_1px_2px_rgba(255,255,255,0.2)] group-hover/stat:scale-110 group-hover/stat:shadow-[0_5px_20px_rgba(201,152,58,0.4)] transition-all duration-300">
                      <Users className="w-5 h-5 text-[#c9983a] drop-shadow-sm" />
                    </div>
                    <span className={`text-[15px] font-medium transition-colors ${
                      theme === 'dark' ? 'text-[#d4d4d4]' : 'text-[#7a6b5a]'
                    }`}>
                      Contributor on <span className={`font-black text-[16px] transition-colors ${
                        theme === 'dark' ? 'text-[#f5f5f5]' : 'text-[#2d2820]'
                      }`}>48</span> projects
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-8">
                  <div className="flex items-center gap-3 group/stat">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#c9983a]/30 to-[#d4af37]/20 border-2 border-[#c9983a]/50 flex items-center justify-center shadow-[0_3px_12px_rgba(201,152,58,0.25),inset_0_1px_2px_rgba(255,255,255,0.2)] group-hover/stat:scale-110 transition-all duration-300">
                      <Star className="w-5 h-5 text-[#c9983a] fill-[#c9983a] drop-shadow-sm" />
                    </div>
                    <span className={`text-[15px] font-medium transition-colors ${
                      theme === 'dark' ? 'text-[#d4d4d4]' : 'text-[#7a6b5a]'
                    }`}>
                      Lead <span className={`font-black text-[16px] transition-colors ${
                        theme === 'dark' ? 'text-[#f5f5f5]' : 'text-[#2d2820]'
                      }`}>3</span> projects
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Section - Epic Rank Badge */}
          <div className="relative group/rank flex-shrink-0">
            {/* Outer Glow - Multi-layer */}
            <div className="absolute inset-0 rounded-[28px] blur-2xl group-hover/rank:blur-3xl transition-all duration-700 opacity-80 bg-gradient-to-br from-[#c9983a]/50 via-[#d4af37]/35 to-transparent" />
            <div className="absolute inset-0 rounded-[28px] blur-xl group-hover/rank:scale-110 transition-transform duration-700 bg-gradient-to-br from-[#ffd700]/30 to-transparent" />
            
            {/* Main Badge */}
            <div className="relative backdrop-blur-[40px] rounded-[28px] border-[3.5px] border-white/50 shadow-[0_15px_60px_rgba(201,152,58,0.5),inset_0_2px_4px_rgba(255,255,255,0.5),0_0_60px_rgba(255,215,0,0.2)] p-10 min-w-[200px] text-center group-hover/rank:scale-105 group-hover/rank:shadow-[0_20px_80px_rgba(201,152,58,0.6),inset_0_2px_4px_rgba(255,255,255,0.6)] transition-all duration-500 bg-gradient-to-br from-[#c9983a]/40 via-[#d4af37]/30 to-[#c9983a]/25">
              {/* Decorative Elements */}
              <div className="absolute top-4 left-4 w-4 h-4 rounded-full bg-white/50 shadow-[0_0_12px_rgba(255,255,255,0.8)] animate-pulse" />
              <div className="absolute top-4 right-4 w-3 h-3 rounded-full bg-[#c9983a]/70 shadow-[0_0_10px_rgba(201,152,58,0.9)]" />
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-white/40" />
              
              {/* Rank Number */}
              <div className="relative mb-3">
                {isLoadingProfile ? (
                  <div className="text-[64px] font-black text-gray-400">...</div>
                ) : profileData?.rank?.position ? (
                  <div className="text-[64px] font-black bg-gradient-to-b from-[#1a1410] via-[#2d2820] to-[#c9983a] bg-clip-text text-transparent leading-none drop-shadow-[0_4px_12px_rgba(0,0,0,0.2)]" style={{ letterSpacing: '-0.02em' }}>
                    {profileData.rank.position}
                    <span className="text-[36px] align-super">
                      {profileData.rank.position === 1 ? 'st' :
                       profileData.rank.position === 2 ? 'nd' :
                       profileData.rank.position === 3 ? 'rd' : 'th'}
                    </span>
                  </div>
                ) : (
                  <div className="text-[48px] font-black text-gray-400 leading-none">
                    Unranked
                  </div>
                )}
              </div>
              
              {/* Divider */}
              <div className="h-[3px] w-20 mx-auto bg-gradient-to-r from-transparent via-[#c9983a]/80 to-transparent mb-4 rounded-full shadow-[0_2px_8px_rgba(201,152,58,0.4)]" />
              
              {/* Badge Label */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-[10px] bg-white/[0.3] border-2 border-[#c9983a]/50 shadow-[0_3px_12px_rgba(201,152,58,0.3),inset_0_1px_2px_rgba(255,255,255,0.4)]">
                {getRankIcon(profileData?.rank?.tier_name || 'Bronze')}
                <span className="text-[13px] font-black text-[#c9983a] uppercase tracking-[0.15em]">
                  {profileData?.rank?.tier_name || 'Bronze'}
                </span>
              </div>
              
              {/* Shine Effect */}
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/15 to-transparent rounded-[28px] opacity-0 group-hover/rank:opacity-100 transition-opacity duration-700" />
              
              {/* Rotating Glow */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#ffd700]/10 to-transparent rounded-[28px] animate-pulse" />
            </div>
          </div>
        </div>
      </div>

      {/* Projects Led / Most */}
      <div className="backdrop-blur-[40px] bg-white/[0.12] rounded-[24px] border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.08)] p-8 relative overflow-hidden group/projects">
        {/* Animated Background Glow */}
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-[#c9983a]/8 to-transparent rounded-full blur-3xl pointer-events-none group-hover/projects:scale-125 transition-transform duration-1000" />
        
        <div className="relative flex items-center justify-between mb-6">
          <h2 className={`text-[20px] font-bold transition-colors ${
            theme === 'dark' ? 'text-[#f5f5f5]' : 'text-[#2d2820]'
          }`}>Projects led / Most</h2>
          <button className="text-[13px] text-[#c9983a] hover:text-[#a67c2e] font-medium transition-all hover:scale-105 hover:translate-x-1 duration-200">
            See all →
          </button>
        </div>

        <div className="relative grid grid-cols-3 gap-5">
          {projects.map((project, idx) => (
            <div
              key={project.id}
              className={`backdrop-blur-[20px] rounded-[16px] border p-5 hover:scale-105 hover:shadow-[0_12px_36px_rgba(0,0,0,0.12)] transition-all duration-300 cursor-pointer group/project ${
                theme === 'dark'
                  ? 'bg-white/[0.08] border-white/10 hover:bg-white/[0.12] hover:border-white/15'
                  : 'bg-white/[0.15] border-white/25 hover:bg-white/[0.2] hover:border-white/40'
              }`}
              style={{
                animationDelay: `${idx * 100}ms`,
              }}
            >
              {/* Project Header */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-[12px] bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-md text-[22px] group-hover/project:scale-110 group-hover/project:rotate-6 transition-all duration-300">
                  {project.logo}
                </div>
                <div className="flex-1">
                  <h3 className={`text-[16px] font-bold group-hover/project:text-[#c9983a] transition-colors ${
                    theme === 'dark' ? 'text-[#f5f5f5]' : 'text-[#2d2820]'
                  }`}>{project.name}</h3>
                </div>
              </div>

              {/* Project Metrics with Icons */}
              <div className="flex items-center gap-3 mb-4 text-[13px]">
                <div className={`flex items-center gap-1.5 group-hover/project:text-[#c9983a] transition-colors ${
                  theme === 'dark' ? 'text-[#d4d4d4]' : 'text-[#7a6b5a]'
                }`}>
                  <Star className="w-5 h-5" />
                  <span>{project.rank.toLocaleString()}</span>
                </div>
                <div className={`flex items-center gap-1.5 group-hover/project:text-[#c9983a] transition-colors ${
                  theme === 'dark' ? 'text-[#d4d4d4]' : 'text-[#7a6b5a]'
                }`}>
                  <Users className="w-5 h-5" />
                  <span>{project.leads.toLocaleString()}</span>
                </div>
                <div className={`flex items-center gap-1.5 group-hover/project:text-[#c9983a] transition-colors ${
                  theme === 'dark' ? 'text-[#d4d4d4]' : 'text-[#7a6b5a]'
                }`}>
                  <GitFork className="w-5 h-5" />
                  <span>{project.contributions}</span>
                </div>
              </div>

              {/* Bottom Stats - Rewards and Merged PRs */}
              <div className="grid grid-cols-2 gap-3">
                <div className={`backdrop-blur-[15px] rounded-[10px] border p-3 group-hover/project:bg-white/[0.15] transition-all ${
                  theme === 'dark' ? 'bg-white/[0.06] border-white/8' : 'bg-white/[0.1] border-white/20'
                }`}>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-7 h-7 rounded-full bg-[#c9983a]/20 flex items-center justify-center group-hover/project:scale-110 transition-transform">
                      <DollarSign className="w-4 h-4 text-[#c9983a]" />
                    </div>
                    <span className={`text-[10px] font-medium transition-colors ${
                      theme === 'dark' ? 'text-[#d4d4d4]' : 'text-[#7a6b5a]'
                    }`}>Rewards</span>
                  </div>
                  <div className={`text-[20px] font-bold transition-colors ${
                    theme === 'dark' ? 'text-[#f5f5f5]' : 'text-[#2d2820]'
                  }`}>0</div>
                </div>
                <div className={`backdrop-blur-[15px] rounded-[10px] border p-3 group-hover/project:bg-white/[0.15] transition-all ${
                  theme === 'dark' ? 'bg-white/[0.06] border-white/8' : 'bg-white/[0.1] border-white/20'
                }`}>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-7 h-7 rounded-full bg-[#c9983a]/20 flex items-center justify-center group-hover/project:scale-110 transition-transform">
                      <GitMerge className="w-4 h-4 text-[#c9983a]" />
                    </div>
                    <span className={`text-[10px] font-medium transition-colors ${
                      theme === 'dark' ? 'text-[#d4d4d4]' : 'text-[#7a6b5a]'
                    }`}>Merged PRs</span>
                  </div>
                  <div className={`text-[20px] font-bold transition-colors ${
                    theme === 'dark' ? 'text-[#f5f5f5]' : 'text-[#2d2820]'
                  }`}>0</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Most active languages & ecosystems - Combined */}
      <div className="grid grid-cols-2 gap-6">
        {/* Most active languages */}
        <div className="backdrop-blur-[40px] bg-white/[0.12] rounded-[24px] border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.08)] p-6">
          <div className="flex items-center gap-2 mb-5">
            <Code className="w-5 h-5 text-[#c9983a]" />
            <h2 className={`text-[16px] font-bold transition-colors ${
              theme === 'dark' ? 'text-[#f5f5f5]' : 'text-[#2d2820]'
            }`}>Most active languages</h2>
          </div>

          <div className="space-y-3">
            {activeLanguages.map((language) => (
              <div
                key={language.name}
                className="backdrop-blur-[20px] bg-white/[0.15] rounded-[12px] border border-white/25 p-4 hover:bg-white/[0.2] transition-all group cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-[24px]">{language.icon}</span>
                    <span className={`text-[15px] font-semibold transition-colors ${
                      theme === 'dark' ? 'text-[#f5f5f5]' : 'text-[#2d2820]'
                    }`}>{language.name}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {Array.from({ length: 3 }).map((_, idx) => (
                      <div
                        key={idx}
                        className={`w-2.5 h-2.5 rounded-full transition-all ${
                          idx < language.activityLevel
                            ? 'bg-[#c9983a] shadow-[0_0_8px_rgba(201,152,58,0.6)] group-hover:scale-125'
                            : 'bg-white/20'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Most active ecosystems */}
        <div className="backdrop-blur-[40px] bg-white/[0.12] rounded-[24px] border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.08)] p-6">
          <div className="flex items-center gap-2 mb-5">
            <Globe className="w-5 h-5 text-[#c9983a]" />
            <h2 className={`text-[16px] font-bold transition-colors ${
              theme === 'dark' ? 'text-[#f5f5f5]' : 'text-[#2d2820]'
            }`}>Most active ecosystems</h2>
          </div>

          <div className="space-y-3">
            {activeEcosystems.map((ecosystem) => (
              <div
                key={ecosystem.name}
                className="backdrop-blur-[20px] bg-white/[0.15] rounded-[12px] border border-white/25 p-4 hover:bg-white/[0.2] transition-all group cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-[24px]">{ecosystem.icon}</span>
                    <span className={`text-[15px] font-semibold transition-colors ${
                      theme === 'dark' ? 'text-[#f5f5f5]' : 'text-[#2d2820]'
                    }`}>{ecosystem.name}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {Array.from({ length: 3 }).map((_, idx) => (
                      <div
                        key={idx}
                        className={`w-2.5 h-2.5 rounded-full transition-all ${
                          idx < ecosystem.activityLevel
                            ? 'bg-[#c9983a] shadow-[0_0_8px_rgba(201,152,58,0.6)] group-hover:scale-125'
                            : 'bg-white/20'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Rewards Distribution */}
      <div className="backdrop-blur-[40px] bg-white/[0.12] rounded-[24px] border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.08)] p-8 relative overflow-hidden group/rewards">
        {/* Animated Background Glow */}
        <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-gradient-to-br from-[#c9983a]/10 to-transparent rounded-full blur-3xl pointer-events-none group-hover/rewards:scale-125 transition-transform duration-1000" />
        
        <div className="relative flex items-center gap-2 mb-6">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#c9983a]/30 to-[#d4af37]/20 flex items-center justify-center shadow-[0_4px_16px_rgba(201,152,58,0.25)]">
            <Trophy className="w-5 h-5 text-[#c9983a]" />
          </div>
          <h2 className={`text-[18px] font-bold transition-colors ${
            theme === 'dark' ? 'text-[#f5f5f5]' : 'text-[#2d2820]'
          }`}>Rewards Distribution</h2>
        </div>

        <div className="relative flex items-center gap-10">
          {/* Left: Donut Chart with Center Total */}
          <div className="relative group/chart">
            {/* Pulsing Glow Behind Chart */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#c9983a]/20 to-[#d4af37]/15 rounded-full blur-2xl group-hover/chart:scale-110 transition-transform duration-500" />
            
            <div className="w-[240px] h-[240px] relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={rewardsData}
                    cx="50%"
                    cy="50%"
                    innerRadius={75}
                    outerRadius={105}
                    paddingAngle={3}
                    dataKey="value"
                    animationBegin={0}
                    animationDuration={800}
                    animationEasing="ease-out"
                  >
                    {rewardsData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.color}
                        className="hover:opacity-80 transition-opacity cursor-pointer"
                      />
                    ))}
                  </Pie>
                  <Tooltip 
                    content={({ active, payload }) => {
                      if (active && payload && payload[0]) {
                        const data = payload[0].payload;
                        return (
                          <div className="backdrop-blur-[40px] bg-[#e8dfd0]/95 rounded-[14px] border border-white/25 shadow-[0_8px_24px_rgba(0,0,0,0.12)] px-6 py-4">
                            <div className="text-[24px] font-black text-[#2d2820] drop-shadow-sm">
                              ${data.amount.toLocaleString()}
                            </div>
                            <div className="text-[11px] font-bold text-[#7a6b5a] uppercase tracking-widest mt-1">
                              {data.name}
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                    offset={50}
                    position={{ y: -80 }}
                    wrapperStyle={{ zIndex: 1000 }}
                    cursor={false}
                  />
                </PieChart>
              </ResponsiveContainer>
              
              {/* Center Total with Animation */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <div className="text-[13px] font-bold text-[#7a6b5a] uppercase tracking-wider mb-1 animate-pulse">Total</div>
                <div className="text-[36px] font-black bg-gradient-to-b from-[#2d2820] to-[#c9983a] bg-clip-text text-transparent leading-none group-hover/chart:scale-110 transition-transform duration-300">
                  ${(totalRewards / 1000).toFixed(1)}K
                </div>
                <div className="text-[11px] font-semibold text-[#7a6b5a] mt-1">USD Earned</div>
              </div>
            </div>
          </div>

          {/* Right: Legend with Amounts */}
          <div className="flex-1 grid grid-cols-2 gap-4">
            {rewardsData.map((item, idx) => (
              <div
                key={item.name}
                className="backdrop-blur-[20px] bg-white/[0.15] rounded-[14px] border border-white/25 p-4 hover:bg-white/[0.25] hover:scale-105 hover:border-white/40 hover:shadow-[0_8px_24px_rgba(0,0,0,0.12)] transition-all duration-300 cursor-pointer group/card"
                style={{
                  animationDelay: `${idx * 100}ms`,
                }}
              >
                <div className="flex items-start gap-3">
                  <div
                    className="w-4 h-4 rounded-full shadow-[0_2px_8px_rgba(0,0,0,0.2)] flex-shrink-0 mt-0.5 group-hover/card:scale-150 group-hover/card:shadow-[0_4px_16px_rgba(0,0,0,0.3)] transition-all duration-300"
                    style={{ backgroundColor: item.color }}
                  />
                  <div className="flex-1">
                    <div className="text-[13px] font-semibold text-[#2d2820] mb-1 group-hover/card:text-[#c9983a] transition-colors">{item.name}</div>
                    <div className="flex items-baseline gap-2">
                      <div className="text-[20px] font-black text-[#2d2820] group-hover/card:scale-105 transition-transform origin-left">
                        ${item.amount.toLocaleString()}
                      </div>
                      <div className="text-[11px] font-bold text-[#c9983a] group-hover/card:scale-110 transition-transform">{item.value}%</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Contribution Heatmap */}
      <div className="backdrop-blur-[40px] bg-white/[0.18] rounded-[24px] border-2 border-white/30 shadow-[0_8px_32px_rgba(0,0,0,0.08)] p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className={`text-[18px] font-bold transition-colors ${
            theme === 'dark' ? 'text-[#f5f5f5]' : 'text-[#2d2820]'
          }`}>
            <span className={`text-[32px] font-black transition-colors ${
              theme === 'dark' ? 'text-[#f5f5f5]' : 'text-[#2d2820]'
            }`}>470</span>
            <span className={`text-[16px] ml-2 transition-colors ${
              theme === 'dark' ? 'text-[#d4d4d4]' : 'text-[#7a6b5a]'
            }`}>contributions last year</span>
          </h2>
        </div>

        {/* GitHub-style Heatmap Grid */}
        <div className="w-full backdrop-blur-[20px] bg-white/[0.12] rounded-[20px] border border-white/30 p-6">
          {/* Month Labels */}
          <div className="flex mb-4">
            <div className="w-16" /> {/* Space for day labels */}
            <div className="flex-1 flex justify-between px-1">
              {months.map((month, idx) => (
                <div key={idx} className={`text-[13px] font-bold transition-colors ${
                  theme === 'dark' ? 'text-[#f5f5f5]' : 'text-[#2d2820]'
                }`}>
                  {month}
                </div>
              ))}
            </div>
          </div>

          {/* Grid Container */}
          <div className="flex gap-3">
            {/* Day of week labels */}
            <div className="flex flex-col justify-between py-[3px]">
              <div className={`h-[14px] text-[12px] font-bold flex items-center transition-colors ${
                theme === 'dark' ? 'text-[#f5f5f5]' : 'text-[#2d2820]'
              }`}>Mon</div>
              <div className="h-[14px]" />
              <div className={`h-[14px] text-[12px] font-bold flex items-center transition-colors ${
                theme === 'dark' ? 'text-[#f5f5f5]' : 'text-[#2d2820]'
              }`}>Wed</div>
              <div className="h-[14px]" />
              <div className={`h-[14px] text-[12px] font-bold flex items-center transition-colors ${
                theme === 'dark' ? 'text-[#f5f5f5]' : 'text-[#2d2820]'
              }`}>Fri</div>
              <div className="h-[14px]" />
              <div className={`h-[14px] text-[12px] font-bold flex items-center transition-colors ${
                theme === 'dark' ? 'text-[#f5f5f5]' : 'text-[#2d2820]'
              }`}>Sun</div>
            </div>

            {/* Contribution squares - 52 weeks */}
            <div className="flex-1 flex justify-between gap-[3px]">
              {Array.from({ length: 52 }).map((_, weekIdx) => (
                <div key={weekIdx} className="flex flex-col gap-[3px] flex-1 max-w-[20px]">
                  {Array.from({ length: 7 }).map((_, dayIdx) => {
                    const dataIdx = weekIdx * 7 + dayIdx;
                    const level = contributionData[dataIdx] || 0;
                    const hasSparkle = level === 3 && Math.random() > 0.6;
                    
                    let bgColor = 'bg-white/40 border-2 border-white/60'; // Empty - much more visible white
                    let shadowClass = 'shadow-[0_2px_8px_rgba(255,255,255,0.3)]';
                    if (level === 1) {
                      bgColor = 'bg-[#c9983a]/50 border-2 border-[#c9983a]/70';
                      shadowClass = 'shadow-[0_2px_10px_rgba(201,152,58,0.3)]';
                    }
                    if (level === 2) {
                      bgColor = 'bg-[#c9983a]/75 border-2 border-[#c9983a]/90';
                      shadowClass = 'shadow-[0_3px_14px_rgba(201,152,58,0.45)]';
                    }
                    if (level === 3) {
                      bgColor = 'bg-gradient-to-br from-[#c9983a] to-[#b8873a] border-2 border-[#ffd700]';
                      shadowClass = 'shadow-[0_4px_20px_rgba(201,152,58,0.6),0_0_15px_rgba(255,215,0,0.4)]';
                    }

                    return (
                      <div
                        key={dayIdx}
                        className={`w-full aspect-square rounded-[4px] ${bgColor} ${shadowClass} hover:scale-125 hover:ring-2 hover:ring-[#c9983a] hover:shadow-[0_4px_24px_rgba(201,152,58,0.8)] hover:z-10 transition-all duration-200 cursor-pointer relative group`}
                        title={`${level} contributions`}
                      >
                        {hasSparkle && (
                          <Sparkles className="w-[10px] h-[10px] text-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 drop-shadow-[0_0_6px_rgba(255,255,255,1)] animate-pulse" />
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center justify-end gap-4 mt-6">
            <span className="text-[13px] font-bold text-[#7a6b5a]">Less</span>
            <div className="flex items-center gap-2.5">
              <div className="w-[16px] h-[16px] rounded-[4px] bg-white/40 border-2 border-white/60 shadow-[0_2px_8px_rgba(255,255,255,0.3)]" />
              <div className="w-[16px] h-[16px] rounded-[4px] bg-[#c9983a]/50 border-2 border-[#c9983a]/70 shadow-[0_2px_10px_rgba(201,152,58,0.3)]" />
              <div className="w-[16px] h-[16px] rounded-[4px] bg-[#c9983a]/75 border-2 border-[#c9983a]/90 shadow-[0_3px_14px_rgba(201,152,58,0.45)]" />
              <div className="w-[16px] h-[16px] rounded-[4px] bg-gradient-to-br from-[#c9983a] to-[#b8873a] border-2 border-[#ffd700] shadow-[0_4px_20px_rgba(201,152,58,0.6),0_0_15px_rgba(255,215,0,0.4)]" />
            </div>
            <span className="text-[13px] font-bold text-[#7a6b5a]">More</span>
          </div>
        </div>
      </div>

      {/* Contributions Activity */}
      <div className="backdrop-blur-[40px] bg-white/[0.12] rounded-[24px] border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.08)] p-8">
        <h2 className={`text-[20px] font-bold mb-6 transition-colors ${
          theme === 'dark' ? 'text-[#f5f5f5]' : 'text-[#2d2820]'
        }`}>Contributions Activity</h2>

        {/* Search and Filter */}
        <div className="flex items-center gap-3 mb-6">
          <div className="relative flex-1">
            <Search className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${
              theme === 'dark' ? 'text-[#d4d4d4]' : 'text-[#7a6b5a]'
            }`} />
            <input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-12 pr-4 py-3 rounded-[12px] backdrop-blur-[30px] bg-white/[0.15] border border-white/25 focus:outline-none focus:bg-white/[0.2] focus:border-[#c9983a]/40 transition-all text-[13px] ${
                theme === 'dark' ? 'text-[#f5f5f5] placeholder-[#d4d4d4]' : 'text-[#2d2820] placeholder-[#7a6b5a]'
              }`}
            />
          </div>
        </div>

        {/* Activity List */}
        <div className="space-y-2">
          {Object.entries(contributionsByMonth).map(([month, items]) => (
            <div key={month} className="backdrop-blur-[20px] bg-white/[0.08] rounded-[12px] border border-white/20 overflow-hidden">
              {/* Month Header with Calendar Icon */}
              <button
                onClick={() => toggleMonth(month)}
                className="w-full flex items-center gap-3 px-5 py-3.5 hover:bg-white/[0.05] transition-all group"
              >
                <Calendar className={`w-4 h-4 group-hover:text-[#c9983a] transition-colors flex-shrink-0 ${
                  theme === 'dark' ? 'text-[#d4d4d4]' : 'text-[#7a6b5a]'
                }`} />
                <span className={`text-[14px] font-semibold flex-1 text-left transition-colors ${
                  theme === 'dark' ? 'text-[#f5f5f5]' : 'text-[#2d2820]'
                }`}>{month}</span>
                <ChevronRight
                  className={`w-4 h-4 transition-all duration-200 ${
                    expandedMonths[month] ? 'rotate-90' : ''
                  } ${theme === 'dark' ? 'text-[#d4d4d4]' : 'text-[#7a6b5a]'}`}
                />
              </button>

              {/* Horizontal Divider */}
              {expandedMonths[month] && (
                <div className="border-t border-white/15" />
              )}

              {/* Month Items */}
              {expandedMonths[month] && (
                <div className="px-5 py-2">
                  {items.map((item, idx) => {
                    // Determine icon and styling based on type
                    let IconComponent = Circle;
                    let iconBgColor = 'bg-[#c9983a]/50';
                    let labelPrefix = '';
                    
                    if (item.type === 'pr') {
                      IconComponent = GitPullRequest;
                      iconBgColor = 'bg-[#d4af37]/50';
                      labelPrefix = '';
                    } else if (item.type === 'review') {
                      IconComponent = null; // No icon for reviews
                      iconBgColor = '';
                      labelPrefix = 'Review: ';
                    } else if (item.type === 'issue') {
                      IconComponent = Circle;
                      iconBgColor = 'bg-[#c9983a]/50';
                      labelPrefix = '';
                    }

                    return (
                      <div key={item.id} className="relative">
                        {/* Vertical Line on Left */}
                        {idx < items.length - 1 && (
                          <div className="absolute left-[20px] top-[36px] bottom-[-8px] w-[2px] bg-gradient-to-b from-white/25 to-white/8" />
                        )}

                        <div className="flex items-center gap-4 py-2.5 hover:bg-white/[0.08] -mx-2 px-2 rounded-lg transition-all cursor-pointer group/item">
                          {/* Icon + Number Badge (only for issues and PRs) */}
                          {item.type !== 'review' && IconComponent && (
                            <div className="relative z-10 flex items-center gap-2.5 flex-shrink-0">
                              {/* Icon Circle */}
                              <div className={`w-10 h-10 rounded-full ${iconBgColor} shadow-[0_4px_16px_rgba(0,0,0,0.3)] flex items-center justify-center group-hover/item:scale-110 group-hover/item:shadow-[0_5px_20px_rgba(0,0,0,0.4)] transition-all duration-200`}>
                                <IconComponent 
                                  className="w-5 h-5 text-white group-hover/item:scale-110 transition-transform" 
                                  fill={item.type === 'issue' ? 'white' : 'none'}
                                  strokeWidth={item.type === 'issue' ? 0 : 3}
                                />
                              </div>
                              
                              {/* Number Badge */}
                              <div className={`px-3.5 py-1.5 rounded-[6px] ${iconBgColor} shadow-[0_3px_10px_rgba(0,0,0,0.25)]`}>
                                <span className="text-[14px] font-bold text-white">
                                  {item.number}
                                </span>
                              </div>
                            </div>
                          )}

                          {/* Review label without icon */}
                          {item.type === 'review' && (
                            <div className="relative z-10 flex-shrink-0 w-[120px]">
                              <span className={`text-[15px] font-semibold transition-colors ${
                                theme === 'dark' ? 'text-[#f5f5f5]' : 'text-[#2d2820]'
                              }`}>
                                Review:
                              </span>
                            </div>
                          )}

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <h4 className={`text-[15px] font-medium transition-colors ${
                              theme === 'dark' ? 'text-[#f5f5f5] group-hover/item:text-[#d4d4d4]' : 'text-[#2d2820] group-hover/item:text-[#4a3f2f]'
                            }`}>
                              {labelPrefix}{item.title}
                            </h4>
                          </div>

                          {/* Date */}
                          <span className={`text-[13px] font-medium whitespace-nowrap flex-shrink-0 transition-colors ${
                            theme === 'dark' ? 'text-[#d4d4d4]' : 'text-[#7a6b5a]'
                          }`}>
                            {item.date}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
