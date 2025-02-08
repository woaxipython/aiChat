import { Friend } from '../types'

// 本地存储的键名
const FRIENDS_STORAGE_KEY = 'chat_friends'

// 保存好友列表到本地存储
export function saveFriends(friends: Friend[]) {
  localStorage.setItem(FRIENDS_STORAGE_KEY, JSON.stringify(friends))
}

// 从本地存储加载好友列表
export function loadFriends(): Friend[] {
  const savedFriends = localStorage.getItem(FRIENDS_STORAGE_KEY)
  return savedFriends ? JSON.parse(savedFriends) : []
} 