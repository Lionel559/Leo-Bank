const { createClient } = require("@supabase/supabase-js")

const supabase = createClient(
  "https://rtjejartkhpcggssurmw.supabase.co",
  process.env.SUPABASE_KEY
)

module.exports = supabase