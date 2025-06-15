
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Review {
  id: string;
  name: string;
  rating: number;
  comment: string;
  created_at: string;
}

export const ReviewSection = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [newReview, setNewReview] = useState({
    name: "",
    rating: 0,
    comment: ""
  });
  
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  // Load reviews from database
  useEffect(() => {
    const loadReviews = async () => {
      try {
        const { data, error } = await supabase
          .from('reviews')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error loading reviews:', error);
          toast({
            title: "Error loading reviews",
            description: "Please try refreshing the page.",
            variant: "destructive",
          });
          return;
        }

        setReviews(data || []);
      } catch (error) {
        console.error('Error loading reviews:', error);
      } finally {
        setLoading(false);
      }
    };

    loadReviews();
  }, [toast]);

  // Set up real-time subscription for new reviews
  useEffect(() => {
    const channel = supabase
      .channel('reviews-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'reviews'
        },
        (payload) => {
          console.log('New review added:', payload.new);
          setReviews(prev => [payload.new as Review, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleSubmitReview = async () => {
    if (!newReview.name.trim() || newReview.rating === 0) {
      toast({
        title: "Missing Information",
        description: "Please provide your name and rating.",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);

    try {
      const { data, error } = await supabase
        .from('reviews')
        .insert([
          {
            name: newReview.name.trim(),
            rating: newReview.rating,
            comment: newReview.comment.trim() || null
          }
        ])
        .select()
        .single();

      if (error) {
        console.error('Error submitting review:', error);
        toast({
          title: "Error submitting review",
          description: "Please try again later.",
          variant: "destructive",
        });
        return;
      }

      console.log('Review submitted successfully:', data);
      setNewReview({ name: "", rating: 0, comment: "" });
      setShowForm(false);

      toast({
        title: "Review Submitted!",
        description: "Thank you for your feedback!",
      });
    } catch (error) {
      console.error('Error submitting review:', error);
      toast({
        title: "Error submitting review",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const StarRating = ({ rating, onRatingChange, interactive = false }: { 
    rating: number; 
    onRatingChange?: (rating: number) => void;
    interactive?: boolean;
  }) => {
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-5 h-5 ${
              star <= rating 
                ? 'text-yellow-400 fill-yellow-400' 
                : 'text-gray-300'
            } ${interactive ? 'cursor-pointer hover:text-yellow-400 transition-colors' : ''}`}
            onClick={() => interactive && onRatingChange && onRatingChange(star)}
          />
        ))}
      </div>
    );
  };

  const averageRating = reviews.length > 0 
    ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)
    : 0;

  if (loading) {
    return (
      <Card className="p-4 sm:p-6 bg-white/70 backdrop-blur-sm border-slate-200/50 shadow-xl">
        <div className="text-center py-8">
          <p className="text-slate-600">Loading reviews...</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4 sm:p-6 bg-white/70 backdrop-blur-sm border-slate-200/50 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">User Reviews</h2>
          {reviews.length > 0 ? (
            <div className="flex items-center space-x-2 mt-1">
              <StarRating rating={Math.round(Number(averageRating))} />
              <span className="text-sm text-slate-600">
                {averageRating}/5 ({reviews.length} review{reviews.length !== 1 ? 's' : ''})
              </span>
            </div>
          ) : (
            <p className="text-sm text-slate-500 mt-1">No reviews yet. Be the first to review!</p>
          )}
        </div>
        
        {!showForm && (
          <Button 
            onClick={() => setShowForm(true)}
            variant="outline"
            size="sm"
          >
            Add Review
          </Button>
        )}
      </div>

      {showForm && (
        <div className="mb-6 p-4 bg-slate-50 rounded-lg">
          <h3 className="font-semibold text-slate-900 mb-3">Share Your Experience</h3>
          
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Your Name
              </label>
              <Input
                value={newReview.name}
                onChange={(e) => setNewReview(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter your name"
                className="w-full"
                disabled={submitting}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Rating
              </label>
              <StarRating 
                rating={newReview.rating} 
                onRatingChange={(rating) => setNewReview(prev => ({ ...prev, rating }))}
                interactive={!submitting}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Comment (Optional)
              </label>
              <Textarea
                value={newReview.comment}
                onChange={(e) => setNewReview(prev => ({ ...prev, comment: e.target.value }))}
                placeholder="Share your thoughts about VideoIQ..."
                className="w-full"
                rows={3}
                disabled={submitting}
              />
            </div>
            
            <div className="flex space-x-2">
              <Button 
                onClick={handleSubmitReview} 
                size="sm"
                disabled={submitting}
              >
                {submitting ? "Submitting..." : "Submit Review"}
              </Button>
              <Button 
                onClick={() => {
                  setShowForm(false);
                  setNewReview({ name: "", rating: 0, comment: "" });
                }}
                variant="outline"
                size="sm"
                disabled={submitting}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {reviews.length > 0 && (
        <div className="space-y-4 max-h-64 overflow-y-auto">
          {reviews.map((review) => (
            <div key={review.id} className="border-l-4 border-blue-200 pl-4 py-2">
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium text-slate-900">{review.name}</span>
                <StarRating rating={review.rating} />
              </div>
              {review.comment && (
                <p className="text-sm text-slate-600 mb-1">{review.comment}</p>
              )}
              <p className="text-xs text-slate-400">
                {new Date(review.created_at).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};
