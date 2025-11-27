// // api/send-otp.js
// import fetch from "node-fetch";

// export default async function handler(req, res) {
//   res.setHeader("Access-Control-Allow-Origin", "*");
//   res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
//   res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
//   res.setHeader("Content-Type", "application/json");

//   if (req.method === "OPTIONS") return res.status(200).end();
//   if (req.method !== "POST") {
//     return res.status(405).json({
//       error: "Method not allowed",
//       allowed: ["POST"],
//       received: req.method,
//     });
//   }

//   // Parse JSON body
//   let jsonData;
//   try {
//     const buffers = [];
//     for await (const chunk of req) buffers.push(chunk);
//     const rawBody = Buffer.concat(buffers).toString();
//     jsonData = JSON.parse(rawBody);
//   } catch (err) {
//     return res.status(400).json({
//       error: "Invalid JSON in request body",
//       details: err.message,
//     });
//   }

//   const { email } = jsonData;
//   if (!email) return res.status(400).json({ error: "Email is required" });

//   const otp = Math.floor(100000 + Math.random() * 900000);
//   console.log(`📧 Sending OTP ${otp} to ${email} send-otp`);

//   try {
//     // 🔐 Get Microsoft Graph access token
//     const tenantId = process.env.VITE_TENANT_ID;
//     const clientId = process.env.VITE_CLIENT_ID;
//     const clientSecret = process.env.VITE_CLIENT_SECRET;
//     const senderEmail = process.env.VITE_SENDER_EMAIL;

//     const tokenRes = await fetch(
//       `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`,
//       {
//         method: "POST",
//         headers: { "Content-Type": "application/x-www-form-urlencoded" },
//         body: new URLSearchParams({
//           client_id: clientId,
//           client_secret: clientSecret,
//           scope: "https://graph.microsoft.com/.default",
//           grant_type: "client_credentials",
//         }),
//       }
//     );

//     const tokenData = await tokenRes.json();
//     if (!tokenData.access_token) {
//       console.error("Failed to get access token", tokenData);
//       return res.status(500).json({ error: "Failed to authenticate with Microsoft Graph" });
//     }

//     const accessToken = tokenData.access_token;

//     // 📩 Send email through Microsoft Graph API
//     const messageBody = {
//       message: {
//         subject: "Your One-Time Password (OTP) – careercast",
//         body: {
//           contentType: "HTML",
//           content: `
//             <div style="font-family: Arial; line-height: 1.5;">
//               <h2 style="color: #0078d4;">careercast OTP Verification</h2>
//               <p>Hi,</p>
//               <p>Your OTP for verification is:</p>
//               <h1 style="letter-spacing: 2px;">${otp}</h1>
//               <p>This OTP is valid for 10 minutes.</p>
//               <p>Best regards,<br/>careercast Team</p>
//             </div>
//           `,
//         },
//         toRecipients: [{ emailAddress: { address: email } }],
//       },
//       saveToSentItems: "false",
//     };

//     const mailRes = await fetch(
//       `https://graph.microsoft.com/v1.0/users/${senderEmail}/sendMail`,
//       {
//         method: "POST",
//         headers: {
//           Authorization: `Bearer ${accessToken}`,
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify(messageBody),
//       }
//     );

//     if (!mailRes.ok) {
//       const errText = await mailRes.text();
//       throw new Error(`Email send failed: ${errText}`);
//     }

//     return res.status(200).json({
//       success: true,
//       message: "OTP sent successfully via Microsoft Graph.",
//     });
//   } catch (error) {
//     console.error("❌ Error sending OTP:", error);
//     return res.status(500).json({
//       error: "Failed to send OTP email",
//       details: error.message,
//     });
//   }
// }


// // api/send-otp.js
// import fetch from "node-fetch";

// /**
//  * In-memory OTP store: email -> { otp: string, expiresAt: number, lastSentAt: number }
//  * NOTE: This is ephemeral (serverless cold starts clear it).
//  * That's OK per your requirement: no DB changes, single file only.
//  */
// const otpStore = new Map();

// /** Small helpers */
// const now = () => Date.now();
// const minutes = (n) => n * 60 * 1000;
// const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v || "");

