import { ref, watch } from 'vue'
import type { Friend } from '../types'
import { saveFriends, loadFriends } from '../utils/friends'

export function useFriends() {
  const friendsList = ref<Friend[]>([])
  const selectedFriendId = ref<number | null>(null)
  
  // 加载好友列表
  function loadFriendsList() {
    friendsList.value = loadFriends()
  }
  
  // 添加好友
  function addFriend(friendName: string) {
    // 获取所有以该名称开头的好友数量
    const existingFriends = friendsList.value.map(friend => friend.name)
    let newName = friendName
    let counter = 1

    // 检查名称是否存在，如果存在则添加序号直到找到不重复的名称
    while (existingFriends.includes(newName)) {
      newName = `${friendName}-${counter}`
      counter++
    }
    
    const newFriend: Friend = {
      id: Date.now(),
      name: newName,
      description: '这是一个新的好友',
      isPinned: false,
      apiId: 'default-api',
      modelName: 'default-model'
    }
    
    friendsList.value.push(newFriend)
  }
  
  // 处理好友点击
  function handleFriendClick(friend: Friend) {
    selectedFriendId.value = friend.id
    reorderFriend(friend)
  }
  
  // 重新排序好友
  function reorderFriend(friend: Friend) {
    const currentIndex = friendsList.value.findIndex(f => f.id === friend.id)
    if (currentIndex === -1) return
    
    friendsList.value.splice(currentIndex, 1)
    
    if (friend.isPinned) {
      friendsList.value.unshift(friend)
    } else {
      const lastPinnedIndex = friendsList.value.findLastIndex(f => f.isPinned)
      friendsList.value.splice(lastPinnedIndex + 1, 0, friend)
    }
  }
  
  // 删除好友
  function deleteFriend(id: number) {
    friendsList.value = friendsList.value.filter(friend => friend.id !== id)
  }
  
  // 置顶好友
  function pinFriend(id: number) {
    const friend = friendsList.value.find(friend => friend.id === id)
    if (!friend) return
    
    friend.isPinned = !friend.isPinned
    reorderFriend(friend)
  }
  
  // 编辑好友
  function editFriend(id: number) {
    const friend = friendsList.value.find(friend => friend.id === id)
    if (friend) {
      // TODO: 实现编辑功能
    }
  }
  
  // 监听好友列表变化，自动保存
  watch(friendsList, (newList) => {
    saveFriends(newList)
  }, { deep: true })
  
  return {
    friendsList,
    selectedFriendId,
    loadFriendsList,
    addFriend,
    handleFriendClick,
    deleteFriend,
    pinFriend,
    editFriend
  }
} 