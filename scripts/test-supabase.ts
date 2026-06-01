import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";

// Manual environment variables loader to prevent third-party dependencies issues
try {
  const envPath = path.resolve(process.cwd(), ".env");
  if (fs.existsSync(envPath)) {
    const envFile = fs.readFileSync(envPath, "utf8");
    envFile.split("\n").forEach((line) => {
      // Matches key = value
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        const key = match[1];
        let value = match[2] || "";
        // Strip quotes
        if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
        if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
        process.env[key] = value;
      }
    });
  }
} catch (e) {
  console.error("Failed to load .env configuration:", e);
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes("your-project-id") || supabaseAnonKey.includes("placeholder")) {
  console.error("\x1b[31mError: Supabase environment credentials are not set correctly in your .env file.\x1b[0m");
  console.log("Please update your .env file with your actual Supabase Project URL and Anon Key.");
  process.exit(1);
}

console.log("Attempting to connect to Supabase at:", supabaseUrl);
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
  try {
    // Attempt a basic read operation on the 'user' table we defined in migrations
    const { data, error } = await supabase.from("user").select("id").limit(1);

    if (error) {
      // If table 'user' doesn't exist yet but credentials/connection works, we get a specific DB warning
      if (error.code === "PGRST116" || error.message.includes("does not exist")) {
        console.log("\n\x1b[32m✔ Connection to Supabase API was Successful!\x1b[0m");
        console.log("The API responded correctly, but the 'user' table has not been created or schema was not applied yet.");
        console.log("DB Notice details:", error.code, "-", error.message);
      } else {
        throw error;
      }
    } else {
      console.log("\n\x1b[32m✔ Connection to Supabase API was Successful!\x1b[0m");
      console.log("Successfully connected and queried 'user' table. Returned records count:", data?.length);
    }
    process.exit(0);
  } catch (err: any) {
    console.error("\n\x1b[31m✖ Connection to Supabase Failed:\x1b[0m");
    if (err && err.message) {
      console.error("Error Message:", err.message);
    } else {
      console.error(err);
    }
    process.exit(1);
  }
}

testConnection();
