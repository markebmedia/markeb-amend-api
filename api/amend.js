// api/amend.js
import { AirtableConnect } from '../lib/airtable';

export default async function handler(req, res) {
  /* --------------------  CORS  -------------------- */
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  /* -----------------  Only POST  ------------------ */
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  /* -----------  Extract & validate body  ---------- */
  const {
    customerName,
    email,
    trackingCode,
    amendmentType,
    amendmentDescription
  } = req.body;

  if (
    !customerName ||
    !email ||
    !trackingCode ||
    !amendmentType ||
    !amendmentDescription
  ) {
    return res.status(400).json({ message: 'Missing fields in request body' });
  }

  /* -------------  Write to Airtable  -------------- */
  try {
    const table  = AirtableConnect();               // lib/airtable.js
    const record = await table.create({
      'Customer Name':        customerName,
      Email:                  email,
      'Tracking Code':        trackingCode,
      'Amendment Type':       amendmentType,
      'Amendment Description': amendmentDescription,
      Status:                 'New'
    });

    return res.status(200).json({
      message: 'Amendment request submitted successfully',
      id:      record.id
    });
  } catch (err) {
    console.error('Error creating Airtable record:', err);
    return res.status(500).json({ message: 'Server Error' });
  }
}
