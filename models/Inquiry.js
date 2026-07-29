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
    status: data.status || 'Pending',
    paymentStatus: data.payment_status || 'Pending',
    amountPaid: data.amount_paid ? Number(data.amount_paid) : 0,
    notes: data.notes || '',
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
      status: 'Pending',
      payment_status: 'Pending',
      amount_paid: 0
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
    if (updateData.paymentStatus !== undefined) payload.payment_status = updateData.paymentStatus;
    if (updateData.amountPaid !== undefined) payload.amount_paid = Number(updateData.amountPaid);
    if (updateData.notes !== undefined) payload.notes = updateData.notes;

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
    const { data: existingData } = await supabase.from('inquiries').select('*').eq('id', id).maybeSingle();
    const existing = existingData ? mapInquiry(existingData) : null;

    const { error } = await supabase
      .from('inquiries')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(error.message);
    }
    return existing || { id, _id: id };
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
