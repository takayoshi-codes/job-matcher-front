export interface JobInput {
  title: string;
  required_skills: string[];
  preferred_skills: string[];
  description: string;
}

export interface CareerInput {
  name: string;
  skills: string;
  summary_consulting: string;
  summary_management: string;
  summary_it: string;
  projects: string;
}

export interface MatchResult {
  score_sbert: number;
  score_w2v: number | null;
  missing_skills: string[];
  advice: string;
  job_suggestions: string;
}
