-- Baby Activity Monitoring Application Database Schema

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Babies table
CREATE TABLE IF NOT EXISTS babies (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    date_of_birth DATE NOT NULL,
    gender ENUM('male', 'female', 'other') DEFAULT 'other',
    weight_at_birth DECIMAL(5,2),
    blood_type VARCHAR(5),
    allergies TEXT,
    medical_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Feeding activities table
CREATE TABLE IF NOT EXISTS feeding_activities (
    id INT AUTO_INCREMENT PRIMARY KEY,
    baby_id INT NOT NULL,
    feeding_type ENUM('breast', 'bottle', 'solid') NOT NULL,
    start_time DATETIME NOT NULL,
    end_time DATETIME,
    amount_ml INT,
    food_type VARCHAR(100),
    side ENUM('left', 'right', 'both') DEFAULT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (baby_id) REFERENCES babies(id) ON DELETE CASCADE
);

-- Sleep activities table
CREATE TABLE IF NOT EXISTS sleep_activities (
    id INT AUTO_INCREMENT PRIMARY KEY,
    baby_id INT NOT NULL,
    start_time DATETIME NOT NULL,
    end_time DATETIME,
    sleep_quality ENUM('excellent', 'good', 'fair', 'poor'),
    location ENUM('crib', 'parents_bed', 'stroller', 'car', 'other'),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (baby_id) REFERENCES babies(id) ON DELETE CASCADE
);

-- Diaper changes table
CREATE TABLE IF NOT EXISTS diaper_changes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    baby_id INT NOT NULL,
    change_time DATETIME NOT NULL,
    diaper_type ENUM('wet', 'dirty', 'both', 'dry') NOT NULL,
    rash_observed BOOLEAN DEFAULT FALSE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (baby_id) REFERENCES babies(id) ON DELETE CASCADE
);

-- Health observations table
CREATE TABLE IF NOT EXISTS health_observations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    baby_id INT NOT NULL,
    observation_time DATETIME NOT NULL,
    observation_type ENUM('temperature', 'symptom', 'medication', 'milestone', 'other') NOT NULL,
    temperature DECIMAL(4,1),
    symptoms TEXT,
    medication_name VARCHAR(100),
    medication_dosage VARCHAR(50),
    milestone_description TEXT,
    severity ENUM('low', 'medium', 'high'),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (baby_id) REFERENCES babies(id) ON DELETE CASCADE
);

-- Indexes for better query performance
CREATE INDEX idx_babies_user_id ON babies(user_id);
CREATE INDEX idx_feeding_baby_id ON feeding_activities(baby_id);
CREATE INDEX idx_feeding_start_time ON feeding_activities(start_time);
CREATE INDEX idx_sleep_baby_id ON sleep_activities(baby_id);
CREATE INDEX idx_sleep_start_time ON sleep_activities(start_time);
CREATE INDEX idx_diaper_baby_id ON diaper_changes(baby_id);
CREATE INDEX idx_diaper_change_time ON diaper_changes(change_time);
CREATE INDEX idx_health_baby_id ON health_observations(baby_id);
CREATE INDEX idx_health_observation_time ON health_observations(observation_time);