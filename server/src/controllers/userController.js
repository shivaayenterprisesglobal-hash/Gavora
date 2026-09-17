import { toSafeAddress, toSafeUser } from '../serializers/user.js';
import {
  createAddress as createOwnedAddress,
  deleteAddress as deleteOwnedAddress,
  emailTaken,
  findUserById,
  findUserForPasswordChange,
  isEmailConflict,
  listAddresses as listOwnedAddresses,
  setDefaultAddress as setOwnedDefaultAddress,
  updateAddress as updateOwnedAddress,
  updateUserPassword,
  updateUserProfile,
} from '../services/userStore.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { setAuthCookies } from '../utils/authCookies.js';
import { hashPassword, verifyPassword } from '../utils/password.js';
import { sendCreated, sendResponse } from '../utils/sendResponse.js';

async function loadUser(id) {
  const user = await findUserById(id);
  if (!user || !user.isActive) {
    throw ApiError.unauthorized('Authentication required');
  }
  return user;
}

function addressId(req) {
  return req.params.id ?? req.params.addressId;
}

export const getProfile = asyncHandler(async (req, res) => {
  const user = await loadUser(req.user.id);
  return sendResponse(res, { message: 'Profile', data: toSafeUser(user) });
});

export const updateProfile = asyncHandler(async (req, res) => {
  const user = await loadUser(req.user.id);

  if (req.body.email && req.body.email !== user.email) {
    if (await emailTaken(req.body.email, user.id)) {
      throw ApiError.conflict('An account with this email already exists', {
        details: { email: 'already in use' },
      });
    }
  }

  const data = {};
  if (req.body.name !== undefined) data.name = req.body.name;
  if (req.body.email !== undefined) data.email = req.body.email;
  if (req.body.phone !== undefined) data.phone = req.body.phone;

  let updated;
  try {
    updated = await updateUserProfile(user.id, data);
  } catch (error) {
    if (isEmailConflict(error)) {
      throw ApiError.conflict('An account with this email already exists', {
        details: { email: 'already in use' },
      });
    }
    throw error;
  }

  return sendResponse(res, { message: 'Profile updated', data: toSafeUser(updated) });
});

export const changePassword = asyncHandler(async (req, res) => {
  const user = await findUserForPasswordChange(req.user.id);
  if (!user || !user.isActive) {
    throw ApiError.unauthorized('Authentication required');
  }

  const matches = await verifyPassword(req.body.currentPassword, user.passwordHash);
  if (!matches) {
    throw ApiError.unprocessable('Current password is incorrect', {
      details: { currentPassword: 'incorrect' },
    });
  }

  const updated = await updateUserPassword(user.id, await hashPassword(req.body.newPassword));
  setAuthCookies(res, updated.id);
  return sendResponse(res, { message: 'Password updated', data: toSafeUser(updated) });
});

export const listAddresses = asyncHandler(async (req, res) => {
  await loadUser(req.user.id);
  const addresses = await listOwnedAddresses(req.user.id);
  return sendResponse(res, {
    message: 'Addresses',
    data: addresses.map(toSafeAddress),
  });
});

export const createAddress = asyncHandler(async (req, res) => {
  await loadUser(req.user.id);
  const created = await createOwnedAddress(req.user.id, req.body);
  return sendCreated(res, { message: 'Address saved', data: toSafeAddress(created) });
});

export const updateAddress = asyncHandler(async (req, res) => {
  await loadUser(req.user.id);
  const address = await updateOwnedAddress(req.user.id, addressId(req), req.body);
  if (!address) {
    throw ApiError.notFound('Address not found');
  }
  return sendResponse(res, { message: 'Address updated', data: toSafeAddress(address) });
});

export const deleteAddress = asyncHandler(async (req, res) => {
  await loadUser(req.user.id);
  const deleted = await deleteOwnedAddress(req.user.id, addressId(req));
  if (!deleted) {
    throw ApiError.notFound('Address not found');
  }
  return sendResponse(res, { message: 'Address deleted', data: null });
});

export const setDefaultAddress = asyncHandler(async (req, res) => {
  await loadUser(req.user.id);
  const address = await setOwnedDefaultAddress(req.user.id, addressId(req));
  if (!address) {
    throw ApiError.notFound('Address not found');
  }
  return sendResponse(res, { message: 'Default address updated', data: toSafeAddress(address) });
});
