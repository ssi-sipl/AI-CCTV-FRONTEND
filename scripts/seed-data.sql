-- Insert sample detection data

INSERT INTO detected_objects (label, confidence, timestamp, camera_ip) VALUES
('fire', 0.95, '2025-01-05 16:30:15', '192.168.1.100'),
('smoke', 0.87, '2025-01-05 16:30:18', '192.168.1.100'),
('person', 0.92, '2025-01-05 16:30:22', '192.168.1.101'),
('fire', 0.89, '2025-01-05 16:30:25', '192.168.1.102'),
('vehicle', 0.78, '2025-01-05 16:30:28', '192.168.1.103'),
('smoke', 0.91, '2025-01-05 16:31:10', '192.168.1.101'),
('person', 0.85, '2025-01-05 16:31:15', '192.168.1.103'),
('fire', 0.93, '2025-01-05 16:31:20', '192.168.1.100');

-- Insert corresponding alerts for fire and smoke detections
INSERT INTO alerts (object_id, alert_type, message, severity) 
SELECT 
    id, 
    CASE 
        WHEN label = 'fire' THEN 'FIRE_DETECTED'
        WHEN label = 'smoke' THEN 'SMOKE_DETECTED'
    END,
    CONCAT(UPPER(label), ' detected on camera ', camera_ip, ' with ', ROUND(confidence * 100, 1), '% confidence'),
    CASE 
        WHEN label = 'fire' THEN 'high'
        WHEN label = 'smoke' THEN 'medium'
    END
FROM detected_objects 
WHERE label IN ('fire', 'smoke');
