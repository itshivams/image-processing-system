import { Worker } from 'bullmq';
import IORedis from 'ioredis';
import sharp from 'sharp';
import supabase, { uploadToSupabase } from '../../lib/supabase';

const redisOptions = {
  maxRetriesPerRequest: null, 
};

const connection = new IORedis(process.env.REDIS_URL, redisOptions);

let fetch;
(async () => {
  fetch = (await import('node-fetch')).default;
})();

export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  if (!global.worker) {
    console.log('🚀 Starting BullMQ Worker inside Next.js API route...');

    global.worker = new Worker(
      'image-processing',
      async (job) => {
        while (!fetch) await new Promise((resolve) => setTimeout(resolve, 100)); 
        const { product_id, inputImageUrls, request_id } = job.data;
        const outputImageUrls = [];

        try {
          console.log(`Processing images for product ${product_id}...`);

          for (let i = 0; i < inputImageUrls.length; i++) {
            const imageUrl = inputImageUrls[i];

            const response = await fetch(imageUrl);
            if (!response.ok) throw new Error(`Failed to fetch image: ${imageUrl}`);
            const buffer = await response.buffer();

            const compressedBuffer = await sharp(buffer).jpeg({ quality: 50 }).toBuffer();

            const filePath = `compressed/${product_id}_${i}.jpg`;
            const publicUrl = await uploadToSupabase(compressedBuffer, filePath);
            outputImageUrls.push(publicUrl);
          }

          const { error: updateError } = await supabase
            .from('products')
            .update({ output_image_urls: outputImageUrls, status: 'Completed' })
            .eq('id', product_id);

          if (updateError) throw updateError;

          console.log(`✅ Processed product ${product_id} successfully!`);

          const { data: pendingProducts, error: pendingError } = await supabase
            .from('products')
            .select('id')
            .eq('request_id', request_id)
            .neq('status', 'Completed');

          if (pendingError) throw pendingError;

          if (pendingProducts.length === 0) {
            const { error: requestUpdateError } = await supabase
              .from('requests')
              .update({ status: 'Completed', completed_at: new Date().toISOString() })
              .eq('id', request_id);

            if (requestUpdateError) throw requestUpdateError;

            console.log(`🎉 All images processed for request ${request_id}`);

            if (process.env.WEBHOOK_URL) {
              await fetch(process.env.WEBHOOK_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  request_id,
                  message: 'Processing complete',
                }),
              });
              console.log(`📡 Webhook triggered for request ${request_id}`);
            }
          }

          return outputImageUrls;
        } catch (error) {
          console.error(`❌ Error processing product ${product_id}:`, error);

          await supabase.from('products').update({ status: 'Failed' }).eq('id', product_id);

          throw error;
        }
      },
      { connection }
    );

    global.worker.on('completed', (job) => {
      console.log(`✅ Job completed for product ${job.data.product_id}`);
    });

    global.worker.on('failed', (job, err) => {
      console.error(`❌ Job failed for product ${job.data.product_id}: ${err.message}`);
    });

    console.log('✅ BullMQ Worker started.');
  }

  res.status(200).json({ message: 'Worker is running' });
}
