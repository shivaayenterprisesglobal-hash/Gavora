import mongoose from 'mongoose';

function isTransactionUnsupported(error) {
  const message = String(error?.message ?? '');
  return (
    error?.code === 20 ||
    /transaction numbers are only allowed/i.test(message) ||
    /replica set member/i.test(message) ||
    /not allowed on a standalone/i.test(message)
  );
}

/**
 * Runs `work(session)` inside a MongoDB transaction when the deployment
 * supports it (Atlas replica set). If transactions are unavailable, `work` is
 * called once with `null` so callers can fall back to atomic `findOneAndUpdate`
 * filters such as `{ stock: { $gte: quantity } }`.
 *
 * `work` is never replayed after it has already started, to avoid double
 * stock decrements if a transaction error is raised mid-flight.
 */
export async function withOptionalTransaction(work) {
  let session;
  try {
    session = await mongoose.startSession();
  } catch (error) {
    if (isTransactionUnsupported(error)) return work(null);
    throw error;
  }

  let started = false;
  try {
    let result;
    await session.withTransaction(async () => {
      started = true;
      result = await work(session);
    });
    return result;
  } catch (error) {
    if (!started && isTransactionUnsupported(error)) {
      return work(null);
    }
    throw error;
  } finally {
    await session.endSession();
  }
}

export function applySession(query, session) {
  return session ? query.session(session) : query;
}
