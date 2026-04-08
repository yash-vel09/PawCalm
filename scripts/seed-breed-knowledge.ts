import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";

// Load .env.local
const envPath = path.resolve(__dirname, "../.env.local");
const envContent = fs.readFileSync(envPath, "utf-8");
for (const line of envContent.split("\n")) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) continue;
  const eqIndex = trimmed.indexOf("=");
  if (eqIndex === -1) continue;
  const key = trimmed.slice(0, eqIndex);
  const value = trimmed.slice(eqIndex + 1);
  if (!process.env[key]) {
    process.env[key] = value;
  }
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY!;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !OPENAI_API_KEY) {
  console.error(
    "Missing required env vars: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, OPENAI_API_KEY"
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

interface BreedEntry {
  breed_id: string;
  species: string;
  breed_name: string;
  breed_group: string;
  size_category: string;
  weight_range_lbs: { min: number; max: number };
  life_expectancy_years: { min: number; max: number };
  senior_age_starts: number;
  health_predispositions: unknown[];
  behavioral_traits: Record<string, unknown>;
  age_specific_concerns: Record<string, string>;
  breed_specific_red_flags: string[];
  common_medications: unknown[];
  symptom_keywords: string[];
  embedding_text: string;
}

async function getEmbedding(text: string): Promise<number[]> {
  const response = await fetch("https://api.openai.com/v1/embeddings", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      input: text,
      model: "text-embedding-3-small",
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenAI API error (${response.status}): ${error}`);
  }

  const data = await response.json();
  return data.data[0].embedding;
}

async function main() {
  const dataDir = path.resolve(__dirname, "../data");
  const files = [
    "pawcalm_breed_knowledge_batch1_dogs_1_25.json",
    "pawcalm_breed_knowledge_batch2_dogs_26_50_plus_fallbacks.json",
    "pawcalm_breed_knowledge_batch3_remaining_dogs_and_cats.json",
  ];

  // Load all entries
  const allEntries: BreedEntry[] = [];
  for (const file of files) {
    const filePath = path.join(dataDir, file);
    const content = fs.readFileSync(filePath, "utf-8");
    const entries: BreedEntry[] = JSON.parse(content);
    console.log(`Loaded ${entries.length} entries from ${file}`);
    allEntries.push(...entries);
  }

  console.log(`\nTotal entries to process: ${allEntries.length}\n`);

  let successful = 0;
  let failed = 0;

  for (let i = 0; i < allEntries.length; i++) {
    const entry = allEntries[i];
    const label = `${i + 1}/${allEntries.length}: ${entry.breed_name}`;

    try {
      console.log(`Processing ${label}...`);

      // Generate embedding
      const embedding = await getEmbedding(entry.embedding_text);

      // Insert into Supabase
      const { error } = await supabase.from("breed_knowledge").upsert(
        {
          breed_id: entry.breed_id,
          species: entry.species,
          breed_name: entry.breed_name,
          breed_group: entry.breed_group,
          size_category: entry.size_category,
          weight_range_lbs: entry.weight_range_lbs,
          life_expectancy_years: entry.life_expectancy_years,
          senior_age_starts: entry.senior_age_starts,
          health_predispositions: entry.health_predispositions,
          behavioral_traits: entry.behavioral_traits,
          age_specific_concerns: entry.age_specific_concerns,
          breed_specific_red_flags: entry.breed_specific_red_flags,
          common_medications: entry.common_medications,
          symptom_keywords: entry.symptom_keywords,
          embedding_text: entry.embedding_text,
          embedding: embedding,
        },
        { onConflict: "breed_id" }
      );

      if (error) {
        throw new Error(`Supabase insert error: ${error.message}`);
      }

      successful++;
      console.log(`  ✓ ${entry.breed_name} (${embedding.length}d vector)`);
    } catch (err) {
      failed++;
      console.error(
        `  ✗ Failed ${label}: ${err instanceof Error ? err.message : err}`
      );
    }
  }

  console.log("\n========== SUMMARY ==========");
  console.log(`Total processed: ${allEntries.length}`);
  console.log(`Successful:      ${successful}`);
  console.log(`Failed:          ${failed}`);
  console.log("=============================");
}

main();
