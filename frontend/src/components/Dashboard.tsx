import React, { useState } from 'react';
import { useGetMyExchangeRequests, useGetUserProfile } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import ExchangeRequestsList from './ExchangeRequestsList';
import RatingModal from './RatingModal';
import { MessageSquare, Star, ArrowLeftRight, Users, Inbox, CheckCircle2 } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import { useGetCallerUserProfile } from '../hooks/useQueries';
import type { ExchangeRequest } from '../backend';

function ActiveExchangeCard({
  request,
  currentPrincipal,
}: {
  request: ExchangeRequest;
  currentPrincipal: string;
}) {
  const isFrom = request.from.toString() === currentPrincipal;
  const otherPrincipal = isFrom ? request.to.toString() : request.from.toString();
  const { data: otherProfile } = useGetUserProfile(otherPrincipal);
  const navigate = useNavigate();
  const [ratingOpen, setRatingOpen] = useState(false);

  return (
    <div className="p-4 rounded-xl border border-border bg-card shadow-xs space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-secondary/10 flex items-center justify-center flex-shrink-0">
            <span className="text-secondary font-semibold text-sm">
              {otherProfile?.name?.charAt(0)?.toUpperCase() ?? '?'}
            </span>
          </div>
          <div>
            <p className="font-medium text-sm text-foreground">
              {otherProfile?.name ?? otherPrincipal.slice(0, 12) + '...'}
            </p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-xs text-primary font-medium">{isFrom ? request.fromOfferedSkill : request.toOfferedSkill}</span>
              <ArrowLeftRight className="w-3 h-3 text-muted-foreground" />
              <span className="text-xs text-secondary font-medium">{isFrom ? request.fromWantedSkill : request.toWantedSkill}</span>
            </div>
          </div>
        </div>
        <Badge className="bg-secondary/10 text-secondary border-secondary/20 text-xs flex-shrink-0">
          <CheckCircle2 className="w-3 h-3 mr-1" />
          Active
        </Badge>
      </div>

      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate({ to: `/messages/${otherPrincipal}` })}
          className="flex-1 gap-1.5 border-secondary/20 text-secondary hover:bg-secondary/10"
        >
          <MessageSquare className="w-3.5 h-3.5" />
          Messages
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setRatingOpen(true)}
          className="flex-1 gap-1.5 border-border hover:bg-accent/50"
        >
          <Star className="w-3.5 h-3.5" />
          Review
        </Button>
      </div>

      {ratingOpen && otherProfile && (
        <RatingModal
          open={ratingOpen}
          onClose={() => setRatingOpen(false)}
          targetPrincipalStr={otherPrincipal}
          targetName={otherProfile.name}
        />
      )}
    </div>
  );
}

export default function Dashboard() {
  const { identity } = useInternetIdentity();
  const { data: myProfile } = useGetCallerUserProfile();
  const { data: requests, isLoading } = useGetMyExchangeRequests();
  const navigate = useNavigate();

  const currentPrincipal = identity?.getPrincipal().toString() ?? '';

  // Separate accepted (those where the current user is the recipient and accepted)
  // We detect accepted by checking if there's a request where the current user is the recipient
  // The backend marks accepted matches separately, but we can show all requests as "pending"
  // and accepted ones are those that have been accepted (we don't have a direct status field)
  // For now, show all requests as pending (user can accept them)
  const pendingRequests = requests ?? [];

  if (!identity) {
    return (
      <div className="container mx-auto px-4 sm:px-6 py-16 text-center">
        <div className="max-w-md mx-auto space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
            <Users className="w-8 h-8 text-primary" />
          </div>
          <h2 className="font-display text-2xl font-semibold text-foreground">Sign in to view your dashboard</h2>
          <p className="text-muted-foreground">Track your skill exchanges, messages, and reviews all in one place.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 py-10 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground">
          Welcome back{myProfile?.name ? `, ${myProfile.name.split(' ')[0]}` : ''}!
        </h1>
        <p className="text-muted-foreground mt-1">Manage your skill exchanges and connections.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Pending Requests */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Inbox className="w-5 h-5 text-primary" />
            <h2 className="font-display text-xl font-semibold text-foreground">Incoming Requests</h2>
            {pendingRequests.length > 0 && (
              <Badge className="bg-primary/10 text-primary border-primary/20 text-xs">
                {pendingRequests.length}
              </Badge>
            )}
          </div>
          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-28 w-full rounded-xl" />
              <Skeleton className="h-28 w-full rounded-xl" />
            </div>
          ) : (
            <ExchangeRequestsList />
          )}
        </div>

        {/* Active Exchanges */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-secondary" />
            <h2 className="font-display text-xl font-semibold text-foreground">Active Exchanges</h2>
          </div>
          <div className="space-y-3">
            {isLoading ? (
              <Skeleton className="h-28 w-full rounded-xl" />
            ) : pendingRequests.length === 0 ? (
              <div className="text-center py-8 px-4 rounded-xl border border-dashed border-border">
                <CheckCircle2 className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground text-sm">No active exchanges yet.</p>
                <Button
                  variant="link"
                  size="sm"
                  onClick={() => navigate({ to: '/directory' })}
                  className="text-primary mt-1"
                >
                  Find people to exchange with →
                </Button>
              </div>
            ) : (
              pendingRequests.map((req, idx) => (
                <ActiveExchangeCard
                  key={idx}
                  request={req}
                  currentPrincipal={currentPrincipal}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
