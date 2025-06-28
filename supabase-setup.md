# Supabase Database Setup

## 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Note down your project URL and anon key

## 2. Database Schema

Run the following SQL commands in your Supabase SQL editor:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table
CREATE TABLE users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role TEXT NOT NULL CHECK (role IN (
    'TRAINER_PREPARATION_PROJECT_MANAGER',
    'PROGRAM_SUPERVISOR',
    'DEVELOPMENT_MANAGEMENT_OFFICER',
    'PROVINCIAL_DEVELOPMENT_OFFICER'
  )),
  province TEXT,
  center TEXT,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create training_requests table
CREATE TABLE training_requests (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  requester_id UUID REFERENCES users(id) NOT NULL,
  province TEXT NOT NULL,
  center TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'under_review' CHECK (status IN (
    'under_review',
    'cc_approved',
    'sv_approved',
    'pm_approved',
    'tr_assigned',
    'final_approved',
    'completed',
    'rejected'
  )),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  requested_date DATE NOT NULL,
  approved_date DATE,
  trainer_id UUID REFERENCES users(id),
  notes TEXT,
  approval_path TEXT DEFAULT 'standard' CHECK (approval_path IN ('standard', 'pm_alternative')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create chat_rooms table
CREATE TABLE chat_rooms (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('individual', 'group')),
  participants UUID[] NOT NULL,
  last_message TEXT,
  last_message_at TIMESTAMP WITH TIME ZONE,
  is_archived BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create chat_messages table
CREATE TABLE chat_messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  room_id UUID REFERENCES chat_rooms(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES users(id) NOT NULL,
  content TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'text' CHECK (type IN ('text', 'image', 'file')),
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create notifications table
CREATE TABLE notifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  type TEXT NOT NULL,
  data JSONB,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_training_requests_requester ON training_requests(requester_id);
CREATE INDEX idx_training_requests_trainer ON training_requests(trainer_id);
CREATE INDEX idx_training_requests_status ON training_requests(status);
CREATE INDEX idx_training_requests_province ON training_requests(province);
CREATE INDEX idx_chat_messages_room ON chat_messages(room_id);
CREATE INDEX idx_chat_messages_sender ON chat_messages(sender_id);
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(is_read);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_training_requests_updated_at BEFORE UPDATE ON training_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_chat_rooms_updated_at BEFORE UPDATE ON chat_rooms
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

## 3. Row Level Security (RLS)

Enable RLS and create policies:

```sql
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view their own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Training requests policies
CREATE POLICY "Users can view training requests" ON training_requests
  FOR SELECT USING (
    requester_id = auth.uid() OR
    trainer_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role IN ('PROGRAM_SUPERVISOR', 'TRAINER_PREPARATION_PROJECT_MANAGER')
    )
  );

CREATE POLICY "Users can create training requests" ON training_requests
  FOR INSERT WITH CHECK (requester_id = auth.uid());

CREATE POLICY "Authorized users can update training requests" ON training_requests
  FOR UPDATE USING (
    requester_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role IN ('PROGRAM_SUPERVISOR', 'TRAINER_PREPARATION_PROJECT_MANAGER')
    )
  );

-- Chat rooms policies
CREATE POLICY "Users can view their chat rooms" ON chat_rooms
  FOR SELECT USING (auth.uid() = ANY(participants));

CREATE POLICY "Users can create chat rooms" ON chat_rooms
  FOR INSERT WITH CHECK (auth.uid() = ANY(participants));

-- Chat messages policies
CREATE POLICY "Users can view messages in their rooms" ON chat_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM chat_rooms
      WHERE id = room_id AND auth.uid() = ANY(participants)
    )
  );

CREATE POLICY "Users can send messages to their rooms" ON chat_messages
  FOR INSERT WITH CHECK (
    sender_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM chat_rooms
      WHERE id = room_id AND auth.uid() = ANY(participants)
    )
  );

-- Notifications policies
CREATE POLICY "Users can view their notifications" ON notifications
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update their notifications" ON notifications
  FOR UPDATE USING (user_id = auth.uid());
```

## 4. Sample Data

Insert some sample data for testing:

```sql
-- Insert sample users (you'll need to create these users in Supabase Auth first)
INSERT INTO users (id, email, full_name, role, province, center) VALUES
('user-id-1', 'manager@example.com', 'أحمد محمد', 'TRAINER_PREPARATION_PROJECT_MANAGER', 'الرياض', 'المركز الرئيسي'),
('user-id-2', 'supervisor@example.com', 'فاطمة علي', 'PROGRAM_SUPERVISOR', 'مكة المكرمة', 'مركز مكة'),
('user-id-3', 'officer@example.com', 'محمد سالم', 'DEVELOPMENT_MANAGEMENT_OFFICER', 'المدينة المنورة', 'مركز المدينة');

-- Insert sample training requests
INSERT INTO training_requests (title, description, requester_id, province, center, status, priority, requested_date) VALUES
('تدريب إعداد المدربين الأساسي', 'تدريب شامل لإعداد المدربين الجدد', 'user-id-2', 'الرياض', 'المركز الرئيسي', 'under_review', 'high', '2025-07-01'),
('ورشة تطوير المهارات', 'ورشة عمل لتطوير مهارات التدريب', 'user-id-3', 'مكة المكرمة', 'مركز مكة', 'cc_approved', 'medium', '2025-07-15');
```

## 5. Environment Variables

Update your `src/services/supabase.ts` file with your actual Supabase credentials:

```typescript
const supabaseUrl = 'YOUR_SUPABASE_PROJECT_URL';
const supabaseAnonKey = 'YOUR_SUPABASE_ANON_KEY';
```

## 6. Authentication Setup

In Supabase Dashboard:
1. Go to Authentication > Settings
2. Configure your authentication providers
3. Set up email templates if needed
4. Configure redirect URLs for your app

## 7. Storage Setup (Optional)

If you need file uploads:
1. Go to Storage in Supabase Dashboard
2. Create buckets for avatars, documents, etc.
3. Set up storage policies

## 8. Real-time Setup (Optional)

Enable real-time for chat functionality:
1. Go to Database > Replication
2. Enable real-time for chat_messages table
3. Configure real-time policies
```
