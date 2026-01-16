// cron/subscriptionExpiry.cron.js
import cron from "node-cron";
import GymClient from "../models/gym.model/client.model.js";

cron.schedule(
  "12 10 * * *", // runs daily at midnight
  async () => {
    try {
      const today = todayDDMMYYYY();

      console.log("Running daily subscription expiry check:", today);

      await GymClient.updateMany(
        {
          "sub_details.sub_status": true,
          "sub_details.sub_paused": false,
          $expr: {
            $lt: [
              {
                $dateFromString: {
                  dateString: "$sub_details.sub_date",
                  format: "%d/%m/%Y",
                },
              },
              new Date(),
            ],
          },
        },
        {
          $set: { "sub_details.sub_status": false },
        }
      );

      // 🔴 PT expiry
      await GymClient.updateMany(
        {
          "sub_details.pt_status": true,
          "sub_details.sub_paused": false,
          $expr: {
            $lt: [
              {
                $dateFromString: {
                  dateString: "$sub_details.pt_date",
                  format: "%d/%m/%Y",
                },
              },
              new Date(),
            ],
          },
        },
        {
          $set: { "sub_details.pt_status": false },
        }
      );

      // 🔴 Boxing expiry
      await GymClient.updateMany(
        {
          "sub_details.boxing": true,
          "sub_details.sub_paused": false,
          $expr: {
            $lt: [
              {
                $dateFromString: {
                  dateString: "$sub_details.bx_date",
                  format: "%d/%m/%Y",
                },
              },
              new Date(),
            ],
          },
        },
        {
          $set: { "sub_details.boxing": false },
        }
      );

      console.log("Daily expiry check completed", new Date().toString());
    } catch (error) {
      console.error("CRON error:", error.message);
    }
  },
  {
    timezone: "Africa/Lagos", // change if needed
  }
);

// utils/date.js
export const todayDDMMYYYY = () => {
  const now = new Date();
  const d = String(now.getDate()).padStart(2, "0");
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const y = now.getFullYear();
  return `${d}/${m}/${y}`;
};
