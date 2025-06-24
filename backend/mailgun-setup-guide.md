# 📬 Mailgun Inbound Email Webhook Setup (No Custom Domain)

This guide walks you through setting up **Mailgun to receive emails** and forward them to your **Vercel (or Railway) backend** using a **sandbox domain**, no custom domain required. Perfect for hobby projects or up to 4 trusted senders.

---

## ✅ 1. Create Mailgun Account & Get Sandbox Domain

1. Go to [https://mailgun.com](https://mailgun.com) and create a free account.
2. Go to **Sending > Domains**
3. You’ll see a default domain like:

```
sandbox12345.mailgun.org
```

4. Copy this domain name. You'll use it to receive emails.

---

## ⚙️ 2. Create Inbound Route to Webhook

In the Mailgun dashboard:

- Go to **Receiving > Routes**
- Click **"Create Route"**
- Fill in:

```
Filter Expression:
match_recipient(".*@sandbox12345.mailgun.org")

Actions:
forward("https://your-app.vercel.app/api/webhooks/email")

Priority:
1
```

- Enable **"Store and notify"** (optional for debugging)
- Click **"Create Route"**

This will POST the full email data to your backend.

---

## 📧 3. Authorize Senders (One-Time Setup per Address)

Mailgun sandbox domains only accept mail from **authorized email addresses**.

1. Go to **Receiving > Authorized Recipients**
2. Click **"Add Recipient"**
3. Enter each sender’s email address (e.g. `your@gmail.com`)
4. Confirm via email (must click a confirmation link)

➡️ You can authorize up to **4 senders** on the free plan.

---

## 🧪 4. Send a Test Email

Once your sender is authorized, send an email:

- To: `anything@sandbox12345.mailgun.org`
- From: your authorized address
- Subject: `Test Email`
- Body: `Hello from Mailgun`

This should trigger a webhook call to your backend.

---

## 🧰 5. Handle Incoming Emails in Your Backend

Here’s a basic Vercel API route to handle Mailgun’s webhook:

```ts
// /api/webhooks/email.ts

import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { sender, subject, ['body-plain']: body } = req.body;

  console.log('Received email from:', sender);
  console.log('Subject:', subject);
  console.log('Body:', body);

  // TODO: Handle the email content here

  return res.status(200).send('Email received');
}
```