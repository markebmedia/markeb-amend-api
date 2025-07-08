// api/amend.js
import table from '../lib/airtable';

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  // Extract body
  const {
    customerName,
    email,
    trackingCode,
    amendmentType,
    amendmentDescription
  } = req.body;

  // Validate required fields
  if (
    !customerName ||
    !email ||
    !trackingCode ||
    !amendmentType ||
    !amendmentDescription
  ) {
    return res.status(400).json({ message: 'Missing fields in request body' });
  }

  // Ensure amendmentType is an array for Airtable multi-select field
  let amendmentTypeArray = amendmentType;
  if (!Array.isArray(amendmentType)) {
    amendmentTypeArray = amendmentType.split(',').map(s => s.trim());
  }

  try {
    const record = await table.create({
      fields: {
        'Customer Name': customerName,
        'Email Address': email,                // Make sure field names exactly match Airtable
        'Tracking Code': trackingCode,
        'Amendment Type': amendmentTypeArray, // Multi-select expects array
        'Amendment Description': amendmentDescription, // Plain text from client
        Status: 'New'
      }
    });

    return res.status(200).json({
      message: 'Amendment request submitted successfully',
      id: record.id
    });
  } catch (err) {
    console.error('Error creating Airtable record:', err);
    return res.status(500).json({ message: 'Server Error' });
  }
}



