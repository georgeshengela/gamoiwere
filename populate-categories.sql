-- Truncate existing data
TRUNCATE TABLE api_categories RESTART IDENTITY CASCADE;

-- Create temporary table to store API data
CREATE TEMP TABLE temp_api_data (
    api_id TEXT,
    name TEXT,
    parent_api_id TEXT,
    level INTEGER
);

-- Insert Level 0 categories (roots)
INSERT INTO temp_api_data (api_id, name, parent_api_id, level) VALUES 
('tr-g4', 'ელექტრონიკა', NULL, 0),
('tr-g6', 'მამაკაცებისთვის', NULL, 0),
('tr-g1', 'Ქალისთვის', NULL, 0),
('tr-g2', 'ბავშვებისთვის', NULL, 0),
('tr-g3', 'სახლისთვის', NULL, 0),
('tr-g5', 'ავტო & მოტო', NULL, 0),
('tr-g7', 'სპორტი და დასვენება', NULL, 0),
('tr-g8', 'ზოვრება და ჯანმრთელობა', NULL, 0),
('tr-g9', 'მშენებლობა', NULL, 0),
('tr-g10', 'ბაღი', NULL, 0),
('tr-g11', 'საკვები', NULL, 0),
('tr-g12', 'ღვინო', NULL, 0),
('tr-g13', 'ბიზნესი და ბიუროსათვის', NULL, 0),
('tr-g14', 'შინაური ცხოველები', NULL, 0),
('tr-g15', 'ჰობი', NULL, 0),
('tr-g16', 'ჩამოტვირთვა', NULL, 0),
('tr-g17', 'მეორადი ნივთები', NULL, 0),
('tr-g18', 'წიგნები, ფილმები და მუსიკა', NULL, 0),
('tr-g19', 'მომსახურება', NULL, 0),
('tr-g20', 'სხვა', NULL, 0);

-- Insert all categories from temp table into actual table
WITH RECURSIVE category_hierarchy AS (
  -- Level 0 (roots)
  SELECT api_id, name, parent_api_id, level, 
         ROW_NUMBER() OVER (ORDER BY api_id) as id
  FROM temp_api_data 
  WHERE level = 0
  
  UNION ALL
  
  -- All other levels
  SELECT t.api_id, t.name, t.parent_api_id, t.level,
         ROW_NUMBER() OVER (ORDER BY t.api_id) + (SELECT MAX(id) FROM category_hierarchy) as id
  FROM temp_api_data t
  WHERE t.level > 0
)
INSERT INTO api_categories (api_id, name, parent_id, level, is_active)
SELECT 
  ch.api_id,
  ch.name,
  CASE 
    WHEN ch.level = 0 THEN NULL
    ELSE (SELECT id FROM api_categories WHERE api_id = ch.parent_api_id)
  END,
  ch.level,
  true
FROM category_hierarchy ch
ORDER BY ch.level, ch.api_id;

-- Verify the population
SELECT 'Population Summary:' as status;
SELECT level, COUNT(*) as count 
FROM api_categories 
GROUP BY level 
ORDER BY level;

SELECT 'Key Categories Verification:' as status;
SELECT api_id, name FROM api_categories 
WHERE name IN ('ელექტრონიკა', 'Ქალისთვის', 'მამაკაცებისთვის');