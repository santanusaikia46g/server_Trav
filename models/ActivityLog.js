const supabase = require('../config/supabase');

const mapLog = (data) => {
  if (!data) return null;
  return {
    ...data,
    _id: data.id,
    adminUsername: data.admin_username || 'Admin',
    createdAt: data.created_at || data.createdAt
  };
};

const ActivityLog = {
  async find(limit = 20) {
    const { data, error } = await supabase
      .from('activity_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      throw new Error(error.message);
    }
    return (data || []).map(mapLog);
  },

  async log(action, details, adminUsername = 'Admin') {
    const insertObj = {
      action,
      details,
      admin_username: adminUsername
    };

    const { data, error } = await supabase
      .from('activity_logs')
      .insert([insertObj])
      .select()
      .single();

    if (error) {
      console.error('Failed to log activity:', error.message);
      return null;
    }
    return mapLog(data);
  }
};

module.exports = ActivityLog;
