const supabase = require('../config/supabase');

const mapInquiry = (data) => {
  if (!data) return null;
  const pkgData = data.packages || data.package;
  let populatedPackage = null;
  if (pkgData) {
    populatedPackage = {
      ...pkgData,
      _id: pkgData.id,
      price: pkgData.price ? Number(pkgData.price) : undefined
    };
  }

  return {
    ...data,
    _id: data.id,
    packageId: populatedPackage || data.package_id || null,
    createdAt: data.created_at || data.createdAt
  };
};

const Inquiry = {
  async create({ name, email, phone, packageId, message }) {
    const insertObj = {
      name,
      email: (email || '').toLowerCase(),
      phone,
      package_id: packageId || null,
      message,
      status: 'Pending'
    };

    const { data, error } = await supabase
      .from('inquiries')
      .insert([insertObj])
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }
    return mapInquiry(data);
  },

  async findWithPackage() {
    const { data, error } = await supabase
      .from('inquiries')
      .select(`
        *,
        packages:package_id (
          id,
          title,
          price
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(error.message);
    }
    return (data || []).map(mapInquiry);
  },

  async findByIdAndUpdate(id, updateData) {
    const payload = {};
    if (updateData.status !== undefined) payload.status = updateData.status;

    const { data, error } = await supabase
      .from('inquiries')
      .update(payload)
      .eq('id', id)
      .select(`
        *,
        packages:package_id (
          id,
          title,
          price
        )
      `)
      .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }
    return mapInquiry(data);
  },

  async findByIdAndDelete(id) {
    const { data, error } = await supabase
      .from('inquiries')
      .delete()
      .eq('id', id)
      .select()
      .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }
    return mapInquiry(data);
  },

  async count() {
    const { count, error } = await supabase
      .from('inquiries')
      .select('*', { count: 'exact', head: true });

    if (error) {
      throw new Error(error.message);
    }
    return count || 0;
  }
};

module.exports = Inquiry;
