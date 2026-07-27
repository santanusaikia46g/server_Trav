const supabase = require('../config/supabase');

const mapReview = (data) => {
  if (!data) return null;
  return {
    ...data,
    _id: data.id,
    customerName: data.customer_name,
    packageTitle: data.package_title,
    rating: Number(data.rating || 5),
    comment: data.comment,
    approved: data.approved !== false,
    createdAt: data.created_at || data.createdAt
  };
};

const Review = {
  async find(filters = {}) {
    let req = supabase.from('reviews').select('*').order('created_at', { ascending: false });

    if (filters.approvedOnly) {
      req = req.eq('approved', true);
    }

    const { data, error } = await req;
    if (error) {
      throw new Error(error.message);
    }
    return (data || []).map(mapReview);
  },

  async create(reviewData) {
    const { customerName, packageTitle, rating, comment, approved } = reviewData;
    const insertObj = {
      customer_name: customerName,
      package_title: packageTitle,
      rating: Number(rating || 5),
      comment: comment,
      approved: approved !== undefined ? approved : true
    };

    const { data, error } = await supabase
      .from('reviews')
      .insert([insertObj])
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }
    return mapReview(data);
  },

  async findByIdAndUpdate(id, updateData) {
    const payload = {};
    if (updateData.approved !== undefined) payload.approved = updateData.approved;
    if (updateData.rating !== undefined) payload.rating = Number(updateData.rating);
    if (updateData.comment !== undefined) payload.comment = updateData.comment;

    const { data, error } = await supabase
      .from('reviews')
      .update(payload)
      .eq('id', id)
      .select()
      .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }
    return mapReview(data);
  },

  async findByIdAndDelete(id) {
    const { data, error } = await supabase
      .from('reviews')
      .delete()
      .eq('id', id)
      .select()
      .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }
    return mapReview(data);
  }
};

module.exports = Review;
