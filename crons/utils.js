import GymClient from "../models/gym.model/client.model.js";
import GymIncome from "../models/gym.model/gym_income.model.js";
import GymHMO from "../models/gym.model/hmo.model.js";

import fs from "fs";
import path from "path";

/**
 * Migrates Firebase JSON to MongoDB
 * @param {Object} firebaseJson
 * @returns {Array<{ old_key: string, new_key: string }>}
 */
const migrateClientsToMongo = async (firebaseJson) => {
  const keyMap = [];

  for (const [firebaseKey, data] of Object.entries(firebaseJson)) {
    try {
      // Prevent duplicates
      const exists = await GymClient.findOne({ client_id: firebaseKey });
      if (exists) {
        keyMap.push({
          old_key: firebaseKey,
          new_key: exists._id.toString(),
        });
        continue;
      }

      const client = new GymClient({
        client_id: data.id,

        reg_date: data.reg_date,
        registration_dates: data.registration_dates,
        registered: data.registered,
        user_status: data.user_status,
        user_image: data.user_image,

        client_details: {
          f_name: data.f_name,
          m_name: data.m_name,
          l_name: data.l_name,
        },

        contact_details: {
          phone_1: data.phone_1,
          phone_2: data.phone_2,
          email: data.email,
          address: data.address,
          ig_user: data.ig_user,
          fb_user: data.fb_user,
        },

        personal_details: {
          gender: data.gender,
          dob: data.dob,
          show_age: data.show_age,
          occupation: data.occupation,
        },

        sub_details: {
          sub_type: data.sub_type,
          sub_plan: data.sub_plan,
          sub_status: data.sub_status,
          sub_date: data.sub_date,
          pt_plan: data.pt_plan,
          pt_status: data.pt_status,
          pt_date: data.pt_date,
          boxing: data.boxing,
          sub_paused: data.sub_paused,
        },

        program_details: {
          program_type_select: data.program_type_select,
          corporate_type_select: data.corporate_type_select,
          company_name: data.company_name,
          hmo: data.hmo,
          hmo_id: data.hmo_id,
          hykau: data.hykau,
          hykau_others: data.hykau_others,
        },

        sub_income: data.sub_income,
        baseline_done: data.baseline_done,
        physio_cl: data.physio_cl,
        physio_key: data.physio_key,

        sub_history: Array.isArray(data.sub_history)
          ? data.sub_history.map((h) => ({
              sub_plan: h.sub_plan,
              sub_type: h.sub_type ?? "-",
              sub_date: h.sub_date,
              exp_date: h.exp_date,
              amount: h.amount,
              extras_amount: h.extras_amount ?? 0,
              boxing: h.boxing,
              pt_status: h.pt_status,
              pt_plan: h.pt_plan,
              hist_type: h.hist_type,
              time_stamp: h.time_stamp,
              history_id: h.history_id ?? "-",
              sub_amount_b4_discount: h.sub_amount_b4_discount ?? null,
            }))
          : [],
      });

      const saved = await client.save();

      keyMap.push({
        old_key: firebaseKey,
        new_key: saved._id.toString(),
      });
    } catch (err) {
      console.error(`❌ Failed for client ${firebaseKey}`, err.message);
    }
  }

  return keyMap;
};

/**
 * Replace client_key in history array with new_key from mapping
 * @param {Array} keyMap - [{ old_key, new_key }]
 * @param {Array} historyData - [{ client_key, ... }]
 * @returns {Array} new array with updated client_key and old_client_key field
 */
function replaceClientKeys(keyMap, historyData) {
  const lookup = keyMap.reduce((acc, item) => {
    acc[item.old_key] = item.new_key;
    return acc;
  }, {});

  return historyData.map((entry) => {
    const oldKey = entry.client_key;
    if (lookup[oldKey]) {
      return {
        ...entry,
        old_client_key: oldKey,
        client_key: lookup[oldKey],
      };
    } else {
      return { ...entry };
    }
  });
}

// --- Main Function ---
function processHistoryFiles() {
  // 1️⃣ Read key map from JSON file
  const keyMapPath = path.resolve("./crons/client_key_map.json");
  const keyMap = JSON.parse(fs.readFileSync(keyMapPath, "utf-8"));

  // 2️⃣ Read history data from JSON file
  const historyPath = path.resolve("./crons/sub.json");
  const historyData = JSON.parse(fs.readFileSync(historyPath, "utf-8"));

  // 3️⃣ Replace client keys
  const updatedHistory = replaceClientKeys(keyMap, historyData);

  // 4️⃣ Print to console (optional)
  console.log(JSON.stringify(updatedHistory, null, 2));

  // 5️⃣ Save to new JSON file
  const outputPath = path.resolve("./crons/updated_history.json");
  fs.writeFileSync(
    outputPath,
    JSON.stringify(updatedHistory, null, 2),
    "utf-8"
  );
  console.log(`✅ Updated history saved to ${outputPath}`);
}

