
-- Add RLS policies for the existing tables to ensure proper data access
ALTER TABLE public.business_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.google_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Create policies for business_locations
CREATE POLICY "Users can view their own business locations" 
  ON public.business_locations 
  FOR SELECT 
  USING (google_account_id IN (
    SELECT ga.id FROM public.google_accounts ga WHERE ga.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert their own business locations" 
  ON public.business_locations 
  FOR INSERT 
  WITH CHECK (google_account_id IN (
    SELECT ga.id FROM public.google_accounts ga WHERE ga.user_id = auth.uid()
  ));

CREATE POLICY "Users can update their own business locations" 
  ON public.business_locations 
  FOR UPDATE 
  USING (google_account_id IN (
    SELECT ga.id FROM public.google_accounts ga WHERE ga.user_id = auth.uid()
  ));

-- Create policies for google_accounts
CREATE POLICY "Users can view their own google accounts" 
  ON public.google_accounts 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own google accounts" 
  ON public.google_accounts 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own google accounts" 
  ON public.google_accounts 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Create policies for daily_metrics
CREATE POLICY "Users can view metrics for their locations" 
  ON public.daily_metrics 
  FOR SELECT 
  USING (location_id IN (
    SELECT bl.id FROM public.business_locations bl 
    JOIN public.google_accounts ga ON bl.google_account_id = ga.id 
    WHERE ga.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert metrics for their locations" 
  ON public.daily_metrics 
  FOR INSERT 
  WITH CHECK (location_id IN (
    SELECT bl.id FROM public.business_locations bl 
    JOIN public.google_accounts ga ON bl.google_account_id = ga.id 
    WHERE ga.user_id = auth.uid()
  ));

-- Create policies for reviews
CREATE POLICY "Users can view reviews for their locations" 
  ON public.reviews 
  FOR SELECT 
  USING (location_id IN (
    SELECT bl.id FROM public.business_locations bl 
    JOIN public.google_accounts ga ON bl.google_account_id = ga.id 
    WHERE ga.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert reviews for their locations" 
  ON public.reviews 
  FOR INSERT 
  WITH CHECK (location_id IN (
    SELECT bl.id FROM public.business_locations bl 
    JOIN public.google_accounts ga ON bl.google_account_id = ga.id 
    WHERE ga.user_id = auth.uid()
  ));

-- Add foreign key constraints that were missing
ALTER TABLE public.business_locations 
ADD CONSTRAINT fk_business_locations_google_account 
FOREIGN KEY (google_account_id) REFERENCES public.google_accounts(id);

ALTER TABLE public.daily_metrics 
ADD CONSTRAINT fk_daily_metrics_location 
FOREIGN KEY (location_id) REFERENCES public.business_locations(id);

ALTER TABLE public.reviews 
ADD CONSTRAINT fk_reviews_location 
FOREIGN KEY (location_id) REFERENCES public.business_locations(id);

-- Create a function to sync Google Business Profile data
CREATE OR REPLACE FUNCTION public.sync_google_business_data(account_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSON;
BEGIN
  -- This function will be called by the edge function to update data
  -- Return success status
  SELECT json_build_object('status', 'success', 'message', 'Sync initiated') INTO result;
  RETURN result;
END;
$$;
