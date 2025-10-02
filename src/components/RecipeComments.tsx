import React, { useState } from 'react';
import { Card, Form, Button, Alert } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import type { RecipeComment } from '../types/recipe';

interface RecipeCommentsProps {
  recipeId: number;
  comments: RecipeComment[];
  onAddComment?: (content: string) => void;
}

export default function RecipeComments({
  comments,
  onAddComment,
}: RecipeCommentsProps) {
  const { isAuthenticated } = useAuth();
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !isAuthenticated) return;

    setIsSubmitting(true);
    try {
      await onAddComment?.(newComment.trim());
      setNewComment('');
    } catch (error) {
      console.error('Failed to add comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="mt-4">
      <Card.Header>
        <h5 className="mb-0">Comments ({comments.length})</h5>
      </Card.Header>
      <Card.Body>
        {isAuthenticated ? (
          <Form onSubmit={handleSubmit} className="mb-4">
            <Form.Group>
              <Form.Label>Add Comment</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Share your thoughts about this recipe..."
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
                disabled={isSubmitting}
              />
            </Form.Group>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={!newComment.trim() || isSubmitting}
              className="post-comment-button"
            >
              {isSubmitting ? 'Posting...' : 'Post Comment'}
            </Button>
          </Form>
        ) : (
          <Alert variant="info" className="mb-4">
            Please log in to post comments
          </Alert>
        )}

        {comments.length === 0 ? (
          <p className="text-muted">
            No comments yet. Be the first to comment!
          </p>
        ) : (
          <div className="space-y-3">
            {comments.map(comment => (
              <div key={comment.id} className="border-bottom pb-3 mb-3">
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <strong>{comment.userName}</strong>
                  <small className="text-muted">
                    {new Date(comment.createdAt).toLocaleDateString('zh-CN')}
                  </small>
                </div>
                <p className="mb-0 comment-content">
                  {comment.content}
                </p>
              </div>
            ))}
          </div>
        )}
      </Card.Body>
    </Card>
  );
}
