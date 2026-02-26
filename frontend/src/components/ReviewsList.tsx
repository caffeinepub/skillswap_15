import React from 'react';
import { useGetUserRatings, useGetUserProfile } from '../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Star, MessageSquare } from 'lucide-react';
import type { Rating } from '../backend';

interface ReviewsListProps {
  principalStr: string;
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`w-3.5 h-3.5 ${i < rating ? 'text-primary fill-primary' : 'text-muted-foreground'}`}
        />
      ))}
    </div>
  );
}

function ReviewCard({ review }: { review: Rating }) {
  const { data: reviewerProfile } = useGetUserProfile(review.from.toString());
  const date = new Date(Number(review.timestamp) / 1_000_000);

  return (
    <div className="p-4 rounded-xl bg-muted/20 border border-border/50 space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-secondary/10 flex items-center justify-center">
            <span className="text-secondary text-xs font-semibold">
              {reviewerProfile?.name?.charAt(0)?.toUpperCase() ?? '?'}
            </span>
          </div>
          <span className="text-sm font-medium text-foreground">
            {reviewerProfile?.name ?? 'Anonymous'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <StarRating rating={Number(review.rating)} />
          <span className="text-xs text-muted-foreground">
            {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
        </div>
      </div>
      {review.review && (
        <p className="text-sm text-muted-foreground leading-relaxed pl-9">{review.review}</p>
      )}
    </div>
  );
}

export default function ReviewsList({ principalStr }: ReviewsListProps) {
  const { data: ratings, isLoading } = useGetUserRatings(principalStr);

  if (isLoading) {
    return (
      <Card className="shadow-card border-border">
        <CardHeader className="pb-3">
          <Skeleton className="h-5 w-32" />
        </CardHeader>
        <CardContent className="pt-0 space-y-3">
          <Skeleton className="h-16 w-full rounded-xl" />
          <Skeleton className="h-16 w-full rounded-xl" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-card border-border">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <MessageSquare className="w-5 h-5 text-secondary" />
          Reviews ({ratings?.length ?? 0})
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {!ratings || ratings.length === 0 ? (
          <p className="text-muted-foreground text-sm">No reviews yet.</p>
        ) : (
          <div className="space-y-3">
            {ratings.map((review, idx) => (
              <ReviewCard key={idx} review={review} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
