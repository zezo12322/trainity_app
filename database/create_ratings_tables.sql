-- =====================================================
-- Life Makers Pirates Training - Ratings System
-- =====================================================

-- Create training_ratings table for storing training evaluations and reviews
CREATE TABLE IF NOT EXISTS training_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  training_request_id UUID NOT NULL REFERENCES training_requests(id) ON DELETE CASCADE,
  trainer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  trainee_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  overall_rating INTEGER NOT NULL CHECK (overall_rating >= 1 AND overall_rating <= 5),
  content_quality INTEGER NOT NULL CHECK (content_quality >= 1 AND content_quality <= 5),
  delivery_quality INTEGER NOT NULL CHECK (delivery_quality >= 1 AND delivery_quality <= 5),
  interaction_quality INTEGER NOT NULL CHECK (interaction_quality >= 1 AND interaction_quality <= 5),
  organization_quality INTEGER NOT NULL CHECK (organization_quality >= 1 AND organization_quality <= 5),
  review_text TEXT,
  is_anonymous BOOLEAN DEFAULT FALSE,
  is_approved BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(training_request_id, trainee_id)
);

-- Add comments to the table
COMMENT ON TABLE training_ratings IS 'Stores training evaluations and reviews from trainees';
COMMENT ON COLUMN training_ratings.overall_rating IS 'Overall rating from 1-5 stars';
COMMENT ON COLUMN training_ratings.content_quality IS 'Content quality rating from 1-5 stars';
COMMENT ON COLUMN training_ratings.delivery_quality IS 'Delivery quality rating from 1-5 stars';
COMMENT ON COLUMN training_ratings.interaction_quality IS 'Interaction quality rating from 1-5 stars';
COMMENT ON COLUMN training_ratings.organization_quality IS 'Organization quality rating from 1-5 stars';
COMMENT ON COLUMN training_ratings.review_text IS 'Optional text review';
COMMENT ON COLUMN training_ratings.is_anonymous IS 'Whether the review is submitted anonymously';
COMMENT ON COLUMN training_ratings.is_approved IS 'Whether the review is approved for public display';

-- Create trainer_stats table for caching trainer statistics
CREATE TABLE IF NOT EXISTS trainer_stats (
  trainer_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  total_ratings INTEGER DEFAULT 0,
  average_overall_rating DECIMAL(3,2) DEFAULT 0,
  average_content_quality DECIMAL(3,2) DEFAULT 0,
  average_delivery_quality DECIMAL(3,2) DEFAULT 0,
  average_interaction_quality DECIMAL(3,2) DEFAULT 0,
  average_organization_quality DECIMAL(3,2) DEFAULT 0,
  total_trainings_completed INTEGER DEFAULT 0,
  total_hours_trained INTEGER DEFAULT 0,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_training_ratings_trainer_id ON training_ratings(trainer_id);
CREATE INDEX IF NOT EXISTS idx_training_ratings_trainee_id ON training_ratings(trainee_id);
CREATE INDEX IF NOT EXISTS idx_training_ratings_training_request_id ON training_ratings(training_request_id);
CREATE INDEX IF NOT EXISTS idx_training_ratings_created_at ON training_ratings(created_at);
CREATE INDEX IF NOT EXISTS idx_training_ratings_is_approved ON training_ratings(is_approved);

-- Create function to update trainer stats automatically
CREATE OR REPLACE FUNCTION update_trainer_stats(trainer_uuid UUID)
RETURNS VOID AS $$
BEGIN
  INSERT INTO trainer_stats (
    trainer_id,
    total_ratings,
    average_overall_rating,
    average_content_quality,
    average_delivery_quality,
    average_interaction_quality,
    average_organization_quality,
    total_trainings_completed,
    last_updated
  )
  SELECT
    trainer_uuid,
    COUNT(*),
    ROUND(AVG(overall_rating), 2),
    ROUND(AVG(content_quality), 2),
    ROUND(AVG(delivery_quality), 2),
    ROUND(AVG(interaction_quality), 2),
    ROUND(AVG(organization_quality), 2),
    COUNT(*),
    NOW()
  FROM training_ratings
  WHERE trainer_id = trainer_uuid AND is_approved = true
  ON CONFLICT (trainer_id)
  DO UPDATE SET
    total_ratings = EXCLUDED.total_ratings,
    average_overall_rating = EXCLUDED.average_overall_rating,
    average_content_quality = EXCLUDED.average_content_quality,
    average_delivery_quality = EXCLUDED.average_delivery_quality,
    average_interaction_quality = EXCLUDED.average_interaction_quality,
    average_organization_quality = EXCLUDED.average_organization_quality,
    total_trainings_completed = EXCLUDED.total_trainings_completed,
    last_updated = NOW();
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update trainer stats when ratings change
CREATE OR REPLACE FUNCTION trigger_update_trainer_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- Update stats for the trainer
  PERFORM update_trainer_stats(COALESCE(NEW.trainer_id, OLD.trainer_id));
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create triggers
DROP TRIGGER IF EXISTS training_ratings_update_stats ON training_ratings;
CREATE TRIGGER training_ratings_update_stats
  AFTER INSERT OR UPDATE OR DELETE ON training_ratings
  FOR EACH ROW
  EXECUTE FUNCTION trigger_update_trainer_stats();

-- Create function to get trainer ratings summary
CREATE OR REPLACE FUNCTION get_trainer_ratings_summary(trainer_uuid UUID)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total_ratings', COUNT(*),
    'average_rating', ROUND(AVG(overall_rating), 2),
    'rating_distribution', json_build_object(
      '5', COUNT(*) FILTER (WHERE overall_rating = 5),
      '4', COUNT(*) FILTER (WHERE overall_rating = 4),
      '3', COUNT(*) FILTER (WHERE overall_rating = 3),
      '2', COUNT(*) FILTER (WHERE overall_rating = 2),
      '1', COUNT(*) FILTER (WHERE overall_rating = 1)
    )
  ) INTO result
  FROM training_ratings
  WHERE trainer_id = trainer_uuid AND is_approved = true;

  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Enable Row Level Security
