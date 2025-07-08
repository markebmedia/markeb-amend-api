// api/amend.js
import Airtable from 'airtable';

const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE_ID);

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

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

  let amendmentTypeArray = amendmentType;
  if (!Array.isArray(amendmentType)) {
    amendmentTypeArray = amendmentType.split(',').map(s => s.trim());
  }

  try {
    // Look up Project Address linked record from Active Bookings table by tracking code
    const matchingRecords = await base('Active Bookings')
      .select({
        filterByFormula: `{Tracking Code} = "${trackingCode}"`
      })
      .firstPage();

    if (matchingRecords.length === 0) {
      return res.status(404).json({ message: 'No matching active booking found for this tracking code' });
    }

    const projectAddressLinkedRecordId = matchingRecords[0].get('Project Address')?.[0];
    if (!projectAddressLinkedRecordId) {
      return res.status(404).json({ message: 'No linked Project Address found for this tracking code' });
    }

    // Create amend request with linked Project Address record
    const record = await base('AmendRequests').create({
      'Customer Name': customerName,
      'Email Address': email,
      'Tracking Code': trackingCode,
      'Amendment Type': amendmentTypeArray,
      'Amendment Description': amendmentDescription,
      'Project Address': [projectAddressLinkedRecordId],
      Status: 'New'
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





