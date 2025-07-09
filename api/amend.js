import Airtable from 'airtable';
import table from '../lib/airtable.js'; // This is your AmendRequests table instance

// Initialize Airtable base to query other tables
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
    // Lookup project address in Active Bookings by tracking code
    const bookingRecords = await base('Active Bookings').select({
      filterByFormula: `{Tracking Code} = "${trackingCode}"`
    }).firstPage();

    if (bookingRecords.length === 0) {
      return res.status(404).json({ message: 'No booking found for this tracking code' });
    }

    const projectAddress = bookingRecords[0].get('Project Address') || '';

    // Create amend request with project address included
    const record = await table.create({
      'Customer Name': customerName,
      'Email Address': email,
      'Tracking Code': trackingCode,
      'Project Address': projectAddress,
      'Amendment Type': amendmentTypeArray,
      'Amendment Description': amendmentDescription,
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
