-- Product Reviews and Ratings System

-- Reviews table
CREATE TABLE IF NOT EXISTS product_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_slug TEXT NOT NULL,
  menu_item_id UUID NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  comment TEXT,
  images TEXT[], -- Array of image URLs
  verified_purchase BOOLEAN DEFAULT FALSE,
  helpful_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- One review per user per product
  UNIQUE(user_id, menu_item_id)
);

-- Review helpfulness tracking
CREATE TABLE IF NOT EXISTS review_helpful (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id UUID REFERENCES product_reviews(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(review_id, user_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_product_reviews_menu_item ON product_reviews(menu_item_id);
CREATE INDEX IF NOT EXISTS idx_product_reviews_user ON product_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_product_reviews_rating ON product_reviews(rating);
CREATE INDEX IF NOT EXISTS idx_review_helpful_review ON review_helpful(review_id);

-- Auto-update trigger
CREATE TRIGGER product_reviews_updated_at
  BEFORE UPDATE ON product_reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_user_profiles_updated_at();

-- Update helpful count when review_helpful changes
CREATE OR REPLACE FUNCTION update_review_helpful_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE product_reviews 
    SET helpful_count = helpful_count + 1 
    WHERE id = NEW.review_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE product_reviews 
    SET helpful_count = helpful_count - 1 
    WHERE id = OLD.review_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER review_helpful_count_trigger
  AFTER INSERT OR DELETE ON review_helpful
  FOR EACH ROW
  EXECUTE FUNCTION update_review_helpful_count();

-- RLS Policies
ALTER TABLE product_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_helpful ENABLE ROW LEVEL SECURITY;

-- Anyone can view reviews
CREATE POLICY "Anyone can view reviews"
  ON product_reviews FOR SELECT
  USING (true);

-- Authenticated users can create reviews
CREATE POLICY "Authenticated users can create reviews"
  ON product_reviews FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own reviews
CREATE POLICY "Users can update own reviews"
  ON product_reviews FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own reviews
CREATE POLICY "Users can delete own reviews"
  ON product_reviews FOR DELETE
  USING (auth.uid() = user_id);

-- Anyone can see review helpfulness
CREATE POLICY "Anyone can view review helpful"
  ON review_helpful FOR SELECT
  USING (true);

-- Authenticated users can mark reviews as helpful
CREATE POLICY "Users can mark reviews helpful"
  ON review_helpful FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unmark reviews helpful"
  ON review_helpful FOR DELETE
  USING (auth.uid() = user_id);

-- Materialized view for product average ratings (performance optimization)
CREATE MATERIALIZED VIEW IF NOT EXISTS product_ratings AS
SELECT 
  menu_item_id,
  COUNT(*) as review_count,
  AVG(rating)::DECIMAL(3,2) as average_rating,
  COUNT(CASE WHEN rating = 5 THEN 1 END) as five_star,
  COUNT(CASE WHEN rating = 4 THEN 1 END) as four_star,
  COUNT(CASE WHEN rating = 3 THEN 1 END) as three_star,
  COUNT(CASE WHEN rating = 2 THEN 1 END) as two_star,
  COUNT(CASE WHEN rating = 1 THEN 1 END) as one_star
FROM product_reviews
GROUP BY menu_item_id;

CREATE INDEX idx_product_ratings_menu_item ON product_ratings(menu_item_id);

-- Function to refresh ratings view (call after review insert/update/delete)
CREATE OR REPLACE FUNCTION refresh_product_ratings()
RETURNS TRIGGER AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY product_ratings;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER refresh_ratings_trigger
  AFTER INSERT OR UPDATE OR DELETE ON product_reviews
  FOR EACH STATEMENT
  EXECUTE FUNCTION refresh_product_ratings();

-- Comments
COMMENT ON TABLE product_reviews IS 'Customer reviews and ratings for menu items';
COMMENT ON TABLE review_helpful IS 'Tracks which users found reviews helpful';
COMMENT ON MATERIALIZED VIEW product_ratings IS 'Aggregated product ratings for performance';
