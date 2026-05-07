import { google } from "googleapis";
import prisma from "@/lib/db/prisma";

async function getSheetsClient(restaurantId: string) {
  const integration = await prisma.integration.findFirst({
    where: { restaurantId, type: "google_sheets", isActive: true },
  });

  if (!integration?.config) {
    throw new Error("Google Sheets not connected for this restaurant");
  }

  const config = integration.config as { accessToken: string; refreshToken?: string; spreadsheetId?: string };

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );

  oauth2Client.setCredentials({
    access_token: config.accessToken,
    refresh_token: config.refreshToken,
  });

  return {
    sheets: google.sheets({ version: "v4", auth: oauth2Client }),
    spreadsheetId: config.spreadsheetId || process.env.GOOGLE_SHEETS_SPREADSHEET_ID!,
  };
}

async function ensureLeadsSheet(
  sheets: ReturnType<typeof google.sheets>,
  spreadsheetId: string,
  sheetName: string = "Leads"
): Promise<number> {
  const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId });
  const existing = spreadsheet.data.sheets?.find(
    (s) => s.properties?.title === sheetName
  );

  if (!existing) {
    const addResponse = await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: [
          {
            addSheet: {
              properties: { title: sheetName, gridProperties: { rowCount: 1000, columnCount: 10 } },
            },
          },
        ],
      },
    });

    const newSheet = addResponse.data.replies?.[0]?.addSheet;
    const sheetId = newSheet?.properties?.sheetId || 0;

    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${sheetName}!A1:H1`,
      valueInputOption: "RAW",
      requestBody: {
        values: [["Name", "Email", "Phone", "Inquiry", "Timestamp", "Score", "Status", "Source"]],
      },
    });

    return sheetId;
  }

  return existing.properties?.sheetId || 0;
}

export async function saveLeadToSheets(params: {
  restaurantId: string;
  name: string;
  email: string;
  phone: string;
  inquiry: string;
  timestamp: string;
  score: number;
  summary?: string;
  source?: string;
}): Promise<{ rowNumber: number }> {
  const { sheets, spreadsheetId } = await getSheetsClient(params.restaurantId);

  await ensureLeadsSheet(sheets, spreadsheetId);

  const response = await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: "Leads!A:H",
    valueInputOption: "USER_ENTERED",
    insertDataOption: "INSERT_ROWS",
    requestBody: {
      values: [
        [
          params.name,
          params.email,
          params.phone,
          params.inquiry,
          params.timestamp,
          params.score,
          "NEW",
          params.source || "chatbot",
        ],
      ],
    },
  });

  const updatedRange = response.data.updates?.updatedRange || "";
  const rowMatch = updatedRange.match(/(\d+)$/);
  const rowNumber = rowMatch ? Number(rowMatch[1]) : 0;

  return { rowNumber };
}

export async function saveReservationToSheets(params: {
  restaurantId: string;
  guestName: string;
  guestEmail?: string;
  guestPhone?: string;
  partySize: number;
  date: string;
  timeSlot: string;
  specialRequests?: string;
  confirmationCode: string;
}): Promise<void> {
  try {
    const { sheets, spreadsheetId } = await getSheetsClient(params.restaurantId);

    const existing = spreadsheetId ? await sheets.spreadsheets.get({ spreadsheetId }) : null;
    const hasReservationsSheet = existing?.data?.sheets?.find(
      (s) => s.properties?.title === "Reservations"
    );

    if (!hasReservationsSheet) {
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: {
          requests: [
            { addSheet: { properties: { title: "Reservations" } } },
          ],
        },
      });
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: "Reservations!A1:I1",
        valueInputOption: "RAW",
        requestBody: {
          values: [["Guest Name", "Email", "Phone", "Party Size", "Date", "Time", "Special Requests", "Confirmation Code", "Created At"]],
        },
      });
    }

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: "Reservations!A:I",
      valueInputOption: "USER_ENTERED",
      insertDataOption: "INSERT_ROWS",
      requestBody: {
        values: [
          [
            params.guestName,
            params.guestEmail || "",
            params.guestPhone || "",
            params.partySize,
            params.date,
            params.timeSlot,
            params.specialRequests || "",
            params.confirmationCode,
            new Date().toISOString(),
          ],
        ],
      },
    });
  } catch (err) {
    console.error("Failed to save reservation to Sheets:", err);
  }
}

export async function updateLeadStatus(
  restaurantId: string,
  rowNumber: number,
  status: string
): Promise<void> {
  const { sheets, spreadsheetId } = await getSheetsClient(restaurantId);
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `Leads!G${rowNumber}`,
    valueInputOption: "RAW",
    requestBody: { values: [[status]] },
  });
}
