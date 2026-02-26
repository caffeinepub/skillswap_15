import React, { useState } from 'react';
import { useGetUserProfile, useGetAverageRating, useGetMyExchangeRequests, useSendExchangeRequest } from '../hooks/useQueries';
import { useGetCallerUserProfile } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { detectMatch } from '../utils/matchDetection';
import ReviewsList from './ReviewsList';
import RatingModal from './RatingModal';
import { Star, Sparkles, BookOpen, Zap, Send, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from '@tanstack/react-router';
import type { Principal } from '@icp-sdk/core/principal';

interface UserProfileViewProps {
  principalStr: string;
}

export default function UserProfileView({ principalStr }: UserProfileViewProps) {
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;
  const isOwnProfile = identity?.getPrincipal().toString() === principalStr;

  const { data: profile, isLoading } = useGetUserProfile(principalStr);
  const { data: myProfile } = useGetCallerUserProfile();
  const { data: avgRating } = useGetAverageRating(principalStr);
  const { data: myRequests } = useGetMyExchangeRequests();
  const sendRequest = useSendExchangeRequest();
  const navigate = useNavigate();

  const [selectedMatchIdx, setSelectedMatchIdx] = useState<string>('0');
  const [ratingModalOpen, setRatingModalOpen] = useState(false);

  const matches = detectMatch(myProfile, profile);
  const hasMatch = matches.length > 0;

  // Check if there's already a pending request
  const hasPendingRequest = myRequests?.some(
    (r) => r.from.toString() === identity?.getPrincipal().toString() &&
           r.to.toString() === principalStr
  );

  // Check if there's an accepted exchange (we check via exchange requests accepted)
  const hasAcceptedExchange = myRequests?.some(
    (r) =>
      (r.from.toString() === principalStr || r.to.toString() === principalStr)
  );

  const handleSendRequest = async () => {
    if (!identity || matches.length === 0) return;
    const match = matches[parseInt(selectedMatchIdx, 10)];
    if (!match) return;

    try {
      const { Principal } = await import('@icp-sdk/core/principal');
      await sendRequest.mutateAsync({
        toUser: Principal.fromText(principalStr),
        fromOfferedSkill: match.viewerOfferedSkill,
        fromWantedSkill: match.viewerWantedSkill,
      });
      toast.success('Exchange request sent!');
    } catch (err: any) {
      toast.error(err?.message ?? 'Failed to send request');
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 sm:px-6 py-10 max-w-3xl space-y-6">
        <Card className="shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <Skeleton className="w-16 h-16 rounded-2xl" />
              <div className="space-y-2">
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-4 w-60" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container mx-auto px-4 sm:px-6 py-10 max-w-3xl text-center">
        <p className="text-muted-foreground">User not found.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 py-10 max-w-3xl space-y-6">
      {/* Match Banner */}
      {isAuthenticated && !isOwnProfile && hasMatch && (
        <div className="match-glow rounded-2xl bg-primary/5 border border-primary/30 p-4 flex items-start gap-3 animate-fade-in">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
            <Zap className="w-4 h-4 text-primary" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-primary text-sm">Skill Match Found!</p>
            <p className="text-sm text-muted-foreground mt-0.5">
              You and {profile.name} have complementary skills — you can exchange knowledge!
            </p>
            <div className="flex flex-wrap gap-2 mt-2">
              {matches.map((m, i) => (
                <span key={i} className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full border border-primary/20">
                  {m.viewerOfferedSkill} ↔ {m.viewerWantedSkill}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Profile Header */}
      <Card className="shadow-card border-border">
        <CardContent className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <span className="text-primary font-display font-bold text-2xl">
                  {profile.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="font-display text-2xl font-semibold text-foreground">{profile.name}</h1>
                  {hasMatch && !isOwnProfile && (
                    <Badge className="bg-primary/10 text-primary border-primary/20 text-xs">
                      <Zap className="w-3 h-3 mr-1" />
                      Match
                    </Badge>
                  )}
                </div>
                {/* Average rating */}
                {avgRating !== null && avgRating !== undefined && (
                  <div className="flex items-center gap-1 mt-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3.5 h-3.5 ${i < Math.round(avgRating) ? 'text-primary fill-primary' : 'text-muted-foreground'}`}
                      />
                    ))}
                    <span className="text-xs text-muted-foreground ml-1">{avgRating.toFixed(1)}</span>
                  </div>
                )}
                {profile.bio && (
                  <p className="text-muted-foreground mt-2 leading-relaxed max-w-lg">{profile.bio}</p>
                )}
              </div>
            </div>
          </div>

          {/* Action buttons */}
          {isAuthenticated && !isOwnProfile && (
            <div className="mt-4 pt-4 border-t border-border flex flex-wrap gap-2">
              {hasMatch && (
                <div className="flex items-center gap-2 flex-wrap">
                  {matches.length > 1 && (
                    <Select value={selectedMatchIdx} onValueChange={setSelectedMatchIdx}>
                      <SelectTrigger className="h-9 text-sm w-auto min-w-[200px]">
                        <SelectValue placeholder="Select skill pair" />
                      </SelectTrigger>
                      <SelectContent>
                        {matches.map((m, i) => (
                          <SelectItem key={i} value={String(i)}>
                            {m.viewerOfferedSkill} ↔ {m.viewerWantedSkill}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                  <Button
                    onClick={handleSendRequest}
                    disabled={sendRequest.isPending || hasPendingRequest}
                    size="sm"
                    className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
                  >
                    {sendRequest.isPending ? (
                      <span className="w-3 h-3 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    ) : (
                      <Send className="w-3.5 h-3.5" />
                    )}
                    {hasPendingRequest ? 'Request Sent' : 'Send Exchange Request'}
                  </Button>
                </div>
              )}
              {hasAcceptedExchange && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate({ to: `/messages/${principalStr}` })}
                    className="gap-2 border-secondary/30 text-secondary hover:bg-secondary/10"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    Message
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setRatingModalOpen(true)}
                    className="gap-2 border-border hover:bg-accent/50"
                  >
                    <Star className="w-3.5 h-3.5" />
                    Leave Review
                  </Button>
                </>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Offered Skills */}
      <Card className="shadow-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Sparkles className="w-5 h-5 text-primary" />
            Skills {isOwnProfile ? 'I' : profile.name.split(' ')[0]} Can Teach
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {profile.offeredSkills.length === 0 ? (
            <p className="text-muted-foreground text-sm">No skills listed.</p>
          ) : (
            <div className="space-y-2">
              {profile.offeredSkills.map((skill) => (
                <div key={skill.name} className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border/50">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                    <div>
                      <span className="font-medium text-sm">{skill.name}</span>
                      {skill.description && (
                        <p className="text-xs text-muted-foreground mt-0.5">{skill.description}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">{skill.category}</Badge>
                    <span className="text-xs text-muted-foreground">
                      {['', 'Novice', 'Beginner', 'Intermediate', 'Advanced', 'Expert'][Number(skill.proficiency)] ?? ''}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Wanted Skills */}
      <Card className="shadow-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <BookOpen className="w-5 h-5 text-secondary" />
            Skills {isOwnProfile ? 'I' : profile.name.split(' ')[0]} Want to Learn
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {profile.wantedSkills.length === 0 ? (
            <p className="text-muted-foreground text-sm">No skills listed.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {profile.wantedSkills.map((skill) => (
                <span key={skill.name} className="skill-tag-secondary">
                  {skill.name}
                  <Badge variant="outline" className="text-xs ml-1 border-secondary/20">{skill.category}</Badge>
                </span>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Reviews */}
      <ReviewsList principalStr={principalStr} />

      {/* Rating Modal */}
      {ratingModalOpen && (
        <RatingModal
          open={ratingModalOpen}
          onClose={() => setRatingModalOpen(false)}
          targetPrincipalStr={principalStr}
          targetName={profile.name}
        />
      )}
    </div>
  );
}
