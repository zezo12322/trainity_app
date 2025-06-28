-- Migration script to add approval_path support to existing training_requests table
-- Run this script in your Supabase SQL editor

-- 1. Add the approval_path column to existing training_requests table
ALTER TABLE training_requests
ADD COLUMN IF NOT EXISTS approval_path TEXT DEFAULT 'standard'
CHECK (approval_path IN ('standard', 'pm_alternative'));

-- 2. Update existing records to have the standard approval path
UPDATE training_requests
SET approval_path = 'standard'
WHERE approval_path IS NULL;

-- 3. Create index for better performance on approval_path queries
CREATE INDEX IF NOT EXISTS idx_training_requests_approval_path
ON training_requests(approval_path);

-- 4. Create index for combined status and approval_path queries
CREATE INDEX IF NOT EXISTS idx_training_requests_status_approval_path
ON training_requests(status, approval_path);

-- 5. Update RLS policies to include approval_path considerations
-- (The existing policies should still work, but we can optimize them later)

-- 6. Create a function to automatically set approval_path based on requester role
CREATE OR REPLACE FUNCTION set_approval_path_on_insert()
RETURNS TRIGGER AS $$
BEGIN
  -- Get the requester's role
  SELECT role INTO NEW.approval_path
  FROM users
  WHERE id = NEW.requester_id;

  -- Set approval path based on role
  IF NEW.approval_path = 'TRAINER_PREPARATION_PROJECT_MANAGER' THEN
    NEW.approval_path := 'pm_alternative';
    -- Also set initial status to sv_approved for PM requests
    NEW.status := 'sv_approved';
  ELSE
    NEW.approval_path := 'standard';
    -- Keep default status for standard path
    NEW.status := COALESCE(NEW.status, 'under_review');
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 7. Create trigger to automatically set approval_path on insert
DROP TRIGGER IF EXISTS trigger_set_approval_path ON training_requests;
CREATE TRIGGER trigger_set_approval_path
  BEFORE INSERT ON training_requests
  FOR EACH ROW
  EXECUTE FUNCTION set_approval_path_on_insert();

-- 8. Create a view for easier querying of requests with approval workflow info
CREATE OR REPLACE VIEW training_requests_with_workflow AS
SELECT
  tr.*,
  u.full_name as requester_name,
  u.role as requester_role,
  u.email as requester_email,
  CASE
    WHEN tr.approval_path = 'pm_alternative' THEN
      CASE tr.status
        WHEN 'sv_approved' THEN 'Waiting for Supervisor Approval'
        WHEN 'pm_approved' THEN 'Approved - Waiting for Trainer'
        WHEN 'tr_assigned' THEN 'Trainer Assigned'
        WHEN 'completed' THEN 'Completed'
        WHEN 'rejected' THEN 'Rejected'
        ELSE tr.status
      END
    ELSE
      CASE tr.status
        WHEN 'under_review' THEN 'Waiting for CC Approval'
        WHEN 'cc_approved' THEN 'Waiting for Supervisor Approval'
        WHEN 'sv_approved' THEN 'Waiting for PM Approval'
        WHEN 'pm_approved' THEN 'Approved - Waiting for Trainer'
        WHEN 'tr_assigned' THEN 'Trainer Assigned'
        WHEN 'completed' THEN 'Completed'
        WHEN 'rejected' THEN 'Rejected'
        ELSE tr.status
      END
  END as status_description
FROM training_requests tr
JOIN users u ON tr.requester_id = u.id;

-- 9. Grant necessary permissions on the view
GRANT SELECT ON training_requests_with_workflow TO authenticated;

-- 10. Create RLS policy for the view
ALTER TABLE training_requests_with_workflow ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view training requests with workflow info" ON training_requests_with_workflow
  FOR SELECT USING (
    requester_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role IN ('PROGRAM_SUPERVISOR', 'TRAINER_PREPARATION_PROJECT_MANAGER', 'DEVELOPMENT_MANAGEMENT_OFFICER')
    )
  );

-- 11. Create training ratings table for performance analytics
CREATE TABLE IF NOT EXISTS training_ratings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    training_request_id UUID REFERENCES training_requests(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    overall_rating INTEGER CHECK (overall_rating >= 1 AND overall_rating <= 5),
    content_quality INTEGER CHECK (content_quality >= 1 AND content_quality <= 5),
    trainer_effectiveness INTEGER CHECK (trainer_effectiveness >= 1 AND trainer_effectiveness <= 5),
    organization INTEGER CHECK (organization >= 1 AND organization <= 5),
    usefulness INTEGER CHECK (usefulness >= 1 AND usefulness <= 5),
    comments TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_training_ratings_training_request_id ON training_ratings(training_request_id);
CREATE INDEX IF NOT EXISTS idx_training_ratings_user_id ON training_ratings(user_id);
CREATE INDEX IF NOT EXISTS idx_training_ratings_created_at ON training_ratings(created_at);

-- Enable RLS on training ratings
ALTER TABLE training_ratings ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for training ratings
CREATE POLICY "Users can view and manage their own training ratings" ON training_ratings
  FOR ALL USING (user_id = auth.uid());

-- Verification queries (run these to check the migration worked)
-- SELECT COUNT(*) FROM training_requests WHERE approval_path = 'standard';
-- SELECT COUNT(*) FROM training_requests WHERE approval_path = 'pm_alternative';
-- SELECT * FROM training_requests_with_workflow LIMIT 5;
-- SELECT * FROM training_ratings LIMIT 5;