// /** Safely parse JSON from Node/Express-style req stream */
// async function parseJSONBody(req) {
//   const chunks = [];
//   for await (const chunk of req) chunks.push(chunk);
//   const raw = Buffer.concat(chunks).toString();
//   return JSON.parse(raw || "{}");
// }

// /** Get Microsoft Graph access token (Application flow) */
// async function getMsGraphAccessToken() {
//   const tenantId = process.env.VITE_TENANT_ID;
//   const clientId = process.env.VITE_CLIENT_ID;
//   const clientSecret = process.env.VITE_CLIENT_SECRET;

//   if (!tenantId || !clientId || !clientSecret) {
//     return null; // missing config => use mock mode
//   }

//   const res = await fetch(
//     `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`,
//     {
//       method: "POST",
//       headers: { "Content-Type": "application/x-www-form-urlencoded" },
//       body: new URLSearchParams({
//         client_id: clientId,
//         client_secret: clientSecret,
//         scope: "https://graph.microsoft.com/.default",
//         grant_type: "client_credentials",
//       }),
//     }
//   );

//   const data = await res.json();
//   if (!res.ok || !data.access_token) {
//     console.error("❌ Failed to fetch MS Graph token:", data);
//     return null;
//   }
//   return data.access_token;
// }

// /** Send email via Microsoft Graph (or mock if missing env) */
// async function sendOtpEmail({ to, otp }) {
//   const senderEmail = process.env.VITE_SENDER_EMAIL;
//   const accessToken = await getMsGraphAccessToken();

//   // Mock mode if we can't send real email (useful for local/dev)
//   if (!accessToken || !senderEmail) {
//     console.log(`📧 [MOCK EMAIL] To: ${to} | OTP: ${otp}`);
//     return { ok: true, mock: true };
//   }

//   const messageBody = {
//     message: {
//       subject: "Your One-Time Password (OTP) – careercast",
//       body: {
//         contentType: "HTML",
//         content: `
//           <div style="font-family: Arial; line-height:1.6;">
//             <h2 style="color:#0078D4;margin:0 0 8px;">careercast OTP Verification</h2>
//             <p>Your OTP for verification is:</p>
//             <h1 style="letter-spacing:2px;margin:8px 0 12px;">${otp}</h1>
//             <p>This OTP is valid for <strong>10 minutes</strong>.</p>
//             <p style="margin-top:16px;">Best regards,<br/>careercast Team</p>
//           </div>
//         `,
//       },
//       toRecipients: [{ emailAddress: { address: to } }],
//     },
//     saveToSentItems: false,
//   };

//   const res = await fetch(
//     `https://graph.microsoft.com/v1.0/users/${senderEmail}/sendMail`,
//     {
     
//  method: "POST",
//       headers: {
//         Authorization: `Bearer ${accessToken}`,
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify(messageBody),
//     }
//   );

//   if (!res.ok) {
//     const text = await res.text();
//     console.error("❌ Graph sendMail error:", text);
//     return { ok: false, error: text };
//   }
//   return { ok: true };
// }

// /** Create CORS headers */
// function setCors(res) {
//   res.setHeader("Access-Control-Allow-Origin", "*");
//   res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
//   res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
//   res.setHeader("Content-Type", "application/json");
// }

// /** Main handler */
// export default async function handler(req, res) {
//   setCors(res);

//   if (req.method === "OPTIONS") return res.status(200).end();
//   if (req.method !== "POST") {
//     return res.status(405).json({
//       error: "Method not allowed",
//       allowed: ["POST"],
//       received: req.method,
//     });
//   }

//   // Parse body
//   let body;
//   try {
//     body = await parseJSONBody(req);
//   } catch (e) {
//     return res.status(400).json({
//       error: "Invalid JSON in request body",
//       details: e?.message || "JSON.parse failed",
//     });
//   }

//   const { email, otp, action } = body || {};
//   if (!email || !action) {
//     return res.status(400).json({ error: "Email and action are required" });
//   }
//   if (!isEmail(email)) {
//     return res.status(400).json({ error: "Invalid email format" });
//   }

//   // Configuration
//   const OTP_TTL_MS = minutes(10);
//   const RESEND_COOLDOWN_MS = 30 * 1000; // prevent spamming (30s)