ALTER TABLE training_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE trainer_stats ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for training_ratings
CREATE POLICY "Users can view approved ratings" ON training_ratings
  FOR SELECT USING (is_approved = true);

CREATE POLICY "Trainees can insert their own ratings" ON training_ratings
  FOR INSERT WITH CHECK (auth.uid() = trainee_id);

CREATE POLICY "Trainees can update their own ratings" ON training_ratings
  FOR UPDATE USING (auth.uid() = trainee_id);

CREATE POLICY "Admins can manage all ratings" ON training_ratings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create RLS policies for trainer_stats
CREATE POLICY "Anyone can view trainer stats" ON trainer_stats
  FOR SELECT USING (true);

CREATE POLICY "Only system can modify trainer stats" ON trainer_stats
  FOR ALL USING (false);

-- Create function to update trainer stats automatically
CREATE OR REPLACE FUNCTION update_trainer_stats(trainer_uuid UUID)
RETURNS VOID AS $$
BEGIN
  INSERT INTO trainer_stats (
    trainer_id,
    total_ratings,
    average_overall_rating,
    average_content_quality,
    average_delivery_quality,
    average_interaction_quality,
    average_organization_quality,
    total_trainings_completed,
    last_updated
  )
  SELECT
    trainer_uuid,
    COUNT(*),
    ROUND(AVG(overall_rating), 2),
    ROUND(AVG(content_quality), 2),
    ROUND(AVG(delivery_quality), 2),
    ROUND(AVG(interaction_quality), 2),
    ROUND(AVG(organization_quality), 2),
    COUNT(*),
    NOW()
  FROM training_ratings
  WHERE trainer_id = trainer_uuid AND is_approved = true
  ON CONFLICT (trainer_id)
  DO UPDATE SET
    total_ratings = EXCLUDED.total_ratings,
    average_overall_rating = EXCLUDED.average_overall_rating,
    average_content_quality = EXCLUDED.average_content_quality,
    average_delivery_quality = EXCLUDED.average_delivery_quality,
    average_interaction_quality = EXCLUDED.average_interaction_quality,
    average_organization_quality = EXCLUDED.average_organization_quality,
    total_trainings_completed = EXCLUDED.total_trainings_completed,
    last_updated = NOW();
END;
$$ LANGUAGE plpgsql;

-- Create trigger function to automatically update trainer stats
CREATE OR REPLACE FUNCTION trigger_update_trainer_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- Update stats for the trainer
  PERFORM update_trainer_stats(COALESCE(NEW.trainer_id, OLD.trainer_id));
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create triggers
DROP TRIGGER IF EXISTS training_ratings_update_stats ON training_ratings;
CREATE TRIGGER training_ratings_update_stats
  AFTER INSERT OR UPDATE OR DELETE ON training_ratings
  FOR EACH ROW
  EXECUTE FUNCTION trigger_update_trainer_stats();

-- Create function to get trainer ratings summary
CREATE OR REPLACE FUNCTION get_trainer_ratings_summary(trainer_uuid UUID)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total_ratings', COUNT(*),
    'average_rating', ROUND(AVG(overall_rating), 2),
    'rating_distribution', json_build_object(
      '5', COUNT(*) FILTER (WHERE overall_rating = 5),
      '4', COUNT(*) FILTER (WHERE overall_rating = 4),
      '3', COUNT(*) FILTER (WHERE overall_rating = 3),
      '2', COUNT(*) FILTER (WHERE overall_rating = 2),
      '1', COUNT(*) FILTER (WHERE overall_rating = 1)
    )
  ) INTO result
  FROM training_ratings
  WHERE trainer_id = trainer_uuid AND is_approved = true;

  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Grant necessary permissions
GRANT SELECT ON training_ratings TO anon, authenticated;
GRANT INSERT, UPDATE ON training_ratings TO authenticated;
GRANT SELECT ON trainer_stats TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_trainer_ratings_summary(UUID) TO anon, authenticated;

-- Insert sample data for testing (uncomment to use)
/*
-- Sample rating data
INSERT INTO training_ratings (
  training_request_id,
  trainer_id,
  trainee_id,
  overall_rating,
  content_quality,
  delivery_quality,
  interaction_quality,
  organization_quality,
  review_text,
  is_anonymous
)
SELECT
  tr.id,
  tr.assigned_trainer_id,
  tr.requested_by,
  5,
  5,
  4,
  5,
  4,
  'تدريب ممتاز، استفدت كثيراً من المحتوى والطريقة المبتكرة في التقديم. المدرب كان متفاعل ومنظم.',
  false
FROM training_requests tr
WHERE tr.status = 'completed'
AND tr.assigned_trainer_id IS NOT NULL
LIMIT 1;
*/

-- Insert some sample data for testing (optional)
-- This will be commented out for production
/*
INSERT INTO training_ratings (
  training_request_id,
  trainer_id,
  trainee_id,
  overall_rating,
  content_quality,
  delivery_quality,
  interaction_quality,
  organization_quality,
  review_text,
  is_anonymous
) VALUES (
  (SELECT id FROM training_requests LIMIT 1),
  (SELECT id FROM users WHERE role = 'trainer' LIMIT 1),
  (SELECT id FROM users WHERE role = 'trainee' LIMIT 1),
  5,
  5,
  4,
  5,
  4,
  'تدريب ممتاز، استفدت كثيراً من المحتوى والطريقة المبتكرة في التقديم.',
  false
);
*/
