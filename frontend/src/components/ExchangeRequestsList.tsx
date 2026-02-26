import React from 'react';
import { useGetMyExchangeRequests, useAcceptExchangeRequest, useGetUserProfile } from '../hooks/useQueries';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Check, ArrowLeftRight, Clock } from 'lucide-react';
import { toast } from 'sonner';
import type { ExchangeRequest } from '../backend';

function RequestCard({ request, onAccept, isAccepting }: {
  request: ExchangeRequest;
  onAccept: () => void;
  isAccepting: boolean;
}) {
  const { data: senderProfile } = useGetUserProfile(request.from.toString());
  const date = new Date(Number(request.timestamp) / 1_000_000);

  return (
    <div className="p-4 rounded-xl border border-border bg-card shadow-xs space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <span className="text-primary font-semibold text-sm">
              {senderProfile?.name?.charAt(0)?.toUpperCase() ?? '?'}
            </span>
          </div>
          <div>
            <p className="font-medium text-sm text-foreground">
              {senderProfile?.name ?? request.from.toString().slice(0, 12) + '...'}
            </p>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
              <Clock className="w-3 h-3" />
              {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </p>
          </div>
        </div>
        <Badge variant="outline" className="text-xs border-primary/20 text-primary bg-primary/5 flex-shrink-0">
          Pending
        </Badge>
      </div>

      {/* Skill exchange */}
      <div className="flex items-center gap-2 bg-muted/30 rounded-lg p-2.5">
        <span className="skill-tag-primary text-xs">{request.fromOfferedSkill}</span>
        <ArrowLeftRight className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
        <span className="skill-tag-secondary text-xs">{request.fromWantedSkill}</span>
      </div>

      <Button
        onClick={onAccept}
        disabled={isAccepting}
        size="sm"
        className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground gap-2"
      >
        {isAccepting ? (
          <span className="w-3 h-3 border-2 border-secondary-foreground/30 border-t-secondary-foreground rounded-full animate-spin" />
        ) : (
          <Check className="w-3.5 h-3.5" />
        )}
        Accept Exchange
      </Button>
    </div>
  );
}

export default function ExchangeRequestsList() {
  const { data: requests, isLoading } = useGetMyExchangeRequests();
  const acceptRequest = useAcceptExchangeRequest();

  const handleAccept = async (fromPrincipal: any) => {
    try {
      await acceptRequest.mutateAsync(fromPrincipal);
      toast.success('Exchange accepted! You can now message each other.');
    } catch (err: any) {
      toast.error(err?.message ?? 'Failed to accept request');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2].map((i) => (
          <Skeleton key={i} className="h-28 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (!requests || requests.length === 0) {
    return (
      <p className="text-muted-foreground text-sm py-4 text-center">
        No pending exchange requests.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {requests.map((req, idx) => (
        <RequestCard
          key={idx}
          request={req}
          onAccept={() => handleAccept(req.from)}
          isAccepting={acceptRequest.isPending}
        />
      ))}
    </div>
  );
}
