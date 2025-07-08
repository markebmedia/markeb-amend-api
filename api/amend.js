import Airtable from 'airtable';

const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE_ID);
const amendTable = base(process.env.AIRTABLE_AMEND_TABLE_NAME);           // e.g. 'AmendRequests'
const bookingTable = base(process.env.AIRTABLE_BOOKINGS_TABLE_NAME);     // e.g. 'Active Bookings'

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

  if (!customerName || !email || !trackingCode || !amendmentType || !amendmentDescription) {
    return res.status(400).json({ message: 'Missing fields in request body' });
  }

  // Convert amendmentType to array if needed
  let amendmentTypeArray = amendmentType;
  if (!Array.isArray(amendmentType)) {
    amendmentTypeArray = amendmentType.split(',').map(s => s.trim());
  }

  try {
    // Lookup project address from Active Bookings using tracking code
    const bookingRecords = await bookingTable.select({
      filterByFormula: `{Tracking Code} = "${trackingCode}"`
    }).firstPage();

    if (!bookingRecords.length) {
      return res.status(404).json({ message: 'Tracking code not found in Active Bookings' });
    }

    const projectAddress = bookingRecords[0].get('Project Address');

    if (!projectAddress) {
      return res.status(404).json({ message: 'Project Address not found for this tracking code' });
    }

    // Create amend request record with looked up project address
    const record = await amendTable.create({
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