//   /** ACTION: SEND */
//   if (action === "send") {
//     // Rate limit per email
//     const existing = otpStore.get(email);
//     if (existing && now() - (existing.lastSentAt || 0) < RESEND_COOLDOWN_MS) {
//       const waitMs = RESEND_COOLDOWN_MS - (now() - existing.lastSentAt);
//       return res.status(429).json({
//         error: "Too many requests",
//         message: `Please wait ${Math.ceil(waitMs / 1000)}s before requesting a new OTP.`,
//       });
//     }

//     const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
//     const expiresAt = now() + OTP_TTL_MS;

//     // Save in memory
//     otpStore.set(email, { otp: generatedOtp, expiresAt, lastSentAt: now() });

//     // Send email (or mock)
//     const sent = await sendOtpEmail({ to: email, otp: generatedOtp });
//     if (!sent.ok) {
//       // cleanup on failure so user can retry
//       otpStore.delete(email);
//       return res.status(500).json({
//         error: "Failed to send OTP email",
//         details: sent.error || "Unknown email send error",
//       });
//     }

//     console.log(`📨 OTP ${generatedOtp} sent to ${email} (expires in 10 mins)`);

//     return res.status(200).json({
//       success: true,
//       message: sent.mock
//         ? "OTP generated (mock mode). Check server logs in development."
//         : "OTP sent successfully.",
//       // developmentOtp: generatedOtp, // uncomment ONLY in dev if you want to show it
//     });
//   }

//   /** ACTION: VERIFY */
//   if (action === "verify") {
//     if (!otp) {
//       return res.status(400).json({ error: "OTP is required for verification" });
//     }

//     const record = otpStore.get(email);
//     if (!record) {
//       return res.status(400).json({
//         success: false,
//         message: "OTP not found or expired. Please request a new OTP.",
//       });
//     }

//     if (now() > record.expiresAt) {
//       otpStore.delete(email);
//       return res.status(400).json({ success: false, message: "OTP expired. Please request a new one." });
//     }

//     if (record.otp !== String(otp)) {
//       return res.status(400).json({ success: false, message: "Invalid OTP" });
//     }

//     // Success → clear it
//     otpStore.delete(email);
//     return res.status(200).json({ success: true, message: "OTP verified successfully" });
//   }

//   // Unknown action
//   return res.status(400).json({ error: "Invalid action. Use 'send' or 'verify'." });
// }

// api/send-otp.js










// import fetch from "node-fetch";

// // Temporary in-memory store
// const otpStore = new Map();

// const now = () => Date.now();
// const minutes = (n) => n * 60 * 1000;

// function setCors(res) {
//   res.setHeader("Access-Control-Allow-Origin", "*");
//   res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
//   res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
//   res.setHeader("Content-Type", "application/json");
// }

// export default async function handler(req, res) {
//   setCors(res);

//   if (req.method === "OPTIONS") return res.status(200).end();
//   if (req.method !== "POST")
//     return res.status(405).json({ error: "Method not allowed" });

//   // Parse request body
//   let body;
//   try {
//     const chunks = [];
//     for await (const chunk of req) chunks.push(chunk);
//     body = JSON.parse(Buffer.concat(chunks).toString());
//   } catch (err) {
//     return res.status(400).json({ error: "Invalid JSON", details: err.message });
//   }

//   const { action, email, otp } = body;
//   if (!action || !email)
//     return res.status(400).json({ error: "Missing required fields" });

//   // 📤 ACTION: SEND
//   if (action === "send") {
//     const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
//     const expiresAt = now() + minutes(10);

//     otpStore.set(email, { otp: generatedOtp, expiresAt });
//     console.log(`📧 Sending OTP ${generatedOtp} to ${email}`);

//     // Fetch Microsoft Graph Access Token
//     const tenantId = process.env.VITE_TENANT_ID;
//     const clientId = process.env.VITE_CLIENT_ID;
//     const clientSecret = process.env.VITE_CLIENT_SECRET;
//     const senderEmail = process.env.VITE_SENDER_EMAIL;

//     try {
//       const tokenRes = await fetch(
//         `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`,
//         {
//           method: "POST",
//           headers: { "Content-Type": "application/x-www-form-urlencoded" },
//           body: new URLSearchParams({
//             client_id: clientId,
//             client_secret: clientSecret,
//             scope: "https://graph.microsoft.com/.default",
//             grant_type: "client_credentials",
//           }),
//         }
//       );
//       const tokenData = await tokenRes.json();
//       if (!tokenData.access_token)
//         throw new Error("Failed to obtain Microsoft Graph token");

