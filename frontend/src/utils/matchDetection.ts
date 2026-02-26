import type { UserProfile } from '../backend';

export interface SkillMatch {
  viewerOfferedSkill: string;
  viewerWantedSkill: string;
  targetOfferedSkill: string;
  targetWantedSkill: string;
}

/**
 * Detects complementary skill pairs between two users.
 * A match exists when:
 * - viewer offers something target wants AND
 * - target offers something viewer wants
 */
export function detectMatch(
  viewerProfile: UserProfile | null | undefined,
  targetProfile: UserProfile | null | undefined
): SkillMatch[] {
  if (!viewerProfile || !targetProfile) return [];

  const matches: SkillMatch[] = [];

  for (const viewerOffered of viewerProfile.offeredSkills) {
    for (const viewerWanted of viewerProfile.wantedSkills) {
      // Check if target offers what viewer wants AND target wants what viewer offers
      const targetOffersViewerWanted = targetProfile.offeredSkills.some(
        (s) => s.name.toLowerCase() === viewerWanted.name.toLowerCase()
      );
      const targetWantsViewerOffered = targetProfile.wantedSkills.some(
        (s) => s.name.toLowerCase() === viewerOffered.name.toLowerCase()
      );

      if (targetOffersViewerWanted && targetWantsViewerOffered) {
        matches.push({
          viewerOfferedSkill: viewerOffered.name,
          viewerWantedSkill: viewerWanted.name,
          targetOfferedSkill: viewerWanted.name,
          targetWantedSkill: viewerOffered.name,
        });
      }
    }
  }

  return matches;
}
