-- Travel Agent Management System Database Schema
-- Migration 002: Analytics views and utility functions

-- Create view for client analytics
CREATE OR REPLACE VIEW client_analytics AS
SELECT 
    c.status,
    c.package_type,
    c.priority_tag,
    c.lead_source,
    COUNT(*) as client_count,
    COUNT(CASE WHEN c.created_at >= CURRENT_DATE - INTERVAL '30 days' THEN 1 END) as recent_clients,
    COUNT(CASE WHEN c.status IN ('approved', 'completed') THEN 1 END) as successful_clients
FROM clients c
GROUP BY c.status, c.package_type, c.priority_tag, c.lead_source;

-- Create view for upcoming travel dates
CREATE OR REPLACE VIEW upcoming_travels AS
SELECT 
    c.id as client_id,
    c.full_name,
    c.phone_number,
    c.email,
    c.status as client_status,
    ti.departure_date,
    ti.return_date,
    ti.airline,
    ti.pnr_number,
    ti.hotel_name,
    CASE 
        WHEN ti.departure_date = CURRENT_DATE THEN 'today'
        WHEN ti.departure_date = CURRENT_DATE + INTERVAL '1 day' THEN 'tomorrow'
        WHEN ti.departure_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '7 days' THEN 'this_week'
        WHEN ti.departure_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '30 days' THEN 'this_month'
        ELSE 'later'
    END as travel_urgency
FROM clients c
JOIN travel_information ti ON c.id = ti.client_id
WHERE ti.departure_date >= CURRENT_DATE
ORDER BY ti.departure_date ASC;

-- Create view for pending tasks
CREATE OR REPLACE VIEW pending_tasks AS
SELECT 
    c.id as client_id,
    c.full_name,
    c.phone_number,
    c.status as client_status,
    r.id as reminder_id,
    r.title as reminder_title,
    r.description as reminder_description,
    r.reminder_type,
    r.due_date,
    r.is_completed,
    CASE 
        WHEN r.due_date < CURRENT_TIMESTAMP THEN 'overdue'
        WHEN r.due_date < CURRENT_TIMESTAMP + INTERVAL '24 hours' THEN 'due_soon'
        ELSE 'upcoming'
    END as urgency
FROM clients c
JOIN reminders r ON c.id = r.client_id
WHERE r.is_completed = FALSE
ORDER BY r.due_date ASC;

-- Create view for payment tracking
CREATE OR REPLACE VIEW payment_summary AS
SELECT 
    c.id as client_id,
    c.full_name,
    c.package_type,
    COUNT(p.id) as total_payments,
    COALESCE(SUM(p.amount), 0) as total_amount,
    COUNT(CASE WHEN p.status = 'pending' THEN 1 END) as pending_payments,
    COUNT(CASE WHEN p.status = 'completed' THEN 1 END) as completed_payments,
    MAX(p.payment_date) as last_payment_date
FROM clients c
LEFT JOIN payments p ON c.id = p.client_id
GROUP BY c.id, c.full_name, c.package_type;

