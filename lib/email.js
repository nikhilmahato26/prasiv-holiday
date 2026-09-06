import nodemailer from 'nodemailer'
import { getSettings } from '@/lib/db'
import { isStaticMode, STATIC_SETTINGS } from '@/lib/static-data'

const BRAND = 'Prashiv Holiday'
const BRAND_LOCATION = ''
const BRAND_GRADIENT = 'linear-gradient(135deg,#16294D,#2F5490)'
const ACCENT = '#16294D'

function getTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 465,
    secure: process.env.SMTP_SECURE !== 'false',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  })
}

function esc(v) {
  return String(v ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]))
}

// Wraps body HTML in a consistent branded shell.
function shell(bodyHtml) {
  return `
  <div style="background:#f4f5f7;padding:24px 12px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif">
    <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;border:1px solid #e5e7eb">
      <div style="background:${BRAND_GRADIENT};padding:22px 28px;text-align:center">
        <span style="font-size:20px;font-weight:800;color:#fff;letter-spacing:0.02em">${BRAND}</span>
      </div>
      <div style="padding:28px">
        ${bodyHtml}
      </div>
      <div style="padding:16px 28px;border-top:1px solid #f1f2f4;text-align:center">
        <p style="color:#9ca3af;font-size:12px;margin:0">${BRAND}${BRAND_LOCATION ? ' &middot; ' + BRAND_LOCATION : ''}</p>
      </div>
    </div>
  </div>`
}

export async function sendMail({ to, subject, html, text, replyTo }) {
  const transporter = getTransporter()
  await transporter.sendMail({
    from: `"${BRAND}" <${process.env.SMTP_USER}>`,
    to,
    subject,
    html,
    ...(text ? { text } : {}),
    ...(replyTo ? { replyTo } : {}),
  })
}

export async function sendOtpEmail(to, otp) {
  await sendMail({
    to,
    subject: `Your ${BRAND} Verification Code`,
    text: `Your ${BRAND} verification code is ${otp}. It expires in 10 minutes.`,
    html: shell(`
      <h2 style="font-size:20px;font-weight:700;color:#111;margin:0 0 8px">Email Verification</h2>
      <p style="color:#6b7280;font-size:14px;line-height:1.6;margin:0 0 24px">
        Use the code below to verify your email address. It expires in <strong>10 minutes</strong>.
      </p>
      <div style="background:#EEF2F8;border-radius:12px;padding:20px;text-align:center;margin-bottom:24px">
        <span style="font-size:40px;font-weight:800;letter-spacing:10px;color:${ACCENT};font-family:monospace">${esc(otp)}</span>
      </div>
      <p style="color:#9ca3af;font-size:12px;text-align:center;margin:0">
        If you did not request this, you can safely ignore this email.
      </p>
    `),
  })
}

const TYPE_LABEL = { package: 'Package', flight: 'Flight', train: 'Train' }

export async function sendEnquiryEmail({ name, phone, email, message, package_title, destination, type }) {
  const settings = isStaticMode() ? STATIC_SETTINGS : await getSettings()
  const recipients = [settings.email, settings.email2, process.env.ENQUIRY_EMAIL].filter(Boolean)
  const to = recipients.length ? [...new Set(recipients)].join(',') : process.env.SMTP_USER
  const typeLabel = TYPE_LABEL[type] || 'Package'
  const digits = String(phone || '').replace(/\D/g, '')
  const received = new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })

  const rows = [
    ['Type', esc(typeLabel)],
    ['Name', esc(name)],
    ['Phone', `<a href="tel:+${digits}" style="color:${ACCENT};text-decoration:none;font-weight:600">${esc(phone)}</a> &nbsp;&middot;&nbsp; <a href="https://wa.me/${digits}" style="color:#25d366;text-decoration:none;font-weight:600">WhatsApp</a>`],
    email ? ['Email', `<a href="mailto:${esc(email)}" style="color:#111;text-decoration:none">${esc(email)}</a>`] : null,
    destination ? ['Destination', esc(destination)] : null,
    package_title ? ['Package', esc(package_title)] : null,
    ['Received', esc(received)],
  ].filter(Boolean)

  const tableHtml = rows.map(([k, v]) => `
    <tr>
      <td style="padding:9px 0;color:#6b7280;font-size:13px;width:110px;vertical-align:top">${k}</td>
      <td style="padding:9px 0;color:#111;font-size:14px;font-weight:600">${v}</td>
    </tr>`).join('')

  const detailsHtml = message ? `
    <p style="color:#6b7280;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;margin:22px 0 8px">Full request details</p>
    <pre style="margin:0;background:#f9fafb;border:1px solid #eef0f2;border-radius:10px;padding:14px 16px;font-family:'SF Mono',Menlo,Consolas,monospace;font-size:12.5px;line-height:1.7;color:#374151;white-space:pre-wrap;word-break:break-word">${esc(message)}</pre>` : ''

  const html = shell(`
    <div style="display:inline-block;background:#EEF2F8;color:${ACCENT};font-size:12px;font-weight:700;padding:4px 12px;border-radius:999px;margin-bottom:12px">${esc(typeLabel)} Enquiry</div>
    <h2 style="font-size:20px;font-weight:700;color:#111;margin:0 0 4px">New ${esc(typeLabel)} Enquiry</h2>
    <p style="color:#6b7280;font-size:13px;margin:0 0 18px">${package_title ? esc(package_title) : 'Website enquiry form'}</p>
    <table style="width:100%;border-collapse:collapse;border-top:1px solid #f1f2f4">${tableHtml}</table>
    ${detailsHtml}
  `)

  const text = [
    `NEW ${typeLabel.toUpperCase()} ENQUIRY`,
    ...rows.map(([k, v]) => `${k}: ${v.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/\s*(&middot;|·)\s*/g, ' | ').replace(/\s+/g, ' ').trim()}`),
    message ? `\nFull request details:\n${message}` : '',
  ].join('\n')

  await sendMail({
    to,
    subject: `New ${typeLabel} Enquiry: ${package_title || 'General'} — ${name}`,
    html,
    text,
    replyTo: email || undefined,
  })
}

export async function sendApprovalEmail(to, agencyName) {
  await sendMail({
    to,
    subject: `🎉 Your Agency has been Approved — ${BRAND}`,
    text: `Congratulations, ${agencyName}! Your agency has been approved on ${BRAND}. Log in at ${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/agency`,
    html: shell(`
      <div style="text-align:center;margin-bottom:20px">
        <div style="width:64px;height:64px;border-radius:50%;background:linear-gradient(135deg,#22c55e,#16a34a);display:inline-flex;align-items:center;justify-content:center">
          <span style="font-size:28px;color:#fff">&#10003;</span>
        </div>
      </div>
      <h2 style="font-size:22px;font-weight:800;color:#111;text-align:center;margin:0 0 12px">Application Approved!</h2>
      <p style="color:#6b7280;font-size:14px;line-height:1.6;text-align:center;margin:0 0 24px">
        Congratulations, <strong>${esc(agencyName)}</strong>! Your agency has been approved on ${BRAND}. You can now log in to your dashboard and start listing packages.
      </p>
      <div style="text-align:center">
        <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/agency"
          style="display:inline-block;padding:13px 32px;border-radius:999px;background:${BRAND_GRADIENT};color:#fff;font-weight:700;font-size:15px;text-decoration:none">
          Go to Agency Login
        </a>
      </div>
    `),
  })
}
