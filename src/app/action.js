'use server'
import { prisma } from '../lib/prisma'

export async function getUsers() {
  try {
    const users = await prisma.user.findMany()
    return { users, error: null }
  } catch (error) {
    console.error('Error fetching users:', error)
    return { users: [], error: error.message }
  }
}