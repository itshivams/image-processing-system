import { IncomingForm } from 'formidable';
import { promises as fs } from 'fs';
import { parse } from 'csv-parse';
import supabase from '../../lib/supabase';
import { imageQueue } from '../../lib/queue';
import { v4 as uuidv4 } from 'uuid';

export const config = {
  api: {
    bodyParser: false, 
  },
};

const parseCSV = (filePath) => {
  return new Promise((resolve, reject) => {
    const records = [];
    fs.readFile(filePath, 'utf8')
      .then((data) => {
        parse(data, { columns: true, trim: true }, (err, output) => {
          if (err) reject(err);
          resolve(output);
        });
      })
      .catch((err) => reject(err));
  });
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const form = new IncomingForm(); 

  try {
    const [fields, files] = await form.parse(req);
    
    if (!files.file || files.file.length === 0) {
      return res.status(400).json({ error: 'CSV file is required' });
    }

    const file = files.file[0];
    const records = await parseCSV(file.filepath);

    const requiredColumns = ['S. No.', 'Product Name', 'Input Image Urls'];
    if (!records.length || !requiredColumns.every(col => col in records[0])) {
      return res.status(400).json({ error: `Missing required column(s)` });
    }

    const request_id = uuidv4();
    await supabase.from('requests').insert([{ id: request_id, status: 'Pending' }]);

    for (const record of records) {
      const productName = record['Product Name'];
      const inputImageUrls = record['Input Image Urls']
        .split(',')
        .map((url) => url.trim())
        .filter((url) => url);

      const { data: productData } = await supabase
        .from('products')
        .insert([{ request_id, product_name: productName, input_image_urls: inputImageUrls, status: 'Pending' }])
        .select();

      if (productData) {
        const product_id = productData[0].id;
        await imageQueue.add('process', { product_id, inputImageUrls, request_id });
      }
    }

    res.status(200).json({ request_id, message: 'Processing started' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
