export type Platform = 'all' | 'reddit' | 'twitter';

export type LeadStatus = 'new' | 'contacted' | 'saved' | 'ignored';

export interface Lead {
  id: string;
  platform: 'reddit' | 'twitter';
  author: string;
  authorAvatar: string;
  title: string;
  content: string;
  url: string;
  subreddit?: string;
  handle?: string;
  timestamp: number;
  matchedKeywords: string[];
  ups?: number;
  comments?: number;
  retweets?: number;
  likes?: number;
  status: LeadStatus;
  userNotes?: string;
}

export interface ReplyTemplate {
  id: string;
  name: string;
  content: string;
}

export interface UserConfig {
  myAppLink: string;
  myGroupLink: string;
  autoRefreshEnabled: boolean;
  refreshIntervalSeconds: number; // e.g. 30, 60, 300
  soundAlertsEnabled: boolean;
  twitterBearerToken?: string;
  geminiApiKey?: string;
}

export interface ScrapeFilter {
  platform: Platform;
  keywords: string[];
  searchQuery: string;
  statusFilter: 'all' | LeadStatus;
  sortBy: 'newest' | 'oldest' | 'engagement';
}
