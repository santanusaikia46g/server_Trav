const supabase = require('../config/supabase');

const mapPackage = (data) => {
  if (!data) return null;
  return {
    ...data,
    _id: data.id,
    price: Number(data.price),
    standard: data.standard || (data.price ? `₹${Number(data.price).toLocaleString('en-IN')}` : ''),
    deluxe: data.deluxe || '—',
    luxury: data.luxury || '—',
    image: data.image || (Array.isArray(data.images) && data.images[0]) || '',
    category: data.category || 'Standard',
    highlights: Array.isArray(data.highlights) ? data.highlights : [],
    images: Array.isArray(data.images) ? data.images : (data.image ? [data.image] : []),
    itinerary: Array.isArray(data.itinerary) ? data.itinerary : [],
    included: Array.isArray(data.included) ? data.included : [],
    excluded: Array.isArray(data.excluded) ? data.excluded : []
  };
};

const Package = {
  async find(filters = {}) {
    let req = supabase.from('packages').select('*');

    const { search, destination, category, maxPrice, duration } = filters;

    if (search) {
      const term = `%${search}%`;
      req = req.or(`title.ilike.${term},description.ilike.${term},destination.ilike.${term}`);
    }

    if (destination) {
      req = req.ilike('destination', `%${destination}%`);
    }

    if (category) {
      req = req.eq('category', category);
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
    const {
      title,
      description,
      price,
      standard,
      deluxe,
      luxury,
      duration,
      destination,
      category,
      image,
      images,
      highlights,
      itinerary,
      included,
      excluded
    } = packageData;

    const formattedPrice = Number(price);

    const insertObj = {
      title,
      description,
      price: formattedPrice,
      standard: standard || (formattedPrice ? `₹${formattedPrice.toLocaleString('en-IN')}` : ''),
      deluxe: deluxe || '—',
      luxury: luxury || '—',
      duration,
      destination,
      image: image || (images && images[0]) || '',
      images: images || (image ? [image] : []),
      highlights: highlights || [],
      itinerary: itinerary || [],
      included: included || [],
      excluded: excluded || []
    };

    if (category) {
      insertObj.category = category;
    }

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
    if (updateData.standard !== undefined) payload.standard = updateData.standard;
    if (updateData.deluxe !== undefined) payload.deluxe = updateData.deluxe;
    if (updateData.luxury !== undefined) payload.luxury = updateData.luxury;
    if (updateData.duration !== undefined) payload.duration = updateData.duration;
    if (updateData.destination !== undefined) payload.destination = updateData.destination;
    if (updateData.category !== undefined) payload.category = updateData.category;
    if (updateData.image !== undefined) {
      payload.image = updateData.image;
      payload.images = [updateData.image];
    }
    if (updateData.images !== undefined) payload.images = updateData.images;
    if (updateData.highlights !== undefined) payload.highlights = updateData.highlights;
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
    let existing = await this.findById(id);
    if (!existing) {
      const { data } = await supabase.from('packages').select('*').eq('id', id).maybeSingle();
      if (data) existing = mapPackage(data);
    }

    if (!existing) return null;

    const { error } = await supabase
      .from('packages')
      .delete()
      .eq('id', existing.id);

    if (error) {
      throw new Error(error.message);
    }
    return existing;
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
