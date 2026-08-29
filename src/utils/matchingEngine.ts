export interface CandidateProfile {
  id: string;
  name: string;
  title: string;
  skills: string[];
  experienceYears: number;
  city: string;
  education: string;
}

export interface JobRequirement {
  id: string;
  title: string;
  requiredSkills: string[];
  minExperience: number;
  city: string;
  jobType: string;
}

export interface MatchResult {
  candidateId: string;
  jobId: string;
  score: number; // 0 - 100%
  breakdown: {
    titleMatch: number;
    skillsMatch: number;
    experienceMatch: number;
    cityMatch: number;
  };
}

export function calculateYRMatch(candidate: CandidateProfile, job: JobRequirement): MatchResult {
  // 1. مطابقة المسمى الوظيفي (35%)
  const titleScore = candidate.title.toLowerCase().includes(job.title.toLowerCase()) || 
                     job.title.toLowerCase().includes(candidate.title.toLowerCase()) ? 35 : 10;

  // 2. مطابقة المهارات (35%)
  const matchedSkills = candidate.skills.filter(s => 
    job.requiredSkills.some(req => req.toLowerCase() === s.toLowerCase())
  );
  const skillsScore = job.requiredSkills.length > 0 
    ? (matchedSkills.length / job.requiredSkills.length) * 35 
    : 35;

  // 3. مطابقة سنوات الخبرة (15%)
  const expScore = candidate.experienceYears >= job.minExperience ? 15 : (candidate.experienceYears / Math.max(job.minExperience, 1)) * 15;

  // 4. مطابقة المدينة (15%)
  const cityScore = candidate.city.toLowerCase() === job.city.toLowerCase() ? 15 : 0;

  const totalScore = Math.min(100, Math.round(titleScore + skillsScore + expScore + cityScore));

  return {
    candidateId: candidate.id,
    jobId: job.id,
    score: totalScore,
    breakdown: {
      titleMatch: Math.round(titleScore),
      skillsMatch: Math.round(skillsScore),
      experienceMatch: Math.round(expScore),
      cityMatch: Math.round(cityScore),
    }
  };
}
