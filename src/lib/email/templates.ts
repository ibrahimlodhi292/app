interface ReservationConfirmationParams {
  guestName: string;
  restaurantName: string;
  date: string;
  time: string;
  partySize: number;
  confirmationCode: string;
  specialRequests?: string;
  restaurantPhone?: string;
  restaurantAddress?: string;
}

export function reservationConfirmationTemplate(p: ReservationConfirmationParams): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Reservation Confirmed</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #0f0f0f; color: #e5e5e5; }
  .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
  .card { background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); border: 1px solid rgba(99, 102, 241, 0.3); border-radius: 16px; overflow: hidden; }
  .header { background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 40px; text-align: center; }
  .header h1 { color: #fff; font-size: 28px; font-weight: 700; margin-bottom: 8px; }
  .header p { color: rgba(255,255,255,0.8); font-size: 16px; }
  .checkmark { width: 60px; height: 60px; background: rgba(255,255,255,0.2); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; font-size: 28px; }
  .body { padding: 40px; }
  .greeting { font-size: 18px; color: #e5e5e5; margin-bottom: 24px; }
  .details-card { background: rgba(99, 102, 241, 0.1); border: 1px solid rgba(99, 102, 241, 0.2); border-radius: 12px; padding: 24px; margin-bottom: 24px; }
  .detail-row { display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.05); }
  .detail-row:last-child { border-bottom: none; }
  .detail-label { color: #9ca3af; font-size: 14px; font-weight: 500; }
  .detail-value { color: #e5e5e5; font-size: 14px; font-weight: 600; }
  .confirmation-code { background: linear-gradient(135deg, #6366f1, #8b5cf6); border-radius: 8px; padding: 16px; text-align: center; margin-bottom: 24px; }
  .confirmation-code p { color: rgba(255,255,255,0.7); font-size: 12px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px; }
  .confirmation-code h2 { color: #fff; font-size: 24px; font-weight: 800; letter-spacing: 4px; }
  .footer-note { color: #6b7280; font-size: 13px; line-height: 1.6; margin-bottom: 32px; }
  .footer { border-top: 1px solid rgba(255,255,255,0.05); padding-top: 24px; text-align: center; color: #4b5563; font-size: 12px; }
</style>
</head>
<body>
<div class="container">
  <div class="card">
    <div class="header">
      <div class="checkmark">✓</div>
      <h1>Reservation Confirmed!</h1>
      <p>We can't wait to see you, ${p.guestName}!</p>
    </div>
    <div class="body">
      <p class="greeting">Your table at <strong>${p.restaurantName}</strong> has been successfully reserved.</p>

      <div class="details-card">
        <div class="detail-row">
          <span class="detail-label">📅 Date</span>
          <span class="detail-value">${new Date(p.date).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">🕐 Time</span>
          <span class="detail-value">${p.time}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">👥 Party Size</span>
          <span class="detail-value">${p.partySize} ${p.partySize === 1 ? "Guest" : "Guests"}</span>
        </div>
        ${p.specialRequests ? `
        <div class="detail-row">
          <span class="detail-label">📝 Special Requests</span>
          <span class="detail-value">${p.specialRequests}</span>
        </div>` : ""}
        ${p.restaurantAddress ? `
        <div class="detail-row">
          <span class="detail-label">📍 Address</span>
          <span class="detail-value">${p.restaurantAddress}</span>
        </div>` : ""}
        ${p.restaurantPhone ? `
        <div class="detail-row">
          <span class="detail-label">📞 Phone</span>
          <span class="detail-value">${p.restaurantPhone}</span>
        </div>` : ""}
      </div>

      <div class="confirmation-code">
        <p>Confirmation Code</p>
        <h2>${p.confirmationCode.toUpperCase().slice(0, 8)}</h2>
      </div>

      <p class="footer-note">
        Please save this confirmation code. To modify or cancel your reservation, reply to this email or call us directly. We appreciate 24-hour notice for cancellations.
      </p>
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} ${p.restaurantName} • Powered by Restaurant AI</p>
    </div>
  </div>
</div>
</body>
</html>`;
}

export function leadNotificationTemplate(params: {
  restaurantName: string;
  leadName: string;
  leadEmail: string;
  leadPhone: string;
  inquiry: string;
  score: number;
  conversationUrl?: string;
}): string {
  const scoreColor = params.score >= 70 ? "#22c55e" : params.score >= 40 ? "#f59e0b" : "#ef4444";
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<style>
  body { font-family: -apple-system, sans-serif; background: #0f0f0f; color: #e5e5e5; margin: 0; padding: 0; }
  .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
  .card { background: #1a1a2e; border: 1px solid rgba(99,102,241,0.3); border-radius: 16px; overflow: hidden; }
  .header { background: linear-gradient(135deg, #1e3a5f, #1a1a2e); padding: 32px; border-bottom: 1px solid rgba(99,102,241,0.2); }
  .header h1 { color: #fff; font-size: 22px; margin: 0; }
  .body { padding: 32px; }
  .field { margin-bottom: 16px; }
  .label { color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px; }
  .value { color: #e5e5e5; font-size: 16px; }
  .score-badge { display: inline-block; background: ${scoreColor}20; color: ${scoreColor}; border: 1px solid ${scoreColor}40; padding: 4px 12px; border-radius: 20px; font-size: 14px; font-weight: 700; }
  .btn { display: inline-block; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: #fff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; margin-top: 24px; }
</style>
</head>
<body>
<div class="container">
  <div class="card">
    <div class="header">
      <h1>🎯 New Lead — ${params.restaurantName}</h1>
    </div>
    <div class="body">
      <div class="field"><div class="label">Name</div><div class="value">${params.leadName}</div></div>
      <div class="field"><div class="label">Email</div><div class="value">${params.leadEmail}</div></div>
      <div class="field"><div class="label">Phone</div><div class="value">${params.leadPhone || "Not provided"}</div></div>
      <div class="field"><div class="label">Inquiry</div><div class="value">${params.inquiry}</div></div>
      <div class="field"><div class="label">Lead Score</div><div class="value"><span class="score-badge">${params.score}/100</span></div></div>
      ${params.conversationUrl ? `<a href="${params.conversationUrl}" class="btn">View Conversation →</a>` : ""}
    </div>
  </div>
</div>
</body>
</html>`;
}