//       const accessToken = tokenData.access_token;

//       const mailRes = await fetch(
//         `https://graph.microsoft.com/v1.0/users/${senderEmail}/sendMail`,
//         {
//           method: "POST",
//           headers: {
//             Authorization: `Bearer ${accessToken}`,
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify({
//             message: {
//               subject: "Your One-Time Password (OTP) – careercast",
//               body: {
//                 contentType: "HTML",
//                 content: `
//                   <div style="font-family:Arial;line-height:1.6;">
//                     <h2 style="color:#0078D4;">careercast OTP Verification</h2>
//                     <p>Your OTP for verification is:</p>
//                     <h1>${generatedOtp}</h1>
//                     <p>This OTP is valid for 10 minutes.</p>
//                     <p>Best regards,<br/>careercast Team</p>
//                   </div>
//                 `,
//               },
//               toRecipients: [{ emailAddress: { address: email } }],
//             },
//             saveToSentItems: false,
//           }),
//         }
//       );

//       if (!mailRes.ok) {
//         const text = await mailRes.text();
//         throw new Error(`Email send failed: ${text}`);
//       }

//       return res.status(200).json({
//         success: true,
//         message: "OTP sent successfully",
//       });
//     } catch (err) {
//       console.error("Error sending OTP:", err);
//       return res.status(500).json({ error: "Failed to send OTP", details: err.message });
//     }
//   }

//   // ✅ ACTION: VERIFY
//   if (action === "verify") {
//     const record = otpStore.get(email);
//     if (!record)
//       return res.status(400).json({ success: false, message: "OTP not found or expired" });

//     if (now() > record.expiresAt) {
//       otpStore.delete(email);
//       return res.status(400).json({ success: false, message: "OTP expired" });
//     }

//     if (record.otp !== otp)
//       return res.status(400).json({ success: false, message: "Invalid OTP" });

//     otpStore.delete(email);
//     return res.status(200).json({ success: true, message: "OTP verified successfully" });
//   }

//   return res.status(400).json({ error: "Invalid action" });
// }







// // api/send-otp.js
// import fetch from "node-fetch";

// export default async function handler(req, res) {
//   res.setHeader("Access-Control-Allow-Origin", "*");
//   res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
//   res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
//   res.setHeader("Content-Type", "application/json");

//   if (req.method === "OPTIONS") return res.status(200).end();
//   if (req.method !== "POST") {
//     return res.status(405).json({
//       error: "Method not allowed",
//       allowed: ["POST"],
//       received: req.method,
//     });
//   }

//   // Parse JSON body
//   let jsonData;
//   try {
//     const buffers = [];
//     for await (const chunk of req) buffers.push(chunk);
//     const rawBody = Buffer.concat(buffers).toString();
//     jsonData = JSON.parse(rawBody);
//   } catch (err) {
//     return res.status(400).json({
//       error: "Invalid JSON in request body",
//       details: err.message,
//     });
//   }

//   const { email } = jsonData;
//   if (!email) return res.status(400).json({ error: "Email is required" });

//   const otp = Math.floor(100000 + Math.random() * 900000);
//   console.log(`📧 Sending OTP ${otp} to ${email} send-otp`);

//   try {
//     // 🔐 Get Microsoft Graph access token
//     const tenantId = process.env.VITE_TENANT_ID;
//     const clientId = process.env.VITE_CLIENT_ID;
//     const clientSecret = process.env.VITE_CLIENT_SECRET;
//     const senderEmail = process.env.VITE_SENDER_EMAIL;

//     const tokenRes = await fetch(
//       `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`,
//       {
//         method: "POST",
//         headers: { "Content-Type": "application/x-www-form-urlencoded" },
//         body: new URLSearchParams({
//           client_id: clientId,
//           client_secret: clientSecret,
//           scope: "https://graph.microsoft.com/.default",
//           grant_type: "client_credentials",
//         }),
//       }
//     );

//     const tokenData = await tokenRes.json();
//     if (!tokenData.access_token) {
//       console.error("Failed to get access token", tokenData);
//       return res.status(500).json({ error: "Failed to authenticate with Microsoft Graph" });
//     }

//     const accessToken = tokenData.access_token;

//     // 📩 Send email through Microsoft Graph API
//     const messageBody = {
//       message: {
//         subject: "Your One-Time Password (OTP) – careercast",
//         body: {
//           contentType: "HTML",
//           content: `
//             <div style="font-family: Arial; line-height: 1.5;">
//               <h2 style="color: #0078d4;">careercast OTP Verification</h2>
//               <p>Hi,</p>
//               <p>Your OTP for verification is:</p>
//               <h1 style="letter-spacing: 2px;">${otp}</h1>
//               <p>This OTP is valid for 10 minutes.</p>
//               <p>Best regards,<br/>careercast Team</p>
//             </div>
//           `,
//         },
//         toRecipients: [{ emailAddress: { address: email } }],
//       },
//       saveToSentItems: "false",
//     };

//     const mailRes = await fetch(
//       `https://graph.microsoft.com/v1.0/users/${senderEmail}/sendMail`,
//       {
//         method: "POST",
//         headers: {
//           Authorization: `Bearer ${accessToken}`,
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify(messageBody),
//       }
//     );

//     if (!mailRes.ok) {
//       const errText = await mailRes.text();
//       throw new Error(`Email send failed: ${errText}`);
//     }

//     return res.status(200).json({
//       success: true,
//       message: "OTP sent successfully via Microsoft Graph.",
//     });
//   } catch (error) {
//     console.error("❌ Error sending OTP:", error);
//     return res.status(500).json({
//       error: "Failed to send OTP email",
//       details: error.message,
//     });
//   }
// }


// // // api/send-otp.js
// // import fetch from "node-fetch";

// // /**
// //  * In-memory OTP store: email -> { otp: string, expiresAt: number, lastSentAt: number }
// //  * NOTE: This is ephemeral (serverless cold starts clear it).
// //  * That's OK per your requirement: no DB changes, single file only.
// //  */
// // const otpStore = new Map();

// // /** Small helpers */
// // const now = () => Date.now();
// // const minutes = (n) => n * 60 * 1000;
// // const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v || "");

// // /** Safely parse JSON from Node/Express-style req stream */
// // async function parseJSONBody(req) {
// //   const chunks = [];
// //   for await (const chunk of req) chunks.push(chunk);
// //   const raw = Buffer.concat(chunks).toString();
// //   return JSON.parse(raw || "{}");
// // }

// // /** Get Microsoft Graph access token (Application flow) */
// // async function getMsGraphAccessToken() {
// //   const tenantId = process.env.VITE_TENANT_ID;
// //   const clientId = process.env.VITE_CLIENT_ID;
// //   const clientSecret = process.env.VITE_CLIENT_SECRET;

// //   if (!tenantId || !clientId || !clientSecret) {
// //     return null; // missing config => use mock mode
// //   }

// //   const res = await fetch(
// //     `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`,
// //     {
// //       method: "POST",
// //       headers: { "Content-Type": "application/x-www-form-urlencoded" },
// //       body: new URLSearchParams({
// //         client_id: clientId,
// //         client_secret: clientSecret,
// //         scope: "https://graph.microsoft.com/.default",
// //         grant_type: "client_credentials",
// //       }),
// //     }
// //   );

// //   const data = await res.json();
// //   if (!res.ok || !data.access_token) {
// //     console.error("❌ Failed to fetch MS Graph token:", data);
// //     return null;
// //   }
// //   return data.access_token;
// // }

// // /** Send email via Microsoft Graph (or mock if missing env) */
// // async function sendOtpEmail({ to, otp }) {
// //   const senderEmail = process.env.VITE_SENDER_EMAIL;
// //   const accessToken = await getMsGraphAccessToken();

// //   // Mock mode if we can't send real email (useful for local/dev)
// //   if (!accessToken || !senderEmail) {
// //     console.log(`📧 [MOCK EMAIL] To: ${to} | OTP: ${otp}`);
// //     return { ok: true, mock: true };
// //   }

// //   const messageBody = {
// //     message: {
// //       subject: "Your One-Time Password (OTP) – careercast",
// //       body: {
// //         contentType: "HTML",
// //         content: `
// //           <div style="font-family: Arial; line-height:1.6;">
// //             <h2 style="color:#0078D4;margin:0 0 8px;">careercast OTP Verification</h2>
// //             <p>Your OTP for verification is:</p>
// //             <h1 style="letter-spacing:2px;margin:8px 0 12px;">${otp}</h1>
// //             <p>This OTP is valid for <strong>10 minutes</strong>.</p>
// //             <p style="margin-top:16px;">Best regards,<br/>careercast Team</p>
// //           </div>
// //         `,
// //       },
// //       toRecipients: [{ emailAddress: { address: to } }],
// //     },
// //     saveToSentItems: false,
// //   };

// //   const res = await fetch(
// //     `https://graph.microsoft.com/v1.0/users/${senderEmail}/sendMail`,
// //     {
// //       method: "POST",
// //       headers: {
// //         Authorization: `Bearer ${accessToken}`,
// //         "Content-Type": "application/json",
// //       },
// //       body: JSON.stringify(messageBody),
// //     }
// //   );

// //   if (!res.ok) {
// //     const text = await res.text();
// //     console.error("❌ Graph sendMail error:", text);
// //     return { ok: false, error: text };
// //   }
// //   return { ok: true };
// // }

// // /** Create CORS headers */
// // function setCors(res) {
// //   res.setHeader("Access-Control-Allow-Origin", "*");
// //   res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
// //   res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
// //   res.setHeader("Content-Type", "application/json");
// // }

// // /** Main handler */
// // export default async function handler(req, res) {
// //   setCors(res);

// //   if (req.method === "OPTIONS") return res.status(200).end();
// //   if (req.method !== "POST") {
// //     return res.status(405).json({
// //       error: "Method not allowed",
// //       allowed: ["POST"],
// //       received: req.method,
// //     });
// //   }

// //   // Parse body
// //   let body;
// //   try {
// //     body = await parseJSONBody(req);
// //   } catch (e) {
// //     return res.status(400).json({
// //       error: "Invalid JSON in request body",
// //       details: e?.message || "JSON.parse failed",
// //     });
// //   }

// //   const { email, otp, action } = body || {};
// //   if (!email || !action) {
// //     return res.status(400).json({ error: "Email and action are required" });
// //   }
// //   if (!isEmail(email)) {
// //     return res.status(400).json({ error: "Invalid email format" });
// //   }

// //   // Configuration
// //   const OTP_TTL_MS = minutes(10);
// //   const RESEND_COOLDOWN_MS = 30 * 1000; // prevent spamming (30s)

// //   /** ACTION: SEND */
// //   if (action === "send") {
// //     // Rate limit per email
// //     const existing = otpStore.get(email);
// //     if (existing && now() - (existing.lastSentAt || 0) < RESEND_COOLDOWN_MS) {
// //       const waitMs = RESEND_COOLDOWN_MS - (now() - existing.lastSentAt);
// //       return res.status(429).json({
// //         error: "Too many requests",
// //         message: `Please wait ${Math.ceil(waitMs / 1000)}s before requesting a new OTP.`,
// //       });
// //     }

// //     const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
// //     const expiresAt = now() + OTP_TTL_MS;

// //     // Save in memory
// //     otpStore.set(email, { otp: generatedOtp, expiresAt, lastSentAt: now() });

// //     // Send email (or mock)
// //     const sent = await sendOtpEmail({ to: email, otp: generatedOtp });
// //     if (!sent.ok) {
// //       // cleanup on failure so user can retry
// //       otpStore.delete(email);
// //       return res.status(500).json({
// //         error: "Failed to send OTP email",
// //         details: sent.error || "Unknown email send error",
// //       });
// //     }

// //     console.log(`📨 OTP ${generatedOtp} sent to ${email} (expires in 10 mins)`);

// //     return res.status(200).json({
// //       success: true,
// //       message: sent.mock
// //         ? "OTP generated (mock mode). Check server logs in development."
// //         : "OTP sent successfully.",
// //       // developmentOtp: generatedOtp, // uncomment ONLY in dev if you want to show it
// //     });
// //   }

// //   /** ACTION: VERIFY */
// //   if (action === "verify") {
// //     if (!otp) {
// //       return res.status(400).json({ error: "OTP is required for verification" });
// //     }

// //     const record = otpStore.get(email);
// //     if (!record) {
// //       return res.status(400).json({
// //         success: false,
// //         message: "OTP not found or expired. Please request a new OTP.",
// //       });
// //     }

// //     if (now() > record.expiresAt) {
// //       otpStore.delete(email);
// //       return res.status(400).json({ success: false, message: "OTP expired. Please request a new one." });
// //     }

// //     if (record.otp !== String(otp)) {
// //       return res.status(400).json({ success: false, message: "Invalid OTP" });
// //     }

// //     // Success → clear it
// //     otpStore.delete(email);
// //     return res.status(200).json({ success: true, message: "OTP verified successfully" });
// //   }

// //   // Unknown action
// //   return res.status(400).json({ error: "Invalid action. Use 'send' or 'verify'." });
// // }

// api/send-otp.js
import fetch from "node-fetch";

// Temporary in-memory store
const otpStore = new Map();

const now = () => Date.now();
const minutes = (n) => n * 60 * 1000;

function setCors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Content-Type", "application/json");
}

export default async function handler(req, res) {
  setCors(res);

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  // Parse request body
  let body;
  try {
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    body = JSON.parse(Buffer.concat(chunks).toString());
  } catch (err) {
    return res.status(400).json({ error: "Invalid JSON", details: err.message });
  }

  const { action, email, otp } = body;
  if (!action || !email)
    return res.status(400).json({ error: "Missing required fields" });

  // 📤 ACTION: SEND
  if (action === "send") {
    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = now() + minutes(10);

    otpStore.set(email, { otp: generatedOtp, expiresAt });
    console.log(`📧 Sending OTP ${generatedOtp} to ${email}`);

    // Fetch Microsoft Graph Access Token
    const tenantId = process.env.VITE_TENANT_ID;
    const clientId = process.env.VITE_CLIENT_ID;
    const clientSecret = process.env.VITE_CLIENT_SECRET;
    const senderEmail = process.env.VITE_SENDER_EMAIL;

    try {
      const tokenRes = await fetch(
        `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`,
        {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({
            client_id: clientId,
            client_secret: clientSecret,
            scope: "https://graph.microsoft.com/.default",
            grant_type: "client_credentials",
          }),
        }
      );
      const tokenData = await tokenRes.json();
      if (!tokenData.access_token)
        throw new Error("Failed to obtain Microsoft Graph token");

      const accessToken = tokenData.access_token;

      const mailRes = await fetch(
        `https://graph.microsoft.com/v1.0/users/${senderEmail}/sendMail`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: {
              subject: "Your One-Time Password (OTP) – NetworkNote",
              body: {
                contentType: "HTML",
                content: `
                  <div style="font-family:Arial;line-height:1.6;">
                    <h2 style="color:#0078D4;">NetworkNote OTP Verification</h2>
                    <p>Your OTP for verification is:</p>
                    <h1>${generatedOtp}</h1>
                    <p>This OTP is valid for 10 minutes.</p>
                    <p>Best regards,<br/>careercast Team</p>
                  </div>
                `,
              },
              toRecipients: [{ emailAddress: { address: email } }],
            },
            saveToSentItems: false,
          }),
        }
      );

      if (!mailRes.ok) {
        const text = await mailRes.text();
        throw new Error(`Email send failed: ${text}`);
      }

      return res.status(200).json({
        success: true,
        message: "OTP sent successfully",
      });
    } catch (err) {
      console.error("Error sending OTP:", err);
      return res.status(500).json({ error: "Failed to send OTP", details: err.message });
    }
  }

  // ✅ ACTION: VERIFY
  if (action === "verify") {
    const record = otpStore.get(email);
    if (!record)
      return res.status(400).json({ success: false, message: "OTP not found or expired" });

    if (now() > record.expiresAt) {
      otpStore.delete(email);
      return res.status(400).json({ success: false, message: "OTP expired" });
    }

    if (record.otp !== otp)
      return res.status(400).json({ success: false, message: "Invalid OTP" });

    otpStore.delete(email);
    return res.status(200).json({ success: true, message: "OTP verified successfully" });
  }

  return res.status(400).json({ error: "Invalid action" });
}




