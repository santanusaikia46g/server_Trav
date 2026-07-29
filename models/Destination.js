const supabase = require('../config/supabase');

const mapDestination = (data) => {
  if (!data) return null;
  return {
    ...data,
    _id: data.id,
    bestTimeToVisit: data.bestTimeToVisit || data.best_time_to_visit
  };
};

const Destination = {
  async find(query = {}) {
    let req = supabase.from('destinations').select('*').order('name', { ascending: true });

    const { data, error } = await req;
    if (error) {
      throw new Error(error.message);
    }
    return (data || []).map(mapDestination);
  },

  async findOne({ name }) {
    const { data, error } = await supabase
      .from('destinations')
      .select('*')
      .ilike('name', name)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') {
      throw new Error(error.message);
    }
    return mapDestination(data);
  },

  async findById(id) {
    const { data, error } = await supabase
      .from('destinations')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') {
      throw new Error(error.message);
    }
    return mapDestination(data);
  },

  async create({ name, image, description, bestTimeToVisit }) {
    const insertObj = {
      name,
      image,
      description,
      best_time_to_visit: bestTimeToVisit
    };

    const { data, error } = await supabase
      .from('destinations')
      .insert([insertObj])
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }
    return mapDestination(data);
  },

  async findByIdAndUpdate(id, updateData) {
    const payload = {};
    if (updateData.name !== undefined) payload.name = updateData.name;
    if (updateData.image !== undefined) payload.image = updateData.image;
    if (updateData.description !== undefined) payload.description = updateData.description;
    if (updateData.bestTimeToVisit !== undefined) payload.best_time_to_visit = updateData.bestTimeToVisit;
    if (updateData.best_time_to_visit !== undefined) payload.best_time_to_visit = updateData.best_time_to_visit;

    const { data, error } = await supabase
      .from('destinations')
      .update(payload)
      .eq('id', id)
      .select()
      .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }
    return mapDestination(data);
  },

  async findByIdAndDelete(id) {
    let existing = await this.findById(id);
    if (!existing) {
      const { data } = await supabase
        .from('destinations')
        .select('*')
        .or(`id.eq.${id},name.eq.${id}`)
        .maybeSingle();
      if (data) existing = mapDestination(data);
    }

    if (!existing) return null;

    const { error } = await supabase
      .from('destinations')
      .delete()
      .or(`id.eq.${existing.id},name.eq.${existing.name}`);

    if (error) {
      throw new Error(error.message);
    }
    return existing;
  },

  async count() {
    const { count, error } = await supabase
      .from('destinations')
      .select('*', { count: 'exact', head: true });

    if (error) {
      throw new Error(error.message);
    }
    return count || 0;
  }
};

module.exports = Destination;
