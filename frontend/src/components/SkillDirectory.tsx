import React, { useState, useMemo } from 'react';
import { useGetAllProfiles } from '../hooks/useQueries';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, User, ArrowRight, BookOpen, Sparkles } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import type { UserProfile } from '../backend';
import type { Principal } from '@icp-sdk/core/principal';
import { useDebounce } from 'react-use';

export default function SkillDirectory() {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const { data: allProfiles, isLoading } = useGetAllProfiles();
  const navigate = useNavigate();

  useDebounce(() => setDebouncedSearch(searchTerm), 300, [searchTerm]);

  const filteredProfiles = useMemo(() => {
    if (!allProfiles) return [];
    if (!debouncedSearch.trim()) return allProfiles;

    const term = debouncedSearch.toLowerCase();
    return allProfiles.filter(([, profile]) =>
      profile.offeredSkills.some(
        (s) =>
          s.name.toLowerCase().includes(term) ||
          s.category.toLowerCase().includes(term) ||
          s.description.toLowerCase().includes(term)
      ) ||
      profile.name.toLowerCase().includes(term)
    );
  }, [allProfiles, debouncedSearch]);

  const proficiencyLabel = (p: bigint) => {
    const n = Number(p);
    if (n >= 5) return 'Expert';
    if (n >= 4) return 'Advanced';
    if (n >= 3) return 'Intermediate';
    if (n >= 2) return 'Beginner';
    return 'Novice';
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 py-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-2">
          Explore Skills
        </h1>
        <p className="text-muted-foreground text-lg">
          Discover talented people ready to share their knowledge with you.
        </p>
      </div>

      {/* Search */}
      <div className="relative mb-8 max-w-xl">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by skill, category, or name..."
          className="pl-10 h-11 rounded-xl border-border bg-card shadow-xs"
        />
      </div>

      {/* Results count */}
      {!isLoading && allProfiles && (
        <p className="text-sm text-muted-foreground mb-6">
          {debouncedSearch
            ? `${filteredProfiles.length} result${filteredProfiles.length !== 1 ? 's' : ''} for "${debouncedSearch}"`
            : `${allProfiles.length} member${allProfiles.length !== 1 ? 's' : ''} in the community`}
        </p>
      )}

      {/* Loading state */}
      {isLoading && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="shadow-card">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <Skeleton className="w-10 h-10 rounded-full" />
                  <div className="space-y-1.5">
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Skeleton className="h-3 w-full mb-2" />
                <Skeleton className="h-3 w-3/4 mb-4" />
                <div className="flex gap-2">
                  <Skeleton className="h-6 w-16 rounded-full" />
                  <Skeleton className="h-6 w-20 rounded-full" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && filteredProfiles.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <img
            src="/assets/generated/empty-search.dim_400x300.png"
            alt="No results found"
            className="w-64 h-48 object-contain mb-6 opacity-80"
          />
          <h3 className="font-display text-xl font-semibold text-foreground mb-2">
            {debouncedSearch ? 'No skills found' : 'No members yet'}
          </h3>
          <p className="text-muted-foreground max-w-sm">
            {debouncedSearch
              ? `We couldn't find anyone offering "${debouncedSearch}". Try a different search term.`
              : 'Be the first to join and share your skills with the community!'}
          </p>
          {debouncedSearch && (
            <Button
              variant="outline"
              onClick={() => setSearchTerm('')}
              className="mt-4"
            >
              Clear search
            </Button>
          )}
        </div>
      )}

      {/* Profile grid */}
      {!isLoading && filteredProfiles.length > 0 && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProfiles.map(([principal, profile]) => (
            <ProfileCard
              key={principal.toString()}
              principal={principal}
              profile={profile}
              searchTerm={debouncedSearch}
              onView={() => navigate({ to: `/profile/${principal.toString()}` })}
              proficiencyLabel={proficiencyLabel}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface ProfileCardProps {
  principal: Principal;
  profile: UserProfile;
  searchTerm: string;
  onView: () => void;
  proficiencyLabel: (p: bigint) => string;
}

function ProfileCard({ principal, profile, searchTerm, onView, proficiencyLabel }: ProfileCardProps) {
  const highlightMatch = (text: string) => {
    if (!searchTerm) return text;
    const idx = text.toLowerCase().indexOf(searchTerm.toLowerCase());
    if (idx === -1) return text;
    return (
      <>
        {text.slice(0, idx)}
        <mark className="bg-primary/20 text-primary rounded px-0.5">{text.slice(idx, idx + searchTerm.length)}</mark>
        {text.slice(idx + searchTerm.length)}
      </>
    );
  };

  return (
    <Card className="shadow-card hover:shadow-card-hover transition-all duration-200 hover:-translate-y-0.5 group cursor-pointer border-border"
      onClick={onView}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <span className="text-primary font-semibold text-sm">
                {profile.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h3 className="font-semibold text-foreground leading-tight">
                {highlightMatch(profile.name)}
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                {profile.offeredSkills.length} skill{profile.offeredSkills.length !== 1 ? 's' : ''} to share
              </p>
            </div>
          </div>
        </div>
        {profile.bio && (
          <p className="text-sm text-muted-foreground line-clamp-2 mt-2">{profile.bio}</p>
        )}
      </CardHeader>

      <CardContent className="pt-0 space-y-3">
        {/* Offered skills */}
        <div>
          <div className="flex items-center gap-1.5 mb-2">
            <Sparkles className="w-3 h-3 text-primary" />
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Can Teach</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {profile.offeredSkills.slice(0, 4).map((skill) => (
              <span key={skill.name} className="skill-tag">
                {highlightMatch(skill.name)}
                <span className="text-muted-foreground/60">· {proficiencyLabel(skill.proficiency)}</span>
              </span>
            ))}
            {profile.offeredSkills.length > 4 && (
              <span className="skill-tag text-muted-foreground">+{profile.offeredSkills.length - 4} more</span>
            )}
          </div>
        </div>

        {/* Wanted skills */}
        {profile.wantedSkills.length > 0 && (
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <BookOpen className="w-3 h-3 text-secondary" />
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Wants to Learn</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {profile.wantedSkills.slice(0, 3).map((skill) => (
                <span key={skill.name} className="skill-tag-secondary text-xs">
                  {skill.name}
                </span>
              ))}
              {profile.wantedSkills.length > 3 && (
                <span className="skill-tag text-muted-foreground">+{profile.wantedSkills.length - 3}</span>
              )}
            </div>
          </div>
        )}

        <Button
          variant="ghost"
          size="sm"
          className="w-full mt-1 text-primary hover:text-primary hover:bg-primary/10 group-hover:bg-primary/5 transition-colors"
          onClick={(e) => { e.stopPropagation(); onView(); }}
        >
          View Profile
          <ArrowRight className="w-3.5 h-3.5 ml-1.5 group-hover:translate-x-0.5 transition-transform" />
        </Button>
      </CardContent>
    </Card>
  );
}
