import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Create Supabase Client instance
export const supabase = (supabaseUrl && supabaseAnonKey)
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

/**
 * Check if Supabase connection is active
 */
export function isSupabaseConnected() {
  return Boolean(supabase);
}

/**
 * Fetch all students from Supabase (or fallback)
 */
export async function fetchStudentsFromDB() {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase fetch error:', error);
      return null;
    }
    return data;
  } catch (err) {
    console.error('Supabase connection error:', err);
    return null;
  }
}

/**
 * Update boarding verification in Supabase
 */
export async function updateBoardingInDB(studentId, confidenceScore, timestamp) {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('students')
      .update({
        status: 'BOARDED',
        boarding_time: timestamp,
        verification_status: 'VERIFIED_FACE',
        confidence_score: confidenceScore,
      })
      .eq('id', studentId);

    if (error) console.error('Supabase boarding update error:', error);
    return data;
  } catch (err) {
    console.error('Supabase update error:', err);
    return null;
  }
}

/**
 * Insert push notification into Supabase
 */
export async function insertNotificationInDB(notification) {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('notifications')
      .insert([{
        student_id: notification.studentId,
        type: notification.type,
        title: notification.title,
        message: notification.message,
      }]);

    if (error) console.error('Supabase notification insert error:', error);
    return data;
  } catch (err) {
    console.error('Supabase insert error:', err);
    return null;
  }
}
