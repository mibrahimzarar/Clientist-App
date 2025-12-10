-- Migration 042: Add missing indexes for performance optimization
-- Ensuring smoothness for thousands of users by indexing Foreign Keys and Filter Columns

-- 1. Travel Agent - Clients
CREATE INDEX IF NOT EXISTS idx_clients_created_by ON clients(created_by);
CREATE INDEX IF NOT EXISTS idx_clients_updated_by ON clients(updated_by);
CREATE INDEX IF NOT EXISTS idx_clients_full_name ON clients(full_name);

-- 2. Travel Agent - Travel Information
CREATE INDEX IF NOT EXISTS idx_travel_information_departure_date ON travel_information(departure_date);
CREATE INDEX IF NOT EXISTS idx_travel_information_return_date ON travel_information(return_date);

-- 3. Travel Agent - Follow Ups
CREATE INDEX IF NOT EXISTS idx_follow_ups_follow_up_date ON follow_ups(follow_up_date);
CREATE INDEX IF NOT EXISTS idx_follow_ups_status ON follow_ups(status);

-- 4. Travel Agent - Client Tasks
-- Note: client_id might already have an index implicitly or explicitly in recent postgres versions but good to be safe
CREATE INDEX IF NOT EXISTS idx_client_tasks_client_id ON client_tasks(client_id);
CREATE INDEX IF NOT EXISTS idx_client_tasks_created_by ON client_tasks(created_by);
CREATE INDEX IF NOT EXISTS idx_client_tasks_due_date ON client_tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_client_tasks_status ON client_tasks(status);

-- 5. Freelancer - Clients
CREATE INDEX IF NOT EXISTS idx_freelancer_clients_created_by ON freelancer_clients(created_by);
CREATE INDEX IF NOT EXISTS idx_freelancer_clients_created_at ON freelancer_clients(created_at);
CREATE INDEX IF NOT EXISTS idx_freelancer_clients_status ON freelancer_clients(status);

-- 6. Freelancer - Projects
CREATE INDEX IF NOT EXISTS idx_freelancer_projects_client_id ON freelancer_projects(client_id);
CREATE INDEX IF NOT EXISTS idx_freelancer_projects_status ON freelancer_projects(status);
CREATE INDEX IF NOT EXISTS idx_freelancer_projects_deadline ON freelancer_projects(deadline);

-- 7. Freelancer - Tasks
CREATE INDEX IF NOT EXISTS idx_freelancer_tasks_project_id ON freelancer_tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_freelancer_tasks_status ON freelancer_tasks(status);
CREATE INDEX IF NOT EXISTS idx_freelancer_tasks_due_date ON freelancer_tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_freelancer_tasks_assigned_to ON freelancer_tasks(assigned_to);

-- 8. Freelancer - Leads
CREATE INDEX IF NOT EXISTS idx_freelancer_leads_status ON freelancer_leads(status);
CREATE INDEX IF NOT EXISTS idx_freelancer_leads_next_follow_up ON freelancer_leads(next_follow_up);

-- 9. Freelancer - Reminders
CREATE INDEX IF NOT EXISTS idx_freelancer_reminders_due_date ON freelancer_reminders(due_date);
CREATE INDEX IF NOT EXISTS idx_freelancer_reminders_client_id ON freelancer_reminders(client_id);
CREATE INDEX IF NOT EXISTS idx_freelancer_reminders_project_id ON freelancer_reminders(project_id);

-- 10. Service Provider (Additional Checks)
-- Most were present, but ensuring coverage
CREATE INDEX IF NOT EXISTS idx_sp_jobs_client_id ON sp_jobs(client_id);
CREATE INDEX IF NOT EXISTS idx_sp_invoices_status ON sp_invoices(status);