export const parseDDMMYYYYToISO = (dateStr) => {
  if (!dateStr || typeof dateStr !== "string") return null;

  const [day, month, year] = dateStr.split("/").map(Number);

  if (!day || !month || !year) return null;

  // Month is 0-based in JS Date
  return new Date(Date.UTC(year, month - 1, day));
};

/**
 * Insert JSON data into GymIncome collection safely
 * @param {Array} incomeList - JSON array of income objects
 */
export async function importGymIncome(incomeList) {
  if (!Array.isArray(incomeList)) {
    throw new Error("incomeList must be an array");
  }

  console.log(`Starting import of ${incomeList.length} records...`);

  let successCount = 0;
  let failCount = 0;

  for (const entry of incomeList) {
    try {
      // Convert string dates to actual Date objects
      const subDate = entry.sub_date
        ? parseDDMMYYYYToISO(entry.sub_date)
        : null;
      const expDate = entry.exp_date
        ? parseDDMMYYYYToISO(entry.exp_date)
        : null;

      const doc = new GymIncome({
        client_key: entry.client_key,
        hist_type: entry.hist_type,
        amount: entry.amount ?? 0,
        extras_amount: entry.extras_amount ?? 0,
        sub_amount_b4_discount: entry.sub_amount_b4_discount ?? 0,
        sub_plan: entry.sub_plan,
        sub_type: entry.sub_type,
        sub_date: subDate,
        exp_date: expDate,
        boxing: entry.boxing ?? false,
        pt_status: entry.pt_status ?? false,
      });

      await doc.save();
      successCount++;
    } catch (err) {
      failCount++;
      console.error(
        `❌ Failed to insert record for client_key=${entry.client_key}:`,
        err.message
      );
    }
  }

  console.log(
    `✅ Import complete. Success: ${successCount}, Failed: ${failCount}`
  );
}

async function importGymHMO(filePath) {
  try {
    // 2️⃣ Read JSON file
    const rawData = fs.readFileSync(filePath, "utf-8");
    const hmoList = JSON.parse(rawData);

    console.log(`Importing ${hmoList.length} HMO records...`);

    let successCount = 0;
    let failCount = 0;

    // 3️⃣ Loop through each HMO and save
    for (const entry of hmoList) {
      try {
        const doc = new GymHMO({
          hmo_name: entry.hmo_name,
          days_week: entry.days_week,
          hmo_amount: entry.hmo_amount,
        });

        await doc.save();
        successCount++;
      } catch (err) {
        failCount++;
        console.error(
          `❌ Failed to insert HMO '${entry.hmo_name}': ${err.message}`
        );
      }
    }

    console.log(
      `✅ Import complete. Success: ${successCount}, Failed: ${failCount}`
    );
  } catch (err) {
    console.error("Fatal error:", err);
  }
}

/**
 * Saves data to a JSON file
 * @param {string} fileName - e.g. "key_map.json"
 * @param {any} data - any JSON-serializable data
 */
const saveJsonToFile = (fileName, data) => {
  const filePath = path.resolve(process.cwd(), fileName);

  fs.writeFileSync(
    filePath,
    JSON.stringify(data, null, 2), // pretty print
    "utf-8"
  );

  console.log(`✅ Saved JSON to ${filePath}`);
};

export const runDB = async () => {
  const firebaseData = JSON.parse(
    fs.readFileSync("./crons/clients_export.json", "utf-8")
  );

  const keyMap = await migrateClientsToMongo(firebaseData);

  saveJsonToFile("./crons/client_key_map.json", keyMap);
};

export const runDB2 = async () => {
  // Run the function
  processHistoryFiles();
};

export const runDB3 = async () => {
  // Read JSON file
  const rawData = fs.readFileSync("./crons/updated_history.json", "utf-8");
  const incomeList = JSON.parse(rawData);

  // Import to MongoDB
  await importGymIncome(incomeList);
};

export const runDB4 = async () => {
  // Run the import
  importGymHMO("./crons/gymhmo.json");
};
