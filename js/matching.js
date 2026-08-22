// ═══════════════════════════════════════════════════════════════
// YEMEN RATING — AI Smart Matching Engine (Production)
// ═══════════════════════════════════════════════════════════════

const AIMatchingEngine = {
  calculateMatchScore(candidate, job) {
    let score = 0;
    const reasons = [];

    // 1. مطابقة التخصص والمسمى الوظيفي (30%)
    if (candidate.specialty && job.title) {
      const candidateSpec = candidate.specialty.toLowerCase();
      const jobTitle = job.title.toLowerCase();
      if (jobTitle.includes(candidateSpec) || candidateSpec.includes(jobTitle)) {
        score += 30;
        reasons.push('تطابق مباشر في التخصص والمسمى الوظيفي');
      } else {
        score += 10;
        reasons.push('تقارب في المجال المهني العام');
      }
    }

    // 2. مطابقة المدينة وموقع العمل (25%)
    if (candidate.city && job.city) {
      if (candidate.city.trim() === job.city.trim()) {
        score += 25;
        reasons.push(`توافق موقع الإقامة والعمل في مدينة (${candidate.city})`);
      } else {
        reasons.push('موقع العمل في محافظة أخرى');
      }
    }

    // 3. مطابقة سنوات الخبرة (25%)
    const candExp = parseInt(candidate.experience_years || 0, 10);
    const reqExp = parseInt(job.experience || 0, 10);
    if (candExp >= reqExp) {
      score += 25;
      reasons.push(`الخبرة العملية (${candExp} سنوات) تلبي المتطلبات`);
    } else if (candExp > 0) {
      const ratio = (candExp / (reqExp || 1)) * 25;
      score += Math.round(ratio);
      reasons.push(`خبرة جزئية (${candExp} من ${reqExp} سنوات مطلوبة)`);
    }

    // 4. مطابقة المهارات (20%)
    if (candidate.skills && job.description) {
      const skillsList = Array.isArray(candidate.skills) 
        ? candidate.skills 
        : candidate.skills.split(/[,،\s]+/);
      let matches = 0;
      skillsList.forEach(skill => {
        if (skill.length > 2 && job.description.toLowerCase().includes(skill.toLowerCase())) {
          matches++;
        }
      });
      if (matches > 0) {
        const skillScore = Math.min(20, matches * 7);
        score += skillScore;
        reasons.push(`تطابق في ${matches} مهارات مهنية`);
      }
    }

    const finalScore = Math.min(100, Math.max(10, score));
    return {
      matchPercentage: finalScore,
      reasons: reasons,
      isHighMatch: finalScore >= 75
    };
  }
};

window.AIMatchingEngine = AIMatchingEngine;
