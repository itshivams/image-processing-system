import supabase from '../../../lib/supabase';

export default async function handler(req, res) {
  const { request_id } = req.query;
  
  try {
    const { data: requestData, error: requestError } = await supabase
      .from('requests')
      .select('*')
      .eq('id', request_id)
      .single();
      
    if (requestError) {
      return res.status(404).json({ error: 'Request not found' });
    }
    
    const { data: productsData, error: productsError } = await supabase
      .from('products')
      .select('*')
      .eq('request_id', request_id);
    if (productsError) {
      return res.status(500).json({ error: 'Error fetching products' });
    }
    
    res.status(200).json({
      request_id,
      status: requestData.status,
      products: productsData,
    });
    
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
