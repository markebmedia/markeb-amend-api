import table from '../../../lib/airtable';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Only POST requests allowed' });
  }

  const { propertyAddress, amendDetails, clientName, mediaType } = req.body;

  if (!propertyAddress || !amendDetails || !clientName) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    const createdRecord = await table.create({
      'Property Address': propertyAddress,
      'Amendment Requested': amendDetails,
      'Client Name': clientName,
      'Media Type': mediaType || '',
    });

    res.status(200).json({ message: 'Request submitted', id: createdRecord.id });
  } catch (error) {
    console.error('Error creating Airtable record:', error);
    res.status(500).json({ message: 'Failed to submit amend request' });
  }
}
