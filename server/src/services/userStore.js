import { prisma } from '../config/prisma.js';
import { newHexId } from '../utils/hexId.js';

const SAFE_USER_SELECT = {
  id: true,
  name: true,
  email: true,
  phone: true,
  role: true,
  isActive: true,
  lastLoginAt: true,
  createdAt: true,
  updatedAt: true,
};

const LOGIN_USER_SELECT = {
  ...SAFE_USER_SELECT,
  passwordHash: true,
};

const AUTH_USER_SELECT = {
  id: true,
  name: true,
  email: true,
  role: true,
  isActive: true,
  passwordChangedAt: true,
};

const PASSWORD_USER_SELECT = {
  ...SAFE_USER_SELECT,
  passwordHash: true,
  passwordChangedAt: true,
};

export async function findUserByEmail(email, { withPassword = false } = {}) {
  return prisma.user.findUnique({
    where: { email },
    select: withPassword ? LOGIN_USER_SELECT : { id: true },
  });
}

export async function findUserById(id) {
  return prisma.user.findUnique({
    where: { id },
    select: SAFE_USER_SELECT,
  });
}

export async function findActiveUserForAuth(id) {
  const user = await prisma.user.findUnique({
    where: { id },
    select: AUTH_USER_SELECT,
  });
  if (!user || !user.isActive) return null;
  return user;
}

export async function findUserForPasswordChange(id) {
  return prisma.user.findUnique({
    where: { id },
    select: PASSWORD_USER_SELECT,
  });
}

export async function emailTaken(email, excludeId) {
  const existing = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });
  if (!existing) return false;
  return existing.id !== excludeId;
}

export async function createCustomer({ name, email, phone, passwordHash }) {
  return prisma.user.create({
    data: {
      id: newHexId(),
      name,
      email,
      phone,
      passwordHash,
      role: 'customer',
    },
    select: SAFE_USER_SELECT,
  });
}

export async function touchLastLogin(id) {
  return prisma.user.update({
    where: { id },
    data: { lastLoginAt: new Date() },
    select: SAFE_USER_SELECT,
  });
}

export async function updateUserProfile(id, data) {
  return prisma.user.update({
    where: { id },
    data,
    select: SAFE_USER_SELECT,
  });
}

export async function updateUserPassword(id, passwordHash) {
  return prisma.user.update({
    where: { id },
    data: {
      passwordHash,
      passwordChangedAt: new Date(),
    },
    select: SAFE_USER_SELECT,
  });
}

export async function listAddresses(userId) {
  return prisma.address.findMany({
    where: { userId },
    orderBy: { createdAt: 'asc' },
  });
}

export async function findOwnedAddress(userId, addressId) {
  return prisma.address.findFirst({
    where: { id: addressId, userId },
  });
}

export async function createAddress(userId, payload) {
  const count = await prisma.address.count({ where: { userId } });
  const makeDefault = Boolean(payload.isDefault) || count === 0;

  return prisma.$transaction(async (tx) => {
    if (makeDefault) {
      await tx.address.updateMany({
        where: { userId },
        data: { isDefault: false },
      });
    }

    return tx.address.create({
      data: {
        id: newHexId(),
        userId,
        label: payload.label ?? 'home',
        fullName: payload.fullName,
        phone: payload.phone,
        line1: payload.line1,
        line2: payload.line2 ?? '',
        landmark: payload.landmark ?? '',
        city: payload.city,
        state: payload.state,
        pincode: payload.pincode,
        country: payload.country ?? 'India',
        isDefault: makeDefault,
      },
    });
  });
}

export async function updateAddress(userId, addressId, patch) {
  const existing = await findOwnedAddress(userId, addressId);
  if (!existing) return null;

  return prisma.$transaction(async (tx) => {
    await tx.address.update({
      where: { id: addressId },
      data: patch,
    });

    if (patch.isDefault === true) {
      await tx.address.updateMany({
        where: { userId, id: { not: addressId } },
        data: { isDefault: false },
      });
    } else {
      const defaults = await tx.address.count({ where: { userId, isDefault: true } });
      if (defaults === 0) {
        const first = await tx.address.findFirst({
          where: { userId },
          orderBy: { createdAt: 'asc' },
        });
        if (first) {
          await tx.address.update({
            where: { id: first.id },
            data: { isDefault: true },
          });
        }
      }
    }

    return tx.address.findUnique({ where: { id: addressId } });
  });
}

export async function deleteAddress(userId, addressId) {
  const existing = await findOwnedAddress(userId, addressId);
  if (!existing) return null;

  await prisma.$transaction(async (tx) => {
    await tx.address.delete({ where: { id: addressId } });
    if (existing.isDefault) {
      const first = await tx.address.findFirst({
        where: { userId },
        orderBy: { createdAt: 'asc' },
      });
      if (first) {
        await tx.address.update({
          where: { id: first.id },
          data: { isDefault: true },
        });
      }
    }
  });

  return true;
}

export async function setDefaultAddress(userId, addressId) {
  const existing = await findOwnedAddress(userId, addressId);
  if (!existing) return null;

  return prisma.$transaction(async (tx) => {
    await tx.address.updateMany({
      where: { userId, id: { not: addressId } },
      data: { isDefault: false },
    });
    return tx.address.update({
      where: { id: addressId },
      data: { isDefault: true },
    });
  });
}

export function isEmailConflict(error) {
  return error?.code === 'P2002' && Array.isArray(error?.meta?.target) && error.meta.target.includes('email');
}
