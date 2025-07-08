import { AirtableConnect } from '../../lib/airtable';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const {
    customerName,
    email,
    propertyAddress,
    amendmentType,
    amendmentDescription,
    trackingCode
  } = req.body;

  if (!customerName || !email || !propertyAddress || !amendmentType || !amendmentDescription || !trackingCode) {
    return res.status(400).json({ message: 'Missing fields in request body' });
  }

  try {
    const airtable = AirtableConnect();
    const record = await airtable.create({
      "Customer Name": customerName,
      "Email": email,
      "Property Address": propertyAddress,
      "Amendment Type": amendmentType,
      "Amendment Description": amendmentDescription,
      "Tracking Code": trackingCode,
      "Status": "New"
    });

    return res.status(200).json({ message: 'Amendment request submitted successfully', id: record.id });
  } catch (err) {
    console.error('Error creating record in Airtable:', err);
    return res.status(500).json({ message: 'Server Error' });
  }
}