-- Create function to get client dashboard summary
CREATE OR REPLACE FUNCTION get_client_dashboard_summary(user_id UUID)
RETURNS TABLE (
    total_clients BIGINT,
    new_clients BIGINT,
    in_process_clients BIGINT,
    completed_clients BIGINT,
    urgent_tasks BIGINT,
    upcoming_travels BIGINT,
    pending_payments BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(DISTINCT c.id)::BIGINT as total_clients,
        COUNT(DISTINCT CASE WHEN c.status = 'pending' THEN c.id END)::BIGINT as new_clients,
        COUNT(DISTINCT CASE WHEN c.status = 'in_progress' THEN c.id END)::BIGINT as in_process_clients,
        COUNT(DISTINCT CASE WHEN c.status = 'completed' THEN c.id END)::BIGINT as completed_clients,
        COUNT(DISTINCT CASE WHEN r.is_completed = FALSE AND r.due_date < CURRENT_TIMESTAMP + INTERVAL '24 hours' THEN r.id END)::BIGINT as urgent_tasks,
        COUNT(DISTINCT CASE WHEN ti.departure_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '30 days' THEN ti.id END)::BIGINT as upcoming_travels,
        COUNT(DISTINCT CASE WHEN p.status = 'pending' THEN p.id END)::BIGINT as pending_payments
    FROM clients c
    LEFT JOIN reminders r ON c.id = r.client_id
    LEFT JOIN travel_information ti ON c.id = ti.client_id
    LEFT JOIN payments p ON c.id = p.client_id
    WHERE c.created_by = user_id OR c.updated_by = user_id;
END;
$$ LANGUAGE plpgsql;

-- Create function to search clients
CREATE OR REPLACE FUNCTION search_clients(
    search_term TEXT,
    status_filter client_status DEFAULT NULL,
    package_filter package_type DEFAULT NULL,
    priority_filter priority_tag DEFAULT NULL,
    user_id UUID DEFAULT NULL
)
RETURNS TABLE (
    id UUID,
    full_name VARCHAR(255),
    phone_number VARCHAR(20),
    email VARCHAR(255),
    country VARCHAR(100),
    package_type package_type,
    status client_status,
    priority_tag priority_tag,
    created_at TIMESTAMP WITH TIME ZONE,
    relevance_score INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.id,
        c.full_name,
        c.phone_number,
        c.email,
        c.country,
        c.package_type,
        c.status,
        c.priority_tag,
        c.created_at,
        (
            CASE WHEN c.full_name ILIKE '%' || search_term || '%' THEN 3 ELSE 0 END +
            CASE WHEN c.phone_number ILIKE '%' || search_term || '%' THEN 3 ELSE 0 END +
            CASE WHEN c.email ILIKE '%' || search_term || '%' THEN 2 ELSE 0 END +
            CASE WHEN c.country ILIKE '%' || search_term || '%' THEN 1 ELSE 0 END
        ) as relevance_score
    FROM clients c
    WHERE 
        (search_term IS NULL OR 
         c.full_name ILIKE '%' || search_term || '%' OR
         c.phone_number ILIKE '%' || search_term || '%' OR
         c.email ILIKE '%' || search_term || '%' OR
         c.country ILIKE '%' || search_term || '%')
        AND (status_filter IS NULL OR c.status = status_filter)
        AND (package_filter IS NULL OR c.package_type = package_filter)
        AND (priority_filter IS NULL OR c.priority_tag = priority_filter)
        AND (user_id IS NULL OR c.created_by = user_id OR c.updated_by = user_id)
        AND relevance_score > 0
    ORDER BY relevance_score DESC, c.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Create function to get client with all related data
CREATE OR REPLACE FUNCTION get_client_full_details(client_uuid UUID)
RETURNS TABLE (
    client_data JSONB,
    travel_data JSONB,
    visa_data JSONB,
    reminders_data JSONB,
    payments_data JSONB,
    files_data JSONB,
    follow_ups_data JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        to_jsonb(c.*) as client_data,
        to_jsonb(ti.*) as travel_data,
        to_jsonb(va.*) as visa_data,
        COALESCE(jsonb_agg(DISTINCT r.*) FILTER (WHERE r.id IS NOT NULL), '[]'::jsonb) as reminders_data,
        COALESCE(jsonb_agg(DISTINCT p.*) FILTER (WHERE p.id IS NOT NULL), '[]'::jsonb) as payments_data,
        COALESCE(jsonb_agg(DISTINCT cf.*) FILTER (WHERE cf.id IS NOT NULL), '[]'::jsonb) as files_data,
        COALESCE(jsonb_agg(DISTINCT fu.*) FILTER (WHERE fu.id IS NOT NULL), '[]'::jsonb) as follow_ups_data
    FROM clients c
    LEFT JOIN travel_information ti ON c.id = ti.client_id
    LEFT JOIN visa_applications va ON c.id = va.client_id
    LEFT JOIN reminders r ON c.id = r.client_id
    LEFT JOIN payments p ON c.id = p.client_id
    LEFT JOIN client_files cf ON c.id = cf.client_id
    LEFT JOIN follow_ups fu ON c.id = fu.client_id
    WHERE c.id = client_uuid
    GROUP BY c.id, ti.id, va.id;
END;
$$ LANGUAGE plpgsql;

-- Create full-text search indexes for better search performance
-- Drop existing simple indexes and replace with GIN indexes for text search
DROP INDEX IF EXISTS idx_clients_email;
DROP INDEX IF EXISTS idx_clients_full_name;

-- Create GIN indexes for full-text search functionality
CREATE INDEX idx_clients_full_name_search ON clients USING gin (to_tsvector('english', full_name));
CREATE INDEX idx_clients_phone_search ON clients USING gin (to_tsvector('english', phone_number));
CREATE INDEX idx_clients_email_search ON clients USING gin (to_tsvector('english', email));
CREATE INDEX idx_clients_country_search ON clients USING gin (to_tsvector('english', country));

-- Insert sample data for testing (optional - remove in production)
INSERT INTO clients (full_name, phone_number, email, country, package_type, lead_source, status, priority_tag, notes) VALUES
('John Doe', '+1234567890', 'john.doe@email.com', 'USA', 'umrah_package', 'facebook', 'new', 'normal', 'First time traveler'),
('Jane Smith', '+0987654321', 'jane.smith@email.com', 'UK', 'tourist_visa', 'referral', 'in_process', 'priority', 'VIP client'),
('Mohammed Ali', '+1122334455', 'mohammed.ali@email.com', 'Pakistan', 'visit_visa', 'walk_in', 'documents_pending', 'urgent', 'Needs visa urgently'),
('Sarah Johnson', '+5566778899', 'sarah.j@email.com', 'Canada', 'ticketing', 'facebook', 'approved', 'normal', 'Business trip'),
('Ahmed Khan', '+9988776655', 'ahmed.khan@email.com', 'UAE', 'umrah_package', 'referral', 'completed', 'vip', 'Repeat customer');