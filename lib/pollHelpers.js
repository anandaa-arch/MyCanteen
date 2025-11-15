const POLL_DATE_COLUMNS = ['poll_date', 'date'];
const MISSING_TABLE_CODES = new Set(['42P01', 'PGRST205']);

const isMissingColumnError = (error, column) => {
  if (!error) return false;
  if (error.code === '42703') return true;
  const details = `${error.message || ''} ${error.details || ''}`.toLowerCase();
  return details.includes('column') && details.includes(column.toLowerCase());
};

const isMissingTableError = (error, table) => {
  if (!error) return false;
  if (MISSING_TABLE_CODES.has(error.code)) return true;
  const payload = `${error.message || ''} ${error.details || ''} ${error.hint || ''}`.toLowerCase();
  return payload.includes('table') && payload.includes(table.toLowerCase());
};

const formatPollTitle = (slot, date) => {
  const capitalized = slot.charAt(0).toUpperCase() + slot.slice(1);
  return `${capitalized} Attendance - ${date}`;
};

const legacyPollFallback = (targetDate, slot) => ({
  poll: {
    id: null,
    poll_date: targetDate,
    meal_slot: slot,
    title: formatPollTitle(slot, targetDate),
    status: 'active',
    isLegacy: true,
  },
  warning: 'polls-table-missing',
});

let pollResponsesColumnCache;

export async function pollResponsesSupportsPollId(supabase) {
  if (typeof pollResponsesColumnCache === 'boolean') {
    return { supported: pollResponsesColumnCache };
  }

  const probe = await supabase
    .from('poll_responses')
    .select('poll_id')
    .limit(1);

  if (probe.error) {
    if (isMissingColumnError(probe.error, 'poll_id')) {
      pollResponsesColumnCache = false;
      return { supported: false };
    }

    return { supported: true, error: probe.error };
  }

  pollResponsesColumnCache = true;
  return { supported: true };
}

export function resetPollMetadataCache() {
  pollResponsesColumnCache = undefined;
}

export async function fetchPollsForDate(supabase, targetDate) {
  let lastMissingColumnError = null;

  for (const column of POLL_DATE_COLUMNS) {
    const selection = `id, meal_slot, title, status, ${column}`;
    const response = await supabase
      .from('polls')
      .select(selection)
      .eq(column, targetDate)
      .order('meal_slot', { ascending: true });

    if (response.error) {
      if (isMissingTableError(response.error, 'polls')) {
        return { polls: [], warning: 'polls-table-missing' };
      }

      if (isMissingColumnError(response.error, column)) {
        lastMissingColumnError = response.error;
        continue;
      }
      return { error: response.error };
    }

    const polls = (response.data || []).map((poll) => ({
      ...poll,
      poll_date: poll.poll_date || poll.date || targetDate,
    }));

    return { polls, columnUsed: column };
  }

  if (lastMissingColumnError && isMissingTableError(lastMissingColumnError, 'polls')) {
    return { polls: [], warning: 'polls-table-missing' };
  }

  return { polls: [], error: lastMissingColumnError };
}

export async function ensurePollForSlot(supabase, targetDate, slot) {
  let lastMissingColumnError = null;

  for (const column of POLL_DATE_COLUMNS) {
    const selection = 'id';
    const lookup = await supabase
      .from('polls')
      .select(selection)
      .eq(column, targetDate)
      .eq('meal_slot', slot)
      .maybeSingle();

    if (lookup.error) {
      if (isMissingTableError(lookup.error, 'polls')) {
        return legacyPollFallback(targetDate, slot);
      }

      if (isMissingColumnError(lookup.error, column)) {
        lastMissingColumnError = lookup.error;
        continue;
      }
      return { error: lookup.error };
    }

    if (lookup.data) {
      return { poll: lookup.data, columnUsed: column };
    }

    const payload = {
      meal_slot: slot,
      title: formatPollTitle(slot, targetDate),
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const insert = await supabase
      .from('polls')
      .insert([{ ...payload, [column]: targetDate }])
      .select('id')
      .single();

    if (insert.error) {
      if (isMissingTableError(insert.error, 'polls')) {
        return legacyPollFallback(targetDate, slot);
      }

      if (isMissingColumnError(insert.error, column)) {
        lastMissingColumnError = insert.error;
        continue;
      }
      return { error: insert.error };
    }

    return { poll: insert.data, columnUsed: column };
  }

  if (lastMissingColumnError && isMissingTableError(lastMissingColumnError, 'polls')) {
    return legacyPollFallback(targetDate, slot);
  }

  return { error: lastMissingColumnError || new Error('No compatible poll date column found') };
}
