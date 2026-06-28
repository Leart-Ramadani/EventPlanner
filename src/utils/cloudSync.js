import { supabase } from '../lib/supabase.js';

export async function saveProjectToCloud(userId, projectData) {
  const { error } = await supabase
    .from('projects')
    .upsert({
      user_id: userId,
      project_name: projectData.projectName || 'Untitled Event',
      data: projectData,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' });

  if (error) throw error;
}

export async function loadProjectFromCloud(userId) {
  const { data, error } = await supabase
    .from('projects')
    .select('data')
    .eq('user_id', userId)
    .single();

  if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows
  return data?.data ?? null;
}
