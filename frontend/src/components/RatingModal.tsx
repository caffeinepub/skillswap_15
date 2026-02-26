import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useLeaveRating } from '../hooks/useQueries';
import { Star } from 'lucide-react';
import { toast } from 'sonner';

interface RatingModalProps {
  open: boolean;
  onClose: () => void;
  targetPrincipalStr: string;
  targetName: string;
}

export default function RatingModal({ open, onClose, targetPrincipalStr, targetName }: RatingModalProps) {
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [review, setReview] = useState('');
  const leaveRating = useLeaveRating();

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }
    try {
      const { Principal } = await import('@icp-sdk/core/principal');
      await leaveRating.mutateAsync({
        toUser: Principal.fromText(targetPrincipalStr),
        rating: BigInt(rating),
        review: review.trim(),
      });
      toast.success('Review submitted!');
      onClose();
    } catch (err: any) {
      toast.error(err?.message ?? 'Failed to submit review');
    }
  };

  const displayRating = hovered || rating;

  const ratingLabels = ['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent'];

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">Leave a Review</DialogTitle>
          <DialogDescription>
            Share your experience exchanging skills with {targetName}.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Star rating */}
          <div>
            <Label className="text-sm font-medium mb-3 block">Your Rating *</Label>
            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    onMouseEnter={() => setHovered(n)}
                    onMouseLeave={() => setHovered(0)}
                    onClick={() => setRating(n)}
                    className="transition-transform hover:scale-110"
                  >
                    <Star
                      className={`w-8 h-8 transition-colors ${
                        n <= displayRating
                          ? 'text-primary fill-primary'
                          : 'text-muted-foreground'
                      }`}
                    />
                  </button>
                ))}
              </div>
              {displayRating > 0 && (
                <span className="text-sm font-medium text-primary ml-1">
                  {ratingLabels[displayRating]}
                </span>
              )}
            </div>
          </div>

          {/* Review text */}
          <div>
            <Label htmlFor="review-text" className="text-sm font-medium mb-1.5 block">
              Review <span className="text-muted-foreground font-normal">(optional)</span>
            </Label>
            <Textarea
              id="review-text"
              value={review}
              onChange={(e) => setReview(e.target.value)}
              placeholder={`How was your skill exchange with ${targetName}?`}
              className="resize-none"
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={leaveRating.isPending || rating === 0}
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            {leaveRating.isPending ? (
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                Submitting...
              </span>
            ) : (
              'Submit Review'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
