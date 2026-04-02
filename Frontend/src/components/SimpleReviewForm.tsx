import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from './ui/card';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Star, MessageSquare, Tag, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '#src/lib/utils';

/**
 * An improved Review Form component.
 * 
 * Key Improvements:
 * 1. Single State Object: Uses one object to manage all form fields.
 * 2. Generic Change Handler: Reduces boilerplate by using the `name` attribute.
 * 3. Enhanced UI: Utilizes project's UI components, Framer Motion, and Lucide icons.
 * 4. Interactive Rating: Replaced the select dropdown with a star rating system.
 * 5. Type Safety: Implemented with TypeScript.
 */
const SimpleReviewForm = () => {
  const [review, setReview] = useState({
    title: '',
    content: '',
    rating: 5,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Generic handler for input and textarea
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setReview((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Dedicated handler for numeric rating
  const handleRatingChange = (newRating: number) => {
    setReview((prev) => ({
      ...prev,
      rating: newRating,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    console.log('Submitting Review:', review);
    await new Promise((resolve) => setTimeout(resolve, 800));
    
    setIsSubmitting(false);
    alert('Review submitted successfully! (Check console for data)');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-md mx-auto p-4"
    >
      <Card className="border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl font-bold">
            <MessageSquare className="w-6 h-6 text-primary" />
            Leave a Review
          </CardTitle>
        </CardHeader>
        
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            {/* Rating Field */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Overall Rating</Label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <motion.button
                    key={star}
                    type="button"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleRatingChange(star)}
                    className="focus:outline-none"
                  >
                    <Star
                      className={cn(
                        "w-7 h-7 transition-colors",
                        star <= review.rating 
                          ? "fill-yellow-400 text-yellow-400" 
                          : "text-muted-foreground/30"
                      )}
                    />
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Title Field */}
            <div className="space-y-2">
              <Label htmlFor="title" className="flex items-center gap-2">
                <Tag className="w-4 h-4" />
                Review Title
              </Label>
              <Input
                id="title"
                name="title"
                placeholder="e.g., Amazing experience!"
                value={review.title}
                onChange={handleChange}
                required
                className="bg-muted/30 border-muted-foreground/20 focus-visible:ring-primary"
              />
            </div>

            {/* Content Field */}
            <div className="space-y-2">
              <Label htmlFor="content">Your Feedback</Label>
              <Textarea
                id="content"
                name="content"
                placeholder="Tell us what you liked (or didn't)..."
                value={review.content}
                onChange={handleChange}
                required
                className="min-h-[120px] bg-muted/30 border-muted-foreground/20 focus-visible:ring-primary resize-none"
              />
            </div>
          </CardContent>

          <CardFooter>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full group relative overflow-hidden"
            >
              <AnimatePresence mode="wait">
                {isSubmitting ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-2"
                  >
                    <div className="w-4 h-4 border-2 border-background border-t-transparent rounded-full animate-spin" />
                    Submitting...
                  </motion.div>
                ) : (
                  <motion.div
                    key="idle"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-2"
                  >
                    <Send className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    Submit Review
                  </motion.div>
                )}
              </AnimatePresence>
            </Button>
          </CardFooter>
        </form>
      </Card>
    </motion.div>
  );
};

export default SimpleReviewForm;
