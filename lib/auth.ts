import { cookies } from "next/headers";
import { NextRequest } from "next/server";
import { SignJWT, jwtVerify } from "jose";
import { prisma } from "@/lib/prisma";

const cookieName = "forgefit_token";

function getSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("JWT_SECRET must be set to at least 32 characters.");
  }
  return new TextEncoder().encode(secret);
}

export async function createToken(userId: string) {
  return new SignJWT({ sub: userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("14d")
    .sign(getSecret());
}

export async function setAuthCookie(userId: string) {
  const token = await createToken(userId);
  const store = await cookies();
  store.set(cookieName, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 14
  });
}

export async function clearAuthCookie() {
  const store = await cookies();
  store.delete(cookieName);
}

export async function getUserFromRequest(req?: NextRequest) {
  const token = req?.cookies.get(cookieName)?.value ?? (await cookies()).get(cookieName)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getSecret());
    if (!payload.sub || typeof payload.sub !== "string") return null;
    return prisma.user.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        email: true,
        name: true,
        weightKg: true,
        heightCm: true,
        goal: true,
        experienceLevel: true,
        workoutPreference: true,
        profileImageUrl: true
      }
    });
  } catch {
    return null;
  }
}
