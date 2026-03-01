import { supabase } from '../lib/supabase';
import { Routine, ScheduledDay } from '../types';

export const supabaseService = {
  /**
   * Fetches all user data (routines and schedule).
   */
  async getUserData() {
    if (!supabase) return null;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('user_data')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows found"
      console.error('Error fetching user data:', error);
      return null;
    }

    return data;
  },

  /**
   * Saves or updates user data.
   */
  async saveUserData(routines: Routine[], schedule: ScheduledDay[]) {
    if (!supabase) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('user_data')
      .upsert({
        user_id: user.id,
        routines,
        schedule,
        updated_at: new Date().toISOString()
      });

    if (error) {
      console.error('Error saving user data:', error);
      throw error;
    }
  },

  /**
   * Migrates local data to Supabase if the user is new.
   */
  async migrateLocalData(localRoutines: Routine[], localSchedule: ScheduledDay[]) {
    const existingData = await this.getUserData();
    if (!existingData) {
      await this.saveUserData(localRoutines, localSchedule);
    }
  }
};
