-- Create database tables for the Fire Detection System

-- Create detected_objects table
CREATE TABLE IF NOT EXISTS detected_objects (
    id SERIAL PRIMARY KEY,
    label VARCHAR(50) NOT NULL,
    confidence DECIMAL(4,3) NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    camera_ip VARCHAR(15) NOT NULL,
    bounding_box JSON,
    image_path VARCHAR(255)
);

-- Create cameras table
CREATE TABLE IF NOT EXISTS cameras (
    id SERIAL PRIMARY KEY,
    ip_address VARCHAR(15) UNIQUE NOT NULL,
    name VARCHAR(100),
    location VARCHAR(255),
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create alerts table
CREATE TABLE IF NOT EXISTS alerts (
    id SERIAL PRIMARY KEY,
    object_id INTEGER REFERENCES detected_objects(id),
    alert_type VARCHAR(50) NOT NULL,
    message TEXT,
    severity VARCHAR(20) DEFAULT 'medium',
    acknowledged BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample camera data
INSERT INTO cameras (ip_address, name, location) VALUES
('192.168.1.100', 'Camera 1', 'Main Entrance'),
('192.168.1.101', 'Camera 2', 'Warehouse Floor'),
('192.168.1.102', 'Camera 3', 'Storage Area'),
('192.168.1.103', 'Camera 4', 'Exit Door')
ON CONFLICT (ip_address) DO NOTHING;
