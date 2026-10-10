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
 * Fetch all students from Supabase
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
 * Fetch active buses from Supabase
 */
export async function fetchBusesFromDB() {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('buses')
      .select('*');

    if (error) {
      console.error('Supabase buses fetch error:', error);
      return null;
    }
    return data;
  } catch (err) {
    console.error('Supabase error:', err);
    return null;
  }
}

/**
 * Update student boarding verification in Supabase
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
 * Real-time GPS telematics update for driver device
 */
export async function updateBusGPSInDB(busId, lat, lng, speed = '22 km/h') {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('buses')
      .update({
        current_lat: lat,
        current_lng: lng,
        speed: speed,
      })
      .eq('id', busId);

    if (error) console.error('Supabase GPS update error:', error);
    return data;
  } catch (err) {
    console.error('Supabase GPS error:', err);
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

/**
 * Realtime Subscription for Live Student Boarding Updates
 */
export function subscribeToStudentChanges(onUpdate) {
  if (!supabase) return null;
  
  const channel = supabase
    .channel('realtime-students')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'students' }, payload => {
      if (onUpdate) onUpdate(payload);
    })
    .subscribe();

  return channel;
}

/**
 * Realtime Subscription for Bus Location GPS
 */
export function subscribeToBusGPS(onUpdate) {
  if (!supabase) return null;

  const channel = supabase
    .channel('realtime-buses')
    .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'buses' }, payload => {
      if (onUpdate) onUpdate(payload);
    })
    .subscribe();

  return channel;
}
