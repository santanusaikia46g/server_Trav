const supabase = require('../config/supabase');

const mapPackage = (data) => {
  if (!data) return null;
  return {
    ...data,
    _id: data.id,
    price: Number(data.price),
    images: Array.isArray(data.images) ? data.images : [],
    itinerary: Array.isArray(data.itinerary) ? data.itinerary : [],
    included: Array.isArray(data.included) ? data.included : [],
    excluded: Array.isArray(data.excluded) ? data.excluded : []
  };
};

const Package = {
  async find(filters = {}) {
    let req = supabase.from('packages').select('*');

    const { search, destination, maxPrice, duration } = filters;

    if (search) {
      const term = `%${search}%`;
      req = req.or(`title.ilike.${term},description.ilike.${term},destination.ilike.${term}`);
    }

    if (destination) {
      req = req.ilike('destination', `%${destination}%`);
    }

    if (maxPrice) {
      req = req.lte('price', Number(maxPrice));
    }

    if (duration) {
      req = req.ilike('duration', `%${duration}%`);
    }

    req = req.order('created_at', { ascending: false });

    const { data, error } = await req;

    if (error) {
      throw new Error(error.message);
    }
    return (data || []).map(mapPackage);
  },

  async findById(id) {
    const { data, error } = await supabase
      .from('packages')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') {
      throw new Error(error.message);
    }
    return mapPackage(data);
  },

  async create(packageData) {
    const { title, description, price, duration, destination, images, itinerary, included, excluded } = packageData;

    const insertObj = {
      title,
      description,
      price: Number(price),
      duration,
      destination,
      images: images || [],
      itinerary: itinerary || [],
      included: included || [],
      excluded: excluded || []
    };

    const { data, error } = await supabase
      .from('packages')
      .insert([insertObj])
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }
    return mapPackage(data);
  },

  async findByIdAndUpdate(id, updateData) {
    const payload = {};
    if (updateData.title !== undefined) payload.title = updateData.title;
    if (updateData.description !== undefined) payload.description = updateData.description;
    if (updateData.price !== undefined) payload.price = Number(updateData.price);
    if (updateData.duration !== undefined) payload.duration = updateData.duration;
    if (updateData.destination !== undefined) payload.destination = updateData.destination;
    if (updateData.images !== undefined) payload.images = updateData.images;
    if (updateData.itinerary !== undefined) payload.itinerary = updateData.itinerary;
    if (updateData.included !== undefined) payload.included = updateData.included;
    if (updateData.excluded !== undefined) payload.excluded = updateData.excluded;

    const { data, error } = await supabase
      .from('packages')
      .update(payload)
      .eq('id', id)
      .select()
      .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }
    return mapPackage(data);
  },

  async findByIdAndDelete(id) {
    const { data, error } = await supabase
      .from('packages')
      .delete()
      .eq('id', id)
      .select()
      .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }
    return mapPackage(data);
  },

  async count() {
    const { count, error } = await supabase
      .from('packages')
      .select('*', { count: 'exact', head: true });

    if (error) {
      throw new Error(error.message);
    }
    return count || 0;
  }
};

module.exports = Package;
