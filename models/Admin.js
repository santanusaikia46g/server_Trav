const supabase = require('../config/supabase');

const mapAdmin = (data) => {
  if (!data) return null;
  return {
    ...data,
    _id: data.id
  };
};

const Admin = {
  async findOne({ username }) {
    const { data, error } = await supabase
      .from('admins')
      .select('*')
      .eq('username', username)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') {
      throw new Error(error.message);
    }
    return mapAdmin(data);
  },

  async findById(id) {
    const { data, error } = await supabase
      .from('admins')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') {
      throw new Error(error.message);
    }
    return mapAdmin(data);
  },

  async create({ username, password }) {
    const { data, error } = await supabase
      .from('admins')
      .insert([{ username, password }])
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }
    return mapAdmin(data);
  },

  async count() {
    const { count, error } = await supabase
      .from('admins')
      .select('*', { count: 'exact', head: true });

    if (error) {
      throw new Error(error.message);
    }
    return count || 0;
  }
};

module.exports = Admin;
