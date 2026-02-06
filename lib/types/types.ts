export interface StatData {
  obtainedMarks?: number;
  totalMarks?: number;
  accuracy?: number;
  correct?: number;
  incorrect?: number;
  unattempted?: number;
}

export interface LeaderboardEntry {
  userId: string;
  username: string;
  rank: number;
  obtainedMarks: number;
  accuracy: number;
  timeSpent: number;
  percentile: string;
  isCurrentUser: boolean;
}

export interface ReviewPattern {
  answeredAndMarked?: number;
  incorrectMarkedCount?: number;
  markedNotAnswered?: number;
}

export interface PageProps {
  params: { slug?: string }; // Adjust based on your folder structure [id]
  searchParams: { [key: string]: string | string[] | undefined };
}