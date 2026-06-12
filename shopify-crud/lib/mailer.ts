import nodemailer from "nodemailer"

export function createTransport() {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  })
}

export async function sendVerificationCode(to: string, name: string, code: string) {
  const transporter = createTransport()
  await transporter.sendMail({
    from: `"Reech Store" <${process.env.GMAIL_USER}>`,
    to,
    subject: "Tu código de verificación – Reech Store",
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;background:#f8faff;border-radius:16px">
        <div style="text-align:center;margin-bottom:28px">
          <div style="display:inline-flex;align-items:center;justify-content:center;width:48px;height:48px;border-radius:14px;background:linear-gradient(135deg,#1d4ed8,#3b82f6)">
            <span style="color:white;font-size:22px;font-weight:bold">R</span>
          </div>
          <h2 style="margin:12px 0 4px;color:#0f172a;font-size:20px">Reech Store</h2>
        </div>
        <p style="color:#334155;font-size:15px;margin-bottom:8px">Hola <strong>${name}</strong>,</p>
        <p style="color:#64748b;font-size:14px;margin-bottom:28px">Usa este código para verificar tu correo y completar tu registro:</p>
        <div style="text-align:center;background:#ffffff;border:2px dashed #bfdbfe;border-radius:12px;padding:24px;margin-bottom:28px">
          <span style="font-size:40px;font-weight:900;letter-spacing:12px;color:#1d4ed8">${code}</span>
        </div>
        <p style="color:#94a3b8;font-size:12px;text-align:center">Este código expira en <strong>10 minutos</strong>. Si no solicitaste esto, ignora este mensaje.</p>
      </div>
    `,
  })
}
