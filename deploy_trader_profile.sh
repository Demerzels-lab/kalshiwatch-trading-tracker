#!/bin/bash
cd /workspace/supabase/functions/get-trader-profile
npx supabase functions deploy get-trader-profile \
  --project-ref bpbtgkunrdzcoyfdhskh \
  --token sbp_oauth_824f53e0a5726cbf40f010a63bdfce03ff38fa18
